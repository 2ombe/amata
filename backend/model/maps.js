const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

class RouteOptimizationService {
  async optimizeRoute(params) {
    const { startPoint, waypoints, vehicleType } = params;
    
    // 1. Prepare waypoints with time windows
    const intermediates = waypoints.map(wp => ({
      location: wp.location,
      stopover: true,
      milkQuantity: wp.milkQuantity || 0
    }));
    
    // 2. Call Google Maps Directions API
    const response = await client.directions({
      params: {
        origin: startPoint,
        destination: waypoints.find(w => w.isCenter).location,
        waypoints: intermediates.filter(w => !w.isCenter),
        optimizeWaypoints: true,
        alternatives: false,
        mode: 'driving',
        avoid: ['tolls'],
        units: 'metric',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    
    // 3. Process response
    const route = response.data.routes[0];
    const optimizedWaypoints = this.processWaypointOrder(
      route.waypoint_order, 
      waypoints
    );
    
    // 4. Calculate time estimates with milk-specific constraints
    return this.calculateTimings(route, optimizedWaypoints, vehicleType);
  }

  processWaypointOrder(order, originalWaypoints) {
    const centerIndex = originalWaypoints.findIndex(w => w.isCenter);
    const center = originalWaypoints[centerIndex];
    
    const ordered = order.map(i => 
      originalWaypoints[i >= centerIndex ? i + 1 : i]
    );
    
    return [...ordered, center];
  }

  calculateTimings(route, waypoints, vehicleType) {
    const legs = route.legs;
    let currentTime = new Date();
    
    return {
      polyline: route.overview_polyline.points,
      distance: legs.reduce((sum, leg) => sum + leg.distance.value, 0),
      duration: legs.reduce((sum, leg) => sum + leg.duration.value, 0),
      waypoints: waypoints.map((wp, i) => {
        if (i === 0) {
          // Starting point
          return {
            ...wp,
            plannedTime: currentTime,
            estimatedDuration: 0
          };
        }
        
        const leg = legs[i - 1];
        const durationMs = leg.duration.value * 1000;
        
        // Add milk loading time (2 minutes per 20 liters)
        const loadingTime = Math.ceil(wp.milkQuantity / 20) * 2 * 60 * 1000;
        const totalTime = durationMs + loadingTime;
        
        const plannedTime = new Date(currentTime.getTime() + totalTime);
        currentTime = plannedTime;
        
        return {
          ...wp,
          plannedTime,
          estimatedDuration: totalTime,
          loadingDuration: loadingTime
        };
      })
    };
  }
}