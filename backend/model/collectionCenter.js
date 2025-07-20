const mongoose = require("mongoose")
const {Schema}= mongoose
const collectionCenterSchema = new Schema({
  centerId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  centerEmail:{type:String, unique:true},
  location: {
    village: { type: String, required: true },
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true }
    }
  },
  owner:{type:Schema.Types.ObjectId,ref:"User"},
  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  storageCapacity: { type: Number, required: true }, // in liters
  coolingEquipment: {
    hasCooler: { type: Boolean, default: false },
    capacity: Number,
    temperatureLogs: [{
      timestamp: { type: Date, default: Date.now },
      temperature: Number,
      recordedBy: { type: String, enum: ['sensor', 'staff'] }
    }]
  },
  status: { type: String, enum: ['open', 'closed','active'], default: 'open' },
  assignedSuppliers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Supplier' 
  }],
  assignedFarmers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Farmer' 
  }]
});

// collectionCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('CollectionCenter', collectionCenterSchema);