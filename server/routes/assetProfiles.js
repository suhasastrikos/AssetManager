const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');

// Mock data for demonstration
let assetProfiles = [];

// Get all asset profiles
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let filteredProfiles = assetProfiles;

    if (search) {
      filteredProfiles = filteredProfiles.filter(profile =>
        profile.name.toLowerCase().includes(search.toLowerCase()) ||
        profile.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredProfiles = filteredProfiles.filter(profile => profile.type === category);
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
    console.error('Get asset profiles error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch asset profiles'
    });
  }
});

// Get asset profile by ID
router.get('/:id', async (req, res) => {
  try {
    const profile = assetProfiles.find(p => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Asset profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get asset profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch asset profile'
    });
  }
});

// Create asset profile
router.post('/', async (req, res) => {
  try {
    const { name, description, type, manufacturer, model, specifications } = req.body;

    const newProfile = {
      id: Date.now().toString(),
      name,
      description,
      type,
      manufacturer,
      model,
      specifications,
      defaultAttributes: {},
      rules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    assetProfiles.push(newProfile);

    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'Asset profile created successfully'
    });
  } catch (error) {
    console.error('Create asset profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create asset profile'
    });
  }
});

// Update asset profile
router.put('/:id', async (req, res) => {
  try {
    const profileIndex = assetProfiles.findIndex(p => p.id === req.params.id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Asset profile not found'
      });
    }

    const updatedProfile = {
      ...assetProfiles[profileIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    assetProfiles[profileIndex] = updatedProfile;

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Asset profile updated successfully'
    });
  } catch (error) {
    console.error('Update asset profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update asset profile'
    });
  }
});

// Delete asset profile
router.delete('/:id', async (req, res) => {
  try {
    const profileIndex = assetProfiles.findIndex(p => p.id === req.params.id);
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Asset profile not found'
      });
    }

    assetProfiles.splice(profileIndex, 1);

    res.json({
      success: true,
      message: 'Asset profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete asset profile'
    });
  }
});

module.exports = router;