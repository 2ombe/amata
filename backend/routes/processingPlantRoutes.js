const express = require('express');
const router = express.Router();
const ProcessingPlant = require('../model/processingPlantSchema');
const MilkBatch = require('../model/milkBatchSchema');

// Get all plants
router.get('/', async (req, res) => {
  try {
    const plants = await ProcessingPlant.find()
      .sort({ name: 1 });
    res.json(plants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update plant demand forecast
router.post('/:id/demand', async (req, res) => {
  try {
    const plant = await ProcessingPlant.findByIdAndUpdate(
      req.params.id,
      { $push: { demandForecast: req.body } },
      { new: true }
    );
    res.json(plant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get batches at plant
router.get('/:id/batches', async (req, res) => {
  try {
    const batches = await MilkBatch.find({
      'destination.plantId': req.params.id,
      currentStatus: 'at_plant'
    })
    .populate('farmer', 'name')
    .sort({ expiryTime: 1 });

    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;