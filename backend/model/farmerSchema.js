const mongoose = require('mongoose');
const { Schema } = mongoose;

const farmerSchema = new Schema({
  farmerId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  contact: {
    phone: { type: String, unique:true },
    altPhone: String
  },
  location: {
    village: { type: String, required: true },
    coordinates: {
      type: { type: String, default: 'Point' },
      // coordinates: { type: [Number], required: true }
    }
  },
  paymentDetails: {
    provider: { type: String, enum: ['MTN', 'Airtel', 'Bank','cash'], required: true },
    accountNumber: { type: String, required: true }
  },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  collectionCenter: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    
  }
});

// farmerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farmer', farmerSchema);