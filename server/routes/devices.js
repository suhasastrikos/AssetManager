const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');

// Mock data for demonstration
let devices = [];

// Get all devices
router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query;
    let filteredDevices = devices;

    if (search) {
      filteredDevices = filteredDevices.filter(device =>
        device.name.toLowerCase().includes(search.toLowerCase()) ||
        device.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredDevices = filteredDevices.filter(device => device.type === type);
    }

    res.json({
      success: true,
      data: filteredDevices,
      total: filteredDevices.length,
      page: 1,
      limit: 50,
      totalPages: 1
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch devices'
    });
  }
});

// Get device by ID
router.get('/:id', async (req, res) => {
  try {
    const device = devices.find(d => d.id === req.params.id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch device'
    });
  }
});

// Create device
router.post('/', async (req, res) => {
  try {
    const { name, description, label, deviceProfileId, assetId, type } = req.body;

    const newDevice = {
      id: Date.now().toString(),
      name,
      description,
      label,
      deviceProfileId,
      assetId,
      type,
      attributes: {},
      credentials: {
        credentialsType: 'ACCESS_TOKEN',
        credentialsId: 'token_' + Date.now()
      },
      additionalInfo: {},
      isActive: true,
      lastActivityTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    devices.push(newDevice);

    res.status(201).json({
      success: true,
      data: newDevice,
      message: 'Device created successfully'
    });
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create device'
    });
  }
});

// Update device
router.put('/:id', async (req, res) => {
  try {
    const deviceIndex = devices.findIndex(d => d.id === req.params.id);
    if (deviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const updatedDevice = {
      ...devices[deviceIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    devices[deviceIndex] = updatedDevice;

    res.json({
      success: true,
      data: updatedDevice,
      message: 'Device updated successfully'
    });
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update device'
    });
  }
});

// Delete device
router.delete('/:id', async (req, res) => {
  try {
    const deviceIndex = devices.findIndex(d => d.id === req.params.id);
    if (deviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    devices.splice(deviceIndex, 1);

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete device'
    });
  }
});

module.exports = router;