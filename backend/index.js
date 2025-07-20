// backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const milkRoutes = require('./routes/milkRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const centerRoutes = require('./routes/centerRoutes');
const milkBatchRoutes = require('./routes/milkBatchRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const processingPlantRoutes = require('./routes/processingPlantRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
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
app.use('/api/collections', collectionRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/batches', milkBatchRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/plants', processingPlantRoutes);
app.use('/api/transactions', transactionRoutes);
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});