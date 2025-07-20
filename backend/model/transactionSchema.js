const mongoose = require("mongoose")
const { Schema } = mongoose;

const transactionSchema = new Schema({
  transactionId: { type: String, unique: true, required: true },
  batch: { 
    type: Schema.Types.ObjectId, 
    ref: 'MilkBatch',
    required: true 
  },
  from: {
    type: { type: String, enum: ['farmer', 'center', 'supplier', 'plant'] },
    id: { type: Schema.Types.ObjectId, refPath: 'from.model' },
    model: { type: String, enum: ['Farmer', 'CollectionCenter', 'Supplier', 'ProcessingPlant'] }
  },
  to: {
    type: { type: String, enum: ['center', 'supplier', 'plant', 'retailer', 'consumer'] },
    id: { type: Schema.Types.ObjectId, refPath: 'to.model' },
    model: { type: String, enum: ['CollectionCenter', 'Supplier', 'ProcessingPlant', 'Retailer'] }
  },
  quantity: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'mobile_money', 'bank_transfer'], 
    required: true 
  },
  paymentReference: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);