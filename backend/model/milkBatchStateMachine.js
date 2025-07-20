const mongoose = require('mongoose');
const { createMachine } = require('xstate');

const milkBatchStateMachine = createMachine({
  id: 'milkBatch',
  initial: 'collected',
  states: {
    collected: {
      on: { 
        CENTER_RECEIVE: 'at_center',
        SPOIL: 'spoiled' 
      }
    },
    at_center: {
      on: { 
        SUPPLIER_LOAD: 'in_transit',
        LOCAL_SALE: 'sold_fresh',
        SPOIL: 'spoiled' 
      }
    },
    in_transit: {
      on: { 
        PLANT_DELIVER: 'at_plant',
        RETAIL_DELIVER: 'sold_fresh',
        SPOIL: 'spoiled' 
      }
    },
    at_plant: {
      on: { 
        PROCESS: 'processed',
        SPOIL: 'spoiled' 
      }
    },
    sold_fresh: { type: 'final' },
    processed: { type: 'final' },
    spoiled: { type: 'final' }
  }
});
const milkBatchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true },
  currentStatus: { type: String, default: 'collected' },
  collectedAt: { type: Date, default: Date.now },
  // ... any other fields like centerId, weight, etc.
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