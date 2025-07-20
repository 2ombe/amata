// backend/routes/centerRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../model/user');
const CollectionCenter = require('../model/collectionCenter');

// Get all collection centers
router.get('/', async (req, res) => {
  try {
    const centers = await CollectionCenter.find()
      .select('name location contactPerson contactPhone storageCapacity coolingEquipment status')
      .sort({ name: 1 });
    res.json(centers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new collection center
router.post('/', async (req, res) => {
  try {
    // Check if owner already exists
    let owner = await User.findOne({ email: req.body.centerEmail });
    
    // If owner doesn't exist, create one
    if (!owner) {
      owner = new User({
        name: req.body.name,
        email: req.body.centerEmail,
        password: '1515', // Default password
        phone: req.body.contactPhone,
        contactPerson: req.body.contactPerson,
        isCollrctionCenter: true,
        isFarmer: false,
        isSupplier: false,
        isProccessor: false
      });
      
      await owner.save();
    }

    // Create the collection center
    const center = new CollectionCenter({
      centerId: `CNTR-${Date.now().toString().slice(-6)}`,
      name: req.body.name,
      location: {
        village: req.body.village,
        coordinates: req.body.coordinates || [0, 0] // Use provided coordinates or default
      },
      contactPerson: req.body.contactPerson,
      centerEmail: req.body.centerEmail,
      contactPhone: req.body.contactPhone,
      storageCapacity: req.body.storageCapacity,
      coolingEquipment: {
        hasCooler: req.body.hasCooler,
        capacity: req.body.hasCooler ? req.body.storageCapacity * 0.2 : 0
      },
      status: 'active',
      owner: owner._id // Reference to the owner user
    });

    const newCenter = await center.save();
    
    // Update the user with center reference if this is a new user
    if (!owner.center) {
      owner.center = newCenter._id;
      await owner.save();
    }

    res.status(201).json({
      center: newCenter,
      owner: owner // Optionally include owner info in response
    });
    
    
  } catch (err) {
    res.status(400).json({ 
      message: err.message,
      error: err.errors 
    });
    console.log(err);
    
  }
});

module.exports = router;