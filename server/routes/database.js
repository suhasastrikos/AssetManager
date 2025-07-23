const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');

// Test database connection
router.post('/test-connection', async (req, res) => {
  try {
    const { type, host, port, database, username, password, ssl } = req.body;

    // Validate required fields
    if (!type || !host || !port || !database || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required connection parameters'
      });
    }

    const config = { type, host, port, database, username, password, ssl };
    const result = await databaseManager.testConnection(config);

    res.json(result);
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Connection test failed'
    });
  }
});

// Connect to database
router.post('/connect', async (req, res) => {
  try {
    const { type, host, port, database, username, password, ssl } = req.body;

    // Validate required fields
    if (!type || !host || !port || !database || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required connection parameters'
      });
    }

    const config = { type, host, port, database, username, password, ssl };
    const connection = await databaseManager.connect(config);

    res.json({
      success: true,
      data: connection,
      message: `Successfully connected to ${type} database`
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to connect to database'
    });
  }
});

// Disconnect from database
router.post('/disconnect', async (req, res) => {
  try {
    await databaseManager.disconnect();
    res.json({
      success: true,
      message: 'Successfully disconnected from database'
    });
  } catch (error) {
    console.error('Database disconnect error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to disconnect from database'
    });
  }
});

// Get connection status
router.get('/status', (req, res) => {
  try {
    const status = databaseManager.getConnectionStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get connection status'
    });
  }
});

module.exports = router;