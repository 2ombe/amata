const mongoose = require("mongoose")
const collectionsSchema = new mongoose.Schema({
  collectionId: { type: String, unique: true, required: true },
  center: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CollectionCenter',
    required: true 
  },
  plannedDate: { type: Date, required: true },
  actualDate: Date,
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled','active'],
    default: 'pending'
  },
  batches: [{
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'MilkBatch' },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
    quantity: Number,
    quality: {
      fatContent: Number,
      acidity: Number,
      temperature: Number
    },
    collectionTime: Date,
    status: String
  }],
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier' 
  },
  route: {
    waypoints: [{
      location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
      },
      farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
      plannedTime: Date,
      actualTime: Date,
      milkQuantity: Number
    }],
    polyline: String, // Encoded route geometry
    distance: Number, // meters
    duration: Number // seconds
  },
  cooling: {
    initialTemperature: Number,
    finalTemperature: Number,
    violations: [{
      timestamp: Date,
      temperature: Number,
      duration: Number
    }]
  }
}, { timestamps: true });

// collectionSchema.index({ 'route.waypoints.location': '2dsphere' });
// collectionSchema.index({ center: 1, plannedDate: 1 });