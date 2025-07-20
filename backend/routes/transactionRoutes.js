const express = require('express');
const router = express.Router();
const Transaction = require('../model/transactionSchema');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const { farmer, center, type, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (farmer) query['from.id'] = farmer;
    if (center) query['to.id'] = center;
    if (type) query['to.type'] = type;

    const transactions = await Transaction.find(query)
      .populate('batch', 'collectionTime quantity')
      .populate('from.id', 'name')
      .populate('to.id', 'name')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.json({
      items: transactions,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction({
      transactionId: `TX-${Date.now().toString().slice(-8)}`,
      batch: req.body.batchId,
      from: {
        type: req.body.fromType,
        id: req.body.fromId
      },
      to: {
        type: req.body.toType,
        id: req.body.toId
      },
      quantity: req.body.quantity,
      pricePerLiter: req.body.price,
      totalAmount: req.body.quantity * req.body.price,
      paymentMethod: req.body.paymentMethod,
      status: 'completed'
    });

    const newTransaction = await transaction.save();
    
    // Update batch status if needed
    if (req.body.newStatus) {
      await MilkBatch.findByIdAndUpdate(
        req.body.batchId,
        { currentStatus: req.body.newStatus }
      );
    }

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;