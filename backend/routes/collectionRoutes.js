// backend/routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const Collection = require('../model/collectionCenterSchema');
const { calculateRemainingShelfLife } = require('../services/milkBatchService');
// Create collection with optimized batches
router.post('/', async (req, res) => {
  try {
    const { centerId, farmerIds } = req.body;
    
    // Get all milk batches at this center needing collection
    const batches = await MilkBatch.find({
      collectionCenter: centerId,
      status: 'at_center',
      expiryTime: { $gt: new Date() }
    });
    
    // Sort by remaining shelf life (most urgent first)
    batches.sort((a, b) => {
      const aShelfLife = calculateRemainingShelfLife(a);
      const bShelfLife = calculateRemainingShelfLife(b);
      return aShelfLife - bShelfLife;
    });
    
    // Create collection with optimized batch order
    const collection = new Collection({
      collectionId: `COL-${Date.now().toString().slice(-6)}`,
      center: centerId,
      plannedDate: new Date(),
      batches: batches.map(b => ({
        batchId: b._id,
        farmer: b.farmer,
        quantity: b.quantity,
        qualityMetrics: b.qualityMetrics
      })),
      status: 'pending'
    });
    
    const newCollection = await collection.save();
    
    // Update batches status
    await MilkBatch.updateMany(
      { _id: { $in: batches.map(b => b._id) } },
      { $set: { status: 'awaiting_transport' } }
    );
    
    res.status(201).json(newCollection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Optimize collection route
router.post('/:id/optimize-route', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('batches.farmer', 'location');
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    const optimizedRoute = await optimizeTransportation(
      collection.batches.map(b => ({ 
        location: b.farmer.location,
        milkQuantity: b.quantity 
      })),
      [supplier]
    );
    
    collection.route = optimizedRoute[0].route;
    await collection.save();
    
    res.json({
      message: 'Route optimized successfully',
      collection: collection
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all collections with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, center } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { collectionId: { $regex: search, $options: 'i' } },
        { 'center.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (center) query['center._id'] = center;

    const collections = await Collection.find(query)
      .populate('center', 'name location')
      .populate('vehicle', 'plateNumber driver')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Collection.countDocuments(query);

    res.json({
      items: collections,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single collection
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('center', 'name location contactPerson')
      .populate('vehicle', 'plateNumber driver')
      .populate('batches.farmer', 'name farmerId contact');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new collection
router.post('/', async (req, res) => {
  const collection = new Collection({
    collectionId: `COL-${Date.now()}`,
    center: req.body.center,
    plannedDate: req.body.plannedDate,
    status: 'pending'
  });

  try {
    const newCollection = await collection.save();
    res.status(201).json(newCollection);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;