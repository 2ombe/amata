// routes/milkRoutes.js

const express = require('express');
const router = express.Router();
const {
  recordCollection,
  recordTransferToSupplier,
  recordPlantDelivery
} = require('../services/milkTrackingService');
const { generateOptimalRoutes } = require('../services/routeOptimizationService');
const { isAuth } = require('../middleware/auth');

// Record milk collection from farmer
router.post('/collections',isAuth, async (req, res) => {
  try {
    const { farmerId, quantity, qualityMetrics } = req.body;
    const batch = await recordCollection(farmerId, quantity, qualityMetrics);
    res.status(201).json(batch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Transfer milk to supplier vehicle
router.post('/transfers', async (req, res) => {
  try {
    const { batchId, supplierId, staffId } = req.body;
    const batch = await recordTransferToSupplier(batchId, supplierId, staffId);
    res.json(batch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Record delivery to processing plant
router.post('/deliveries', async (req, res) => {
  try {
    const { batchId, plantId, staffId } = req.body;
    const batch = await recordPlantDelivery(batchId, plantId, staffId);
    res.json(batch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get optimized routes
router.get('/routes/optimized', async (req, res) => {
  try {
    const routes = await generateOptimalRoutes();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USSD endpoint
router.post('/ussd', async (req, res) => {
  const { phoneNumber, text } = req.body;
  const response = await handleUSSDRequest(phoneNumber, text);
  res.set('Content-Type', 'text/plain');
  res.send(response);
});

module.exports = router;