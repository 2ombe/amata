// milkTrackingService.js

/**
 * Records milk collection from farmer to collection center
 */
async function recordCollection(farmerId, quantity, qualityMetrics) {
  const farmer = await Farmer.findById(farmerId);
  if (!farmer) throw new Error('Farmer not found');
  
  const batch = new MilkBatch({
    batchId: generateBatchId(),
    farmer: farmer._id,
    collectionCenter: farmer.collectionCenter,
    quantity,
    qualityMetrics,
    currentStatus: 'collected',
    currentHandler: {
      type: 'farmer',
      userId: farmer._id,
      model: 'Farmer'
    },
    route: {
      stops: [{
        location: farmer.location.coordinates,
        type: 'collection',
        timestamp: new Date(),
        handler: farmer._id
      }]
    }
  });
  
  await batch.save();
  
  // Update collection center's expected milk
  await CollectionCenter.findByIdAndUpdate(
    farmer.collectionCenter,
    { $inc: { currentStock: quantity } }
  );
  
  return batch;
}

/**
 * Records transfer from collection center to supplier vehicle
 */
async function recordTransferToSupplier(batchId, supplierId, staffId) {
  const [batch, supplier, staff] = await Promise.all([
    MilkBatch.findById(batchId),
    Supplier.findById(supplierId),
    User.findById(staffId)
  ]);
  
  if (batch.currentStatus !== 'at_center') {
    throw new Error('Batch not at collection center');
  }
  
  if (supplier.status !== 'available') {
    throw new Error('Supplier not available');
  }
  
  // Update batch status and location
  batch.currentStatus = 'in_transit';
  batch.currentHandler = {
    type: 'driver',
    userId: supplier._id,
    model: 'Supplier'
  };
  
  // Add route stop
  const center = await CollectionCenter.findById(batch.collectionCenter);
  batch.route.stops.push({
    location: center.location.coordinates,
    type: 'transfer',
    timestamp: new Date(),
    handler: staff._id
  });
  
  // Update supplier's current load
  supplier.currentBatches.push(batch._id);
  supplier.status = 'in_transit';
  
  await Promise.all([
    batch.save(),
    supplier.save(),
    CollectionCenter.findByIdAndUpdate(
      batch.collectionCenter,
      { $inc: { currentStock: -batch.quantity } }
    )
  ]);
  
  return batch;
}

/**
 * Records delivery to processing plant
 */
async function recordPlantDelivery(batchId, plantId, staffId) {
  const [batch, plant, staff] = await Promise.all([
    MilkBatch.findById(batchId),
    ProcessingPlant.findById(plantId),
    User.findById(staffId)
  ]);
  
  if (batch.currentStatus !== 'in_transit') {
    throw new Error('Batch not in transit');
  }
  
  // Update batch status
  batch.currentStatus = 'at_plant';
  batch.currentHandler = {
    type: 'plant_staff',
    userId: staff._id,
    model: 'User'
  };
  batch.destination = {
    type: 'processing_plant',
    plantId: plant._id
  };
  
  // Add route stop
  batch.route.stops.push({
    location: plant.location.coordinates,
    type: 'processing',
    timestamp: new Date(),
    handler: staff._id
  });
  
  // Update supplier's status
  const supplier = await Supplier.findOne({ currentBatches: batch._id });
  supplier.currentBatches.pull(batch._id);
  if (supplier.currentBatches.length === 0) {
    supplier.status = 'available';
  }
  
  // Update plant's expected deliveries
  plant.expectedDeliveries.push({
    batchId: batch._id,
    expectedTime: new Date(),
    quantity: batch.quantity
  });
  plant.currentStock += batch.quantity;
  
  await Promise.all([
    batch.save(),
    supplier.save(),
    plant.save()
  ]);
  
  return batch;
}