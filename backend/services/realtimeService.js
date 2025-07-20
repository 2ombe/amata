// services/realtimeService.js
const WebSocket = require('ws');
const mongoose = require('mongoose');

function setupRealtimeUpdates(server) {
  const wss = new WebSocket.Server({ server });
  
  // Track connected clients
  const clients = new Map();
  
  wss.on('connection', (ws, req) => {
    const userId = req.url.split('=')[1]; // Simple auth for demo
    clients.set(userId, ws);
    
    ws.on('close', () => clients.delete(userId));
  });
  
  // Watch MongoDB change stream
  const milkBatchChangeStream = mongoose.connection.collection('milkbatches')
    .watch([], { fullDocument: 'updateLookup' });
  
  milkBatchChangeStream.on('change', (change) => {
    const { fullDocument } = change;
    
    // Notify relevant users
    if (fullDocument.currentHandler?.userId) {
      const client = clients.get(fullDocument.currentHandler.userId.toString());
      if (client) {
        client.send(JSON.stringify({
          type: 'batch_update',
          data: fullDocument
        }));
      }
    }
    
    // Notify collection center staff
    if (fullDocument.collectionCenter) {
      CollectionCenter.findById(fullDocument.collectionCenter)
        .then(center => {
          center.assignedStaff.forEach(staffId => {
            const client = clients.get(staffId.toString());
            if (client) {
              client.send(JSON.stringify({
                type: 'center_update',
                data: fullDocument
              }));
            }
          });
        });
    }
  });
  
  return wss;
}