const mongoose = require("mongoose")
const { Schema } = mongoose;
const milkBatchSchema = new Schema({
  batchId: { type: String, unique: true, required: true },
  farmerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Farmer',
    required: true 
  },
  collectionCenter: { 
    type: Schema.Types.ObjectId, 
    ref: 'CollectionCenter',
    required: true 
  },
  quantity: { type: Number, required: true }, // in liters
  collectionTime: { type: Date, default: Date.now },
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
    userId: { type: Schema.Types.ObjectId, refPath: 'currentHandler.model' },
    model: { type: String, enum: ['Farmer', 'User', 'Supplier'] }
  },
  // route: {
  //   stops: [{
  //     location: { 
  //       type: { type: String, default: 'Point' },
  //       coordinates: [Number]
  //     },
  //     type: { type: String, enum: ['collection', 'transfer', 'sale', 'processing'] },
  //     timestamp: Date,
  //     handler: { type: Schema.Types.ObjectId, ref: 'User' }
  //   }]
  // },
  // destination: {
  //   type: { type: String, enum: ['local_sale', 'processing_plant', 'soured_milk'] },
  //   plantId: { type: Schema.Types.ObjectId, ref: 'ProcessingPlant' },
  //   retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer' }
  // },
  // expiryTime: { type: Date },
  // pricePerLiter: { type: Number },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'partially_paid'], 
    default: 'pending' 
  }
}, { timestamps: true });

// milkBatchSchema.index({ 'route.stops.location': '2dsphere' });
// milkBatchSchema.index({ expiryTime: 1 });
// milkBatchSchema.index({ currentStatus: 1 });

module.exports = mongoose.model('MilkBatch', milkBatchSchema);