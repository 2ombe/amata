// services/routeOptimizationService.js
const vrp = require('node-vrp');

async function calculateOptimalRoute(stops, supplier) {
  // Prepare distance matrix
  const distanceMatrix = await calculateDistanceMatrix([
    supplier.currentLocation.coordinates,
    ...stops.map(s => s.location)
  ]);
  
  // Prepare VRP problem
  const problem = {
    vehicles: [{
      id: supplier._id,
      capacity: supplier.vehicle.capacity,
      startIndex: 0
    }],
    jobs: stops.map((stop, index) => ({
      id: stop.centerId,
      locationIndex: index + 1,
      delivery: [stop.milkAmount]
    })),
    distanceMatrix
  };
  
  // Solve with OR-Tools
  const solution = await vrp.solve(problem, {
    solver: 'ortools',
    minScore: 1000,
    timeWindows: {
      start: Date.now() + 30 * 60 * 1000, // 30 mins from now
      end: Date.now() + 6 * 60 * 60 * 1000 // Must complete within 6 hours
    }
  });
  
  return solution.routes[0];
}

async function calculateDistanceMatrix(locations) {
  // In production, use Google Maps Distance Matrix API
  // This is a simplified haversine implementation
  return locations.map((loc1, i) => 
    locations.map((loc2, j) => 
      i === j ? 0 : haversineDistance(loc1, loc2)
    )
  );
}

function haversineDistance([lat1, lon1], [lat2, lon2]) {
  // Implementation of haversine formula
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