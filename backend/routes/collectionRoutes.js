// backend/routes/collectionRoutes.js
const express = require('express');
const router = express.Router();
const Collection = require('../model/collectionCenterSchema');
const mongoose = require("mongoose")
const { isAuth } = require('../middleware/auth');
const User = require('../model/user');
const MilkBatchScena = require('../model/milkBatchStateMachine');

router.post('/', isAuth, async (req, res) => {
  try {
    const { farmerId, quantity, pricePerLiter, qualityMetrics } = req.body;
    
    // Get the collection center associated with the current user
    const userWithCenter = await User.findById(req.user).populate('center');
    const centerId = userWithCenter.center._id;
    
    // Find or create the current milk batch for this center
    let currentBatch = await MilkBatchScena.findOne({ 
      centerId: centerId,
      currentStatus: 'collected'
    }).sort({ collectedAt: -1 });
    
    // If no active batch exists or the last one is older than 24 hours, create new
    if (!currentBatch || (Date.now() - currentBatch.collectedAt > 24 * 60 * 60 * 1000)) {
      currentBatch = new MilkBatchScena({
        batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
        totalQuantity: 0,
        totalCost: 0,
        centerId: centerId,
        overAllQualityMatrics: {
          fatContent: 0,
          acidity: 0,
          temperatureAtCollection: 0,
          lactometerReading: 0,
          adulterationTest: false
        }
      });
    }
    
    // Calculate new total quantity and cost
    const newQuantity = currentBatch.totalQuantity + quantity;
    const newCost = currentBatch.totalCost + (quantity * pricePerLiter);
    
    // Calculate weighted average for quality metrics
    const weight = quantity / newQuantity;
    const oldWeight = currentBatch.totalQuantity / newQuantity;
    
    // Update quality metrics
    currentBatch.overAllQualityMatrics = {
      fatContent: (currentBatch.overAllQualityMatrics.fatContent * oldWeight) + (qualityMetrics.fatContent * weight),
      acidity: (currentBatch.overAllQualityMatrics.acidity * oldWeight) + (qualityMetrics.acidity * weight),
      temperatureAtCollection: (currentBatch.overAllQualityMatrics.temperatureAtCollection * oldWeight) + (qualityMetrics.temperatureAtCollection * weight),
      lactometerReading: (currentBatch.overAllQualityMatrics.lactometerReading * oldWeight) + (qualityMetrics.lactometerReading * weight),
      adulterationTest: currentBatch.overAllQualityMatrics.adulterationTest || qualityMetrics.adulterationTest
    };
    
    // Update batch totals
    currentBatch.totalQuantity = newQuantity;
    currentBatch.totalCost = newCost;
    
    // Create the collection record
    const collection = new Collection({
      batchId: currentBatch.batchNumber,
      farmerId: farmerId,
      collectionCenter: centerId,
      quantity: quantity,
      collectionTime: new Date(),
      pricePerLiter: pricePerLiter,
      qualityMetrics: qualityMetrics,
      currentStatus: 'collected',
      currentHandler: {
        type: 'center_staff',
        userId: req.user,
        model: 'User'
      }
    });
    
    // Save both records in a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      await currentBatch.save({ session });
      const newCollection = await collection.save({ session });
      await session.commitTransaction();
      
      res.status(201).json({
        collection: newCollection,
        updatedBatch: currentBatch
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
  } catch (err) {
    res.status(400).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    console.error('Collection error:', err);
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
router.get('/search', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, collectionCenter} = req.query;
    
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

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const collections = await Collection.find({})
      .populate('collectionCenter', 'name location contactPerson')
      .populate('farmerId', 'name contact')
      .skip(skip)
      .limit(limit);

    const total = await Collection.countDocuments();

    res.set('X-Total-Count', total);
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;