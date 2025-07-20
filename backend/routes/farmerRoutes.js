// backend/routes/farmerRoutes.js
const express = require('express');
const router = express.Router();
const Farmer = require('../model/farmerSchema');
const User = require('../model/user');
const collectionCenter = require('../model/collectionCenter');

// Get all farmers with search
router.get('/', async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
        { 'location.village': { $regex: search, $options: 'i' } }
      ];
    }

    const farmers = await Farmer.find(query)
      .populate('collectionCenter', 'name')
      .sort({ name: 1 });

    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new farmer
router.post('/', async (req, res) => {
  try {
    // 1. Check if farmer phone already exists as a user
    let user = await User.findOne({ phone: req.body.phone });
    
    // 2. If user doesn't exist, create a new farmer user
    if (!user) {
      user = new User({
        name: req.body.name,
        password: '1515', 
        phone: req.body.phone,
        contactPerson: req.body.name, // Using name as contact person for farmer
        isCollrctionCenter: false,
        isFarmer: true,
        isSupplier: false,
        isProccessor: false
      });
      await user.save();
    }

    // 3. Create the farmer record
    const farmer = new Farmer({
      farmerId: `FARM-${Date.now().toString().slice(-6)}`,
      name: req.body.name,
      contact: {
        phone: req.body.phone
      },
      location: {
        village: req.body.village
      },
      collectionCenter: req.user._id, // The collection center creating this farmer
      paymentDetails: {
        provider: req.body.paymentMethod,
        accountNumber: req.body.phone
      },
      user: user._id // Reference to the user account
    });

    const newFarmer = await farmer.save();

    // 4. Update the collection center's assignedFarmers array
    await collectionCenter.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { assignedFarmers: newFarmer._id } },
      { new: true }
    );

    // 5. Update the user with farmer reference if this is a new user
    // if (!user.farmer) {
    //   user.farmer = newFarmer._id;
    //   await user.save();
    // }

    res.status(201).json({
      farmer: newFarmer,
      user: { // Return limited user info
        _id: user._id,
        name: user.name,
        phone: user.phone
      }
    });
    
  } catch (err) {
    console.error('Error registering farmer:', err);
    res.status(400).json({ 
      message: err.message,
      errors: err.errors // Include validation errors if available
    });
  }
});

module.exports = router;