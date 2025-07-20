const WebSocket = require('ws');
const mongoose = require('mongoose');

class RealtimeTrackingService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    this.setupConnectionHandling();
    this.setupChangeStreams();
  }

  setupConnectionHandling() {
    this.wss.on('connection', (ws, req) => {
      const userId = this.authenticate(req);
      if (!userId) return ws.close();
      
      this.clients.set(userId, ws);
      
      ws.on('close', () => this.clients.delete(userId));
      ws.on('error', () => this.clients.delete(userId));
      
      // Send initial state
      this.sendInitialState(userId, ws);
    });
  }

  authenticate(req) {
    // Extract and validate JWT from query params
    const token = req.url.split('token=')[1];
    return verifyJWT(token)?.userId;
  }

  async sendInitialState(userId, ws) {
    const [user, activeCollections] = await Promise.all([
      User.findById(userId),
      Collection.find({
        $or: [
          { 'batches.farmer': userId },
          { vehicle: userId },
          { 'center.manager': userId }
        ],
        status: { $in: ['in_progress', 'pending'] }
      })
    ]);
    
    ws.send(JSON.stringify({
      type: 'initial_state',
      data: { user, activeCollections }
    }));
  }

  setupChangeStreams() {
    // Collection changes
    const collectionStream = Collection.watch([], { fullDocument: 'updateLookup' });
    collectionStream.on('change', change => {
      this.handleCollectionChange(change.fullDocument);
    });
    
    // Vehicle location updates
    const vehicleStream = Supplier.watch(
      [ { $match: { 'operationType': 'update', 'updateDescription.updatedFields.currentLocation': { $exists: true } } } ],
      { fullDocument: 'updateLookup' }
    );
    vehicleStream.on('change', change => {
      this.handleVehicleUpdate(change.fullDocument);
    });
  }

  handleCollectionChange(collection) {
    // Notify all involved parties
    const recipients = [
      ...collection.batches.map(b => b.farmer.toString()),
      collection.vehicle?.toString(),
      collection.center.manager?.toString()
    ].filter(Boolean);
    
    recipients.forEach(userId => {
      const client = this.clients.get(userId);
      if (client) {
        client.send(JSON.stringify({
          type: 'collection_update',
          data: collection
        }));
      }
    });
  }

  handleVehicleUpdate(vehicle) {
    // Notify collection center managers and farmers expecting collection
    const message = JSON.stringify({
      type: 'vehicle_update',
      data: {
        vehicleId: vehicle._id,
        location: vehicle.currentLocation,
        plateNumber: vehicle.vehicle.plateNumber
      }
    });
    
    // Find all active collections using this vehicle
    Collection.find({
      vehicle: vehicle._id,
      status: 'in_progress'
    }).then(collections => {
      collections.forEach(col => {
        // Notify center
        const centerClient = this.clients.get(col.center.manager.toString());
        if (centerClient) centerClient.send(message);
        
        // Notify farmers
        col.batches.forEach(batch => {
          const farmerClient = this.clients.get(batch.farmer.toString());
          if (farmerClient) farmerClient.send(message);
        });
      });
    });
  }
}