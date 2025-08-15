const mongoose = require("mongoose")
const collectionsSchema = new mongoose.Schema({
  batchId: { type: String, unique: true, required: true },
  farmerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Farmer',
    required: true 
  },
  collectionCenter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CollectionCenter',
    required: true 
  },
  quantity: { type: Number, required: true }, // in liters
  collectionTime: { type: Date, default: Date.now },
  pricePerLiter:{type:Number,required:true},
  qualityMetrics: {
    fatContent: { type: Number, min: 0, max: 100 },
    acidity: { type: Number, min: 0, max: 1 },
    temperatureAtCollection: { type: Number },
    lactometerReading: { type: Number },
    adulterationTest: { type: Boolean, default: false }
  },
  currentStatus: { 
    type: String, 
    enum: ['collected', 'at_center', 'in_transit', 'at_plant', 'sold_fresh', 'processed', 'spoiled'],
    default: 'collected'
  },
  currentHandler: {
    type: { type: String, enum: ['farmer', 'center_staff', 'driver', 'plant_staff', 'retailer'] },
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'currentHandler.model' },
    model: { type: String, enum: ['Farmer', 'User', 'Supplier'] }
  },
}, { timestamps: true });

module.exports = mongoose.model ("Collection", collectionsSchema)
// collectionSchema.index({ 'route.waypoints.location': '2dsphere' });
// collectionSchema.index({ center: 1, plannedDate: 1 });