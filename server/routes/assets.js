const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');

// Mock data for demonstration
let assets = [];

// Get all assets
router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query;
    let filteredAssets = assets;

    if (search) {
      filteredAssets = filteredAssets.filter(asset =>
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredAssets = filteredAssets.filter(asset => asset.type === type);
    }

    res.json({
      success: true,
      data: filteredAssets,
      total: filteredAssets.length,
      page: 1,
      limit: 50,
      totalPages: 1
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch assets'
    });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const asset = assets.find(a => a.id === req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch asset'
    });
  }
});

// Create asset
router.post('/', async (req, res) => {
  try {
    const { name, description, label, assetProfileId, parentAssetId, type } = req.body;

    const newAsset = {
      id: Date.now().toString(),
      name,
      description,
      label,
      assetProfileId,
      parentAssetId,
      type,
      attributes: {},
      additionalInfo: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    assets.push(newAsset);

    res.status(201).json({
      success: true,
      data: newAsset,
      message: 'Asset created successfully'
    });
  } catch (error) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create asset'
    });
  }
});

// Update asset
router.put('/:id', async (req, res) => {
  try {
    const assetIndex = assets.findIndex(a => a.id === req.params.id);
    if (assetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const updatedAsset = {
      ...assets[assetIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    assets[assetIndex] = updatedAsset;

    res.json({
      success: true,
      data: updatedAsset,
      message: 'Asset updated successfully'
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update asset'
    });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const assetIndex = assets.findIndex(a => a.id === req.params.id);
    if (assetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    assets.splice(assetIndex, 1);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete asset'
    });
  }
});

module.exports = router;