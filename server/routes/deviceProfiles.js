const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');

// Mock data for demonstration
let deviceProfiles = [];

// Get all device profiles
router.get('/', async (req, res) => {
  try {
    const { search, deviceType } = req.query;
    let filteredProfiles = deviceProfiles;

    if (search) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.name.toLowerCase().includes(search.toLowerCase()) ||
        profile.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (deviceType) {
      filteredProfiles = filteredProfiles.filter(profile => profile.deviceType === deviceType);
    }

    res.json({
      success: true,
      data: filteredProfiles,
      total: filteredProfiles.length,
      page: 1,
      limit: 50,
      totalPages: 1
    });
  } catch (error) {
    console.error('Get device profiles error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch device profiles'
    });
  }
});

// Get device profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = deviceProfiles.find(p => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Device profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get device profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch device profile'
    });
  }
});

// Create device profile
router.post('/', async (req, res) => {
  try {
    const { name, description, deviceType, manufacturer, model, firmwareVersion, transportType, specifications } = req.body;

    const newProfile = {
      id: Date.now().toString(),
      name,
      description,
      deviceType,
      manufacturer,
      model,
      firmwareVersion,
      transportType,
      specifications,
      defaultAttributes: {},
      alarmRules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    deviceProfiles.push(newProfile);

    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'Device profile created successfully'
    });
  } catch (error) {
    console.error('Create device profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create device profile'
    });
  }
});

// Update device profile
router.put('/:id', async (req, res) => {
  try {
    const profileIndex = deviceProfiles.findIndex(p => p.id === req.params.id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Device profile not found'
      });
    }

    const updatedProfile = {
      ...deviceProfiles[profileIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    deviceProfiles[profileIndex] = updatedProfile;

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Device profile updated successfully'
    });
  } catch (error) {
    console.error('Update device profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update device profile'
    });
  }
});

// Delete device profile
router.delete('/:id', async (req, res) => {
  try {
    const profileIndex = deviceProfiles.findIndex(p => p.id === req.params.id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Device profile not found'
      });
    }

    deviceProfiles.splice(profileIndex, 1);

    res.json({
      success: true,
      message: 'Device profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete device profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete device profile'
    });
  }
});

module.exports = router;