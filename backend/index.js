// backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const milkRoutes = require('./routes/milkRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const centerRoutes = require('./routes/centerRoutes');
const milkBatchRoutes = require('./routes/milkBatchRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const processingPlantRoutes = require('./routes/processingPlantRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/milkflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/milk', milkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/batches', milkBatchRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/plants', processingPlantRoutes);
app.use('/api/transactions', transactionRoutes);

// At the end of backend/index.js, replace the static file serving with:
if (process.env.NODE_ENV === 'production') {
  const setupProduction = require('./production');
  setupProduction(app);
} else {
  // Development mode - just API
  app.get('/', (req, res) => {
    res.json({ message: 'Development API Server - Frontend runs on port 3000' });
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
 
});