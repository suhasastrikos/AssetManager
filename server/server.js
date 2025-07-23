const express = require('express');
const cors = require('cors');
const databaseRoutes = require('./routes/database');
const assetProfileRoutes = require('./routes/assetProfiles');
const deviceProfileRoutes = require('./routes/deviceProfiles');
const assetRoutes = require('./routes/assets');
const deviceRoutes = require('./routes/devices');
const attributeRoutes = require('./routes/attributes');
const telemetryRoutes = require('./routes/telemetry');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/database', databaseRoutes);
app.use('/api/asset-profiles', assetProfileRoutes);
app.use('/api/device-profiles', deviceProfileRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});