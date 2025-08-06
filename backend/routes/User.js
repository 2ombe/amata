const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken, isAuth, isAdmin } = require('../middleware/auth');
const User = require('../model/user');

// Admin-only route to register new users
router.post('/register',  async (req, res) => {
  try {
    const { name, email, password, phone, role, contactPerson } = req.body;

    //Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password: bcrypt.hashSync(password, 8),
      phone,
      contactPerson,
      isAdmin: role === 'admin',
      isFarmer: role === 'farmer',
      isCollrctionCenter: role === 'collectionCenter',
      isSupplier: role === 'supplier',
      isProccessor: role === 'processor'
    });

    const createdUser = await user.save();

    res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.isAdmin ? 'admin' : 
           createdUser.isFarmer ? 'farmer' :
           createdUser.isCollrctionCenter ? 'collectionCenter' :
           createdUser.isSupplier ? 'supplier' : 'processor',
      token: generateToken(createdUser)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public route for user login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.isAdmin ? 'admin' : 
           user.isFarmer ? 'farmer' :
           user.isCollrctionCenter ? 'collectionCenter' :
           user.isSupplier ? 'supplier' : 'processor',
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile (protected route)
router.get('/profile', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;