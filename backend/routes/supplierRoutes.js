const express = require('express');
const router = express.Router();
const Supplier = require('../model/supplierSchema');
const Collection = require('../model/collectionCenterSchema');

// Transportation optimization function
async function optimizeTransportation(centers, vehicles) {
  // 1. Cluster centers by proximity (within 20km)
  const clusteredCenters = await geoCluster(centers, 20000);
  
  // 2. Assign vehicles to clusters
  const assignments = [];
  for (const cluster of clusteredCenters) {
    // Find available vehicle with sufficient capacity
    const totalMilk = cluster.reduce((sum, c) => sum + c.currentStock, 0);
    const vehicle = vehicles.find(v => 
      v.status === 'available' && 
      v.vehicle.capacity >= totalMilk
    );
    
    if (vehicle) {
      assignments.push({
        vehicleId: vehicle._id,
        centerIds: cluster.map(c => c._id),
        totalMilk
      });
    }
  }
  // Get optimized routes
router.get('/optimize-routes', async (req, res) => {
  try {
    const centers = await CollectionCenter.find({
      currentStock: { $gt: 0 },
      lastCollectionTime: { $lt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
    });
    
    const vehicles = await Supplier.find({
      status: 'available'
    });
    
    const optimizedRoutes = await optimizeTransportation(centers, vehicles);
    res.json(optimizedRoutes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper functions
async function geoCluster(points, maxDistance) {
  // Simplified clustering - in production use proper geo clustering lib
  const clusters = [];
  const visited = new Set();
  
  for (let i = 0; i < points.length; i++) {
    if (!visited.has(points[i]._id.toString())) {
      const cluster = [points[i]];
      visited.add(points[i]._id.toString());
      
      for (let j = i + 1; j < points.length; j++) {
        if (!visited.has(points[j]._id.toString())) {
          const distance = calculateDistance(
            points[i].location.coordinates,
            points[j].location.coordinates
          );
          
          if (distance <= maxDistance) {
            cluster.push(points[j]);
            visited.add(points[j]._id.toString());
          }
        }
      }
      
      clusters.push(cluster);
    }
  }
  
  return clusters;
}

function calculateDistance(coord1, coord2) {
  // Haversine distance calculation
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
  // 3. Generate optimized routes
  return Promise.all(assignments.map(async (assignment) => {
    const centers = await CollectionCenter.find({
      _id: { $in: assignment.centerIds }
    });
    
    const route = await calculateOptimalRoute(
      centers, 
      assignment.vehicleId
    );
    
    return {
      vehicleId: assignment.vehicleId,
      route,
      estimatedCollectionTime: new Date(Date.now() + 30 * 60 * 1000)
    };
  }));
}

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find()
      .sort({ 'vehicle.plateNumber': 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update supplier location
router.patch('/:id/location', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { 
        'currentLocation.coordinates': req.body.coordinates,
        'currentLocation.timestamp': new Date()
      },
      { new: true }
    );
    
    // Notify relevant collections
    const activeCollections = await Collection.find({
      vehicle: req.params.id,
      status: 'in_progress'
    }).populate('batches.farmer', 'contact.phone');

    // In real app, you would send notifications here
    console.log(`Supplier ${supplier._id} location updated. Affected collections:`, activeCollections);

    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get supplier assignments
router.get('/:id/assignments', async (req, res) => {
  try {
    const assignments = await Collection.find({
      vehicle: req.params.id,
      status: { $in: ['pending', 'in_progress'] }
    })
    .populate('center', 'name location')
    .sort({ plannedDate: 1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;