const MilkBatch = require('../model/milkBatchSchema');
const ProcessingPlant = require('../model/processingPlantSchema');

// Calculate remaining shelf life
function calculateRemainingShelfLife(batch) {
  const initialQuality = (batch.qualityMetrics.fatContent * 0.3) + 
                       ((1 - batch.qualityMetrics.acidity) * 0.7);
  
  const tempFactor = batch.temperatureLogs.reduce((sum, log) => {
    return sum + (log.temperature > 4 ? 0.1 : 0);
  }, 0);
  
  const baseShelfLife = 48; // hours at ideal conditions
  return baseShelfLife * initialQuality * (1 - tempFactor);
}

// Determine optimal milk destination
async function determineMilkDestination(batch) {
  const villageDemand = await getVillageDemand(batch.collectionCenter);
  
  if (batch.qualityMetrics.fatContent > 3.5 && villageDemand > 0) {
    return { destination: 'local_sale', priority: 1 };
  }
  
  const plantNeeds = await ProcessingPlant.findOne({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: batch.location.coordinates
        },
        $maxDistance: 50000 // 50km radius
      }
    },
    processingCapacity: { $gte: batch.quantity }
  });
  
  if (plantNeeds && batch.qualityMetrics.acidity < 0.15) {
    return { destination: plantNeeds._id, priority: 2 };
  }
  
  const hoursToExpiry = (batch.expiryTime - Date.now()) / (1000 * 60 * 60);
  if (hoursToExpiry < 12) {
    return { destination: 'soured_milk', priority: 3 };
  }
  
  return { destination: 'cooled_storage', priority: 4 };
}

// Helper function to get village demand
async function getVillageDemand(centerId) {
  const center = await CollectionCenter.findById(centerId)
    .populate('village', 'currentDemand');
  return center?.village?.currentDemand || 0;
}

module.exports = {
  calculateRemainingShelfLife,
  determineMilkDestination
};