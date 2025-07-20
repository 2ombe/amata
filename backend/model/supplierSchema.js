const mongoose = require("mongoose")
const { Schema } = mongoose;

const supplierSchema = new Schema({
  supplierId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  vehicle: {
    plateNumber: { type: String, required: true },
    capacity: { type: Number, required: true }, // in liters
    type: { type: String, enum: ['truck', 'pickup', 'motorcycle'] }
  },
  driver: {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    licenseNumber: { type: String }
  },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    timestamp: Date
  },
  assignedCenters: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'CollectionCenter' 
  }],
  currentBatches: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'MilkBatch' 
  }],
  status: { 
    type: String, 
    enum: ['available', 'in_transit', 'unloading', 'maintenance'], 
    default: 'available' 
  }
});

supplierSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Supplier', supplierSchema);