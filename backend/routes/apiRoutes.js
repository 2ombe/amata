// routes/apiRoutes.js

// Get farmer dashboard data
router.get('/farmers/:id/dashboard', async (req, res) => {
  const farmer = await Farmer.findById(req.params.id)
    .populate('collectionCenter')
    .populate({
      path: 'milkBatches',
      match: { 
        collectionTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      options: { sort: { collectionTime: -1 }, limit: 10 }
    });
  
  const stats = await MilkBatch.aggregate([
    { $match: { farmer: farmer._id } },
    { $group: {
      _id: null,
      totalLiters: { $sum: '$quantity' },
      totalEarnings: { $sum: { $multiply: ['$quantity', '$pricePerLiter'] } },
      spoiledLiters: { $sum: { $cond: [{ $eq: ['$currentStatus', 'spoiled'] }, '$quantity', 0] } }
    }}
  ]);
  
  res.json({ farmer, stats: stats[0] || {} });
});

// Get milk batch journey map
router.get('/batches/:id/journey', async (req, res) => {
  const batch = await MilkBatch.findById(req.params.id)
    .populate('farmer collectionCenter')
    .populate({
      path: 'route.stops.handler',
      select: 'name contact'
    });
  
  const journey = batch.route.stops.map(stop => ({
    location: stop.location,
    type: stop.type,
    timestamp: stop.timestamp,
    handler: stop.handler,
    address:  reverseGeocode(stop.location)
  }));
  
  res.json({ batch, journey });
});

// Get collection center dashboard
router.get('/centers/:id/dashboard', async (req, res) => {
  const [center, batches, suppliers] = await Promise.all([
    CollectionCenter.findById(req.params.id),
    MilkBatch.find({ 
      collectionCenter: req.params.id,
      currentStatus: { $in: ['at_center', 'in_transit'] }
    }).sort({ collectionTime: -1 }).limit(20),
    Supplier.find({ assignedCenters: req.params.id })
  ]);
  
  const stockLevels = await MilkBatch.aggregate([
    { $match: { collectionCenter: center._id } },
    { $group: {
      _id: '$currentStatus',
      totalLiters: { $sum: '$quantity' }
    }}
  ]);
  
  res.json({ center, batches, suppliers, stockLevels });
});