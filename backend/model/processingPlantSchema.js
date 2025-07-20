const mongoose = require("mongoose")
const { Schema } = mongoose;

const processingPlantSchema = new Schema({
  plantId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  location: {
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    },
    address: { type: String, required: true }
  },
  contact: {
    manager: { type: String, required: true },
    phone: { type: String, required: true }
  },
  processingCapacity: { type: Number, required: true }, // daily capacity in liters
  products: [{ 
    type: String, 
    enum: ['yogurt', 'cheese', 'soured_milk', 'butter', 'cream'] 
  }],
  currentStock: { type: Number, default: 0 },
  expectedDeliveries: [{
    batchId: { type: Schema.Types.ObjectId, ref: 'MilkBatch' },
    expectedTime: Date,
    quantity: Number
  }]
});

processingPlantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ProcessingPlant', processingPlantSchema);