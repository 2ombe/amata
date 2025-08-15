const mongoose = require('mongoose');


const milkBatchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true },
  currentStatus: { type: String, default: 'collected' },
  totalQuantity: { type: Number, required: true },
  totalCost:{type:Number,required:true},
  collectedAt: { type: Date, default: Date.now },
  centerId:{type:mongoose.Schema.Types.ObjectId,ref:"CollectionCenter"},
   overAllQualityMatrics: {
    fatContent: { type: Number, min: 0, max: 100 },
    acidity: { type: Number, min: 0, max: 1 },
    temperatureAtCollection: { type: Number },
    lactometerReading: { type: Number },
    adulterationTest: { type: Boolean, default: false }
  },
});

milkBatchSchema.methods.transitionState = async function (event) {
  const currentState = this.currentStatus;

  const nextState = milkBatchStateMachine.transition(currentState, event);

  if (nextState.value === currentState) {
    throw new Error(`Invalid transition from ${currentState} via ${event}`);
  }

  this.currentStatus = nextState.value;
  await this.save();
  return this;
};
const MilkBatchScena = mongoose.model('MilkBatchs', milkBatchSchema);
module.exports = MilkBatchScena;