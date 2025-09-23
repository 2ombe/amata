// backend/production.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const setupProduction = (app) => {
  const buildPath = path.join(__dirname, '..', 'frontend', 'build');
  
  if (fs.existsSync(buildPath)) {
    console.log('✅ Serving React app from:', buildPath);
    
    // Serve static files
    app.use(express.static(buildPath));
    
    // Handle client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.log('❌ Build folder not found at:', buildPath);
    console.log('💡 Run: cd frontend && npm run build');
    
    app.get('/', (req, res) => {
      res.json({
        error: 'Frontend not built',
        solution: 'Run "npm run build" in the frontend directory'
      });
    });
  }
};

module.exports = setupProduction;