class CollectionOptimizer {
  constructor() {
    this.vehicleCapacityUtilization = new Map();
    this.pendingCollections = new PriorityQueue({
      compare: (a, b) => a.urgencyScore - b.urgencyScore
    });
  }

  async initialize() {
    // Load all active collections
    const collections = await Collection.find({
      status: { $in: ['pending', 'in_progress'] }
    }).populate('center vehicle');
    
    // Initialize vehicle utilization
    collections.forEach(col => {
      if (col.vehicle) {
        const utilized = col.batches.reduce((sum, b) => sum + b.quantity, 0);
        this.vehicleCapacityUtilization.set(
          col.vehicle._id.toString(), 
          utilized
        );
      }
    });
    
    // Pre-calculate urgency scores
    const pending = await Collection.find({ status: 'pending' });
    pending.forEach(col => {
      this.pendingCollections.enqueue({
        collectionId: col._id,
        urgencyScore: this.calculateUrgency(col)
      });
    });
  }

  calculateUrgency(collection) {
    // Factors: milk quantity, quality, time since collection requested
    const hoursPending = (Date.now() - collection.createdAt) / (1000 * 60 * 60);
    const avgQuality = collection.batches.reduce(
      (sum, b) => sum + b.quality.fatContent, 0) / collection.batches.length;
    
    return (hoursPending * 0.6) + ((1 - avgQuality) * 0.4);
  }

  async optimizeCollections() {
    while (!this.pendingCollections.isEmpty()) {
      const { collectionId } = this.pendingCollections.dequeue();
      const collection = await Collection.findById(collectionId)
        .populate('center batches.farmer');
      
      // Find available vehicle
      const vehicle = await this.findOptimalVehicle(collection);
      
      if (vehicle) {
        // Calculate optimal route
        const route = await this.calculateRoute(collection, vehicle);
        
        // Update collection with vehicle and route
        collection.vehicle = vehicle._id;
        collection.route = route;
        collection.status = 'in_progress';
        
        // Update vehicle utilization
        const totalMilk = collection.batches.reduce(
          (sum, b) => sum + b.quantity, 0);
        this.vehicleCapacityUtilization.set(
          vehicle._id.toString(),
          (this.vehicleCapacityUtilization.get(vehicle._id.toString()) || 0) + totalMilk
        );
        
        await collection.save();
        
        // Notify farmers and driver
        await this.notifyParties(collection);
      } else {
        // No vehicles available, reschedule
        collection.plannedDate = new Date(Date.now() + 30 * 60 * 1000); // 30 mins later
        await collection.save();
        this.pendingCollections.enqueue({
          collectionId: collection._id,
          urgencyScore: this.calculateUrgency(collection) + 0.5 // Increased urgency
        });
      }
    }
  }

  async findOptimalVehicle(collection) {
    const center = collection.center;
    const requiredCapacity = collection.batches.reduce(
      (sum, b) => sum + b.quantity, 0);
    
    // Find vehicles within 50km radius with sufficient remaining capacity
    const vehicles = await Supplier.aggregate([
      {
        $geoNear: {
          near: center.location.coordinates,
          distanceField: "distance",
          maxDistance: 50000, // 50km
          spherical: true
        }
      },
      {
        $match: {
          status: 'available',
          'vehicle.capacity': { $gte: requiredCapacity }
        }
      },
      {
        $addFields: {
          utilizedCapacity: {
            $ifNull: [
              { $toDouble: this.vehicleCapacityUtilization.get("$_id") },
              0
            ]
          },
          remainingCapacity: {
            $subtract: ["$vehicle.capacity", "$utilizedCapacity"]
          }
        }
      },
      {
        $match: {
          remainingCapacity: { $gte: requiredCapacity }
        }
      },
      {
        $sort: {
          distance: 1,
          remainingCapacity: -1
        }
      },
      {
        $limit: 5
      }
    ]);
    
    return vehicles.length > 0 ? vehicles[0] : null;
  }

  async calculateRoute(collection, vehicle) {
    const waypoints = collection.batches.map(b => ({
      location: b.farmer.location.coordinates,
      farmer: b.farmer._id,
      milkQuantity: b.quantity
    }));
    
    // Add collection center as final destination
    waypoints.push({
      location: collection.center.location.coordinates,
      isCenter: true
    });
    
    // Use Google Maps Directions API or OSRM for actual implementation
    const optimizedRoute = await this.routeService.optimizeRoute({
      startPoint: vehicle.currentLocation.coordinates,
      waypoints,
      vehicleType: vehicle.vehicle.type
    });
    
    return {
      waypoints: optimizedRoute.waypoints,
      polyline: optimizedRoute.polyline,
      distance: optimizedRoute.distance,
      duration: optimizedRoute.duration
    };
  }

  async notifyParties(collection) {
    // Notify farmers
    await Promise.all(collection.batches.map(async batch => {
      const farmer = await Farmer.findById(batch.farmer);
      const estimatedTime = collection.route.waypoints.find(
        w => w.farmer?.toString() === batch.farmer.toString()).plannedTime;
      
      await NotificationService.send({
        userId: farmer._id,
        type: 'collection_scheduled',
        data: {
          collectionId: collection._id,
          estimatedTime,
          vehicle: collection.vehicle.plateNumber
        },
        channels: ['sms', 'push']
      });
    }));
    
    // Notify driver
    await NotificationService.send({
      userId: collection.vehicle.driver._id,
      type: 'new_assignment',
      data: {
        collectionId: collection._id,
        route: collection.route,
        totalMilk: collection.batches.reduce((sum, b) => sum + b.quantity, 0)
      },
      channels: ['app']
    });
  }
}