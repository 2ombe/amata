// services/analyticsService.js

async function identifyWastePatterns() {
  // 1. Find spoilage hotspots
  const spoilageByCenter = await MilkBatch.aggregate([
    { $match: { currentStatus: 'spoiled' } },
    { $group: {
      _id: '$collectionCenter',
      totalLiters: { $sum: '$quantity' },
      avgTimeToSpoil: { 
        $avg: { 
          $subtract: ['$expiryTime', '$collectionTime'] 
        } 
      }
    }},
    { $sort: { totalLiters: -1 } },
    { $limit: 5 }
  ]);
  
  // 2. Find common factors in spoiled batches
  const spoilageFactors = await MilkBatch.aggregate([
    { $match: { currentStatus: 'spoiled' } },
    { $group: {
      _id: null,
      avgInitialTemp: { $avg: '$qualityMetrics.temperatureAtCollection' },
      avgFatContent: { $avg: '$qualityMetrics.fatContent' },
      commonHandlers: { 
        $push: { 
          handler: '$currentHandler.userId',
          count: 1 
        } 
      }
    }},
    { $unwind: '$commonHandlers' },
    { $group: {
      _id: '$_id',
      avgInitialTemp: { $first: '$avgInitialTemp' },
      avgFatContent: { $first: '$avgFatContent' },
      handlers: { 
        $push: { 
          handler: '$commonHandlers.handler',
          count: { $sum: '$commonHandlers.count' }
        }
      }
    }},
    { $sort: { 'handlers.count': -1 } }
  ]);
  
  // 3. Find optimal routes with least spoilage
  const optimalRoutes = await MilkBatch.aggregate([
    { $match: { currentStatus: { $ne: 'spoiled' } } },
    { $group: {
      _id: '$route',
      totalBatches: { $sum: 1 },
      spoiledBatches: { 
        $sum: { 
          $cond: [{ $eq: ['$currentStatus', 'spoiled'] }, 1, 0] 
        } 
      },
      avgTransitTime: { 
        $avg: { 
          $subtract: [
            { $arrayElemAt: ['$route.stops.timestamp', -1] },
            '$collectionTime'
          ] 
        } 
      }
    }},
    { $match: { totalBatches: { $gt: 5 } } },
    { $sort: { spoiledBatches: 1, avgTransitTime: 1 } },
    { $limit: 3 }
  ]);
  
  return { spoilageByCenter, spoilageFactors, optimalRoutes };
}