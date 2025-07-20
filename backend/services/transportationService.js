const Supplier = require('../model/supplierSchema');
const CollectionCenter = require('../model/collectionCenterSchema');

// Optimize transportation routes
async function optimizeTransportation(centers, vehicles) {
  const clusteredCenters = await geoCluster(centers, 20000);
  
  const assignments = [];
  for (const cluster of clusteredCenters) {
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

// Calculate optimal route
async function calculateOptimalRoute(stops, supplierId) {
  const supplier = await Supplier.findById(supplierId);
  const waypoints = stops.map(stop => ({
    location: stop.location.coordinates,
    milkAmount: stop.currentStock
  }));
  
  // In production, integrate with Google Maps API
  return {
    waypoints: waypoints.map((wp, i) => ({
      location: wp.location,
      milkQuantity: wp.milkAmount,
      plannedTime: new Date(Date.now() + (i + 1) * 30 * 60 * 1000)
    })),
    polyline: '', // Would be encoded in production
    distance: waypoints.length * 10, // Mock distance in km
    duration: waypoints.length * 30 // Mock duration in minutes
  };
}

// Geo clustering helper
async function geoCluster(points, maxDistance) {
  // Implementation same as in supplierRoutes.js
}

module.exports = {
  optimizeTransportation,
  calculateOptimalRoute
};