const express = require('express');
const router = express.Router();
const MilkBatch = require('../model/milkBatchSchema');
const { milkBatchStateMachine } = require('../model/milkBatchStateMachine');

function calculateRemainingShelfLife(batch) {
  const initialQuality = (batch.qualityMetrics.fatContent * 0.3) + 
                       ((1 - batch.qualityMetrics.acidity) * 0.7);
  
  const tempFactor = batch.temperatureLogs.reduce((sum, log) => {
    return sum + (log.temperature > 4 ? 0.1 : 0);
  }, 0);
  
  const baseShelfLife = 48; // hours at ideal conditions
  return baseShelfLife * initialQuality * (1 - tempFactor);
}

// Determine milk destination function
async function determineMilkDestination(batch) {
  // Check local village demand first
  const villageDemand = await getVillageDemand(batch.collectionCenter);
  
  if (batch.qualityMetrics.fatContent > 3.5 && villageDemand > 0) {
    return { destination: 'local_sale', priority: 1 };
  }
  
  // Check processing plant needs
  const plantNeeds = await ProcessingPlant.findOne({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: batch.location.coordinates
        },
        $maxDistance: 50000 // 50km radius
      }
    },
    processingCapacity: { $gte: batch.quantity }
  });
  
  if (plantNeeds && batch.qualityMetrics.acidity < 0.15) {
    return { destination: plantNeeds._id, priority: 2 };
  }
  
  // Default to soured milk production if near expiry
  const hoursToExpiry = (batch.expiryTime - Date.now()) / (1000 * 60 * 60);
  if (hoursToExpiry < 12) {
    return { destination: 'soured_milk', priority: 3 };
  }
  
  // As last resort, hold in cooled storage
  return { destination: 'cooled_storage', priority: 4 };
}

// Get batch with shelf life info
router.get('/:id/shelf-life', async (req, res) => {
  try {
    const batch = await MilkBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    const remainingHours = calculateRemainingShelfLife(batch);
    const destination = await determineMilkDestination(batch);
    
    res.json({
      batchId: batch._id,
      remainingShelfLifeHours: remainingHours,
      recommendedDestination: destination,
      qualityMetrics: batch.qualityMetrics,
      temperatureHistory: batch.temperatureLogs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update batch destination based on optimization
router.post('/:id/optimize-destination', async (req, res) => {
  try {
    const batch = await MilkBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    const destination = await determineMilkDestination(batch);
    batch.destination = destination;
    
    // Recalculate expiry time based on new destination
    if (destination === 'local_sale') {
      batch.expiryTime = new Date(Date.now() + calculateRemainingShelfLife(batch) * 60 * 60 * 1000);
    }
    
    await batch.save();
    
    res.json({
      message: 'Destination optimized successfully',
      batch: batch
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Get all milk batches with filters
router.get('/', async (req, res) => {
  try {
    const { farmer, center, status, minDate, maxDate, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (farmer) query.farmer = farmer;
    if (center) query.collectionCenter = center;
    if (status) query.currentStatus = status;
    if (minDate || maxDate) {
      query.collectionTime = {};
      if (minDate) query.collectionTime.$gte = new Date(minDate);
      if (maxDate) query.collectionTime.$lte = new Date(maxDate);
    }

    const batches = await MilkBatch.find(query)
      .populate('farmer', 'name farmerId')
      .populate('collectionCenter', 'name')
      .populate('currentHandler.userId', 'name')
      .sort({ collectionTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await MilkBatch.countDocuments(query);

    res.json({
      items: batches,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update batch state
router.patch('/:id/state', async (req, res) => {
  try {
    const batch = await MilkBatch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await batch.transitionState(req.body.event);
    res.json(batch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get batch journey
router.get('/:id/journey', async (req, res) => {
  try {
    const batch = await MilkBatch.findById(req.params.id)
      .populate('route.stops.handler', 'name role');
    
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({
      batchId: batch._id,
      journey: batch.route.stops.map(stop => ({
        type: stop.type,
        timestamp: stop.timestamp,
        handler: stop.handler,
        location: stop.location
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;