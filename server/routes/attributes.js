const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');

// Mock data for demonstration
let attributes = [];

// Get attributes by entity
router.get('/', async (req, res) => {
  try {
    const { entityId, entityType, scope } = req.query;
    let filteredAttributes = attributes;

    if (entityId) {
      filteredAttributes = filteredAttributes.filter(attr => attr.entityId === entityId);
    }

    if (entityType) {
      filteredAttributes = filteredAttributes.filter(attr => attr.entityType === entityType);
    }

    if (scope) {
      filteredAttributes = filteredAttributes.filter(attr => attr.scope === scope);
    }

    res.json({
      success: true,
      data: filteredAttributes,
      total: filteredAttributes.length,
      page: 1,
      limit: 50,
      totalPages: 1
    });
  } catch (error) {
    console.error('Get attributes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch attributes'
    });
  }
});

// Save attribute
router.post('/:entityType/:entityId/:scope', async (req, res) => {
  try {
    const { entityType, entityId, scope } = req.params;
    const attributeData = req.body;

    // Remove existing attributes for this entity/scope combination
    attributes = attributes.filter(attr => 
      !(attr.entityId === entityId && attr.entityType === entityType && attr.scope === scope)
    );

    // Add new attributes
    Object.entries(attributeData).forEach(([key, value]) => {
      attributes.push({
        id: Date.now().toString() + Math.random(),
        entityId,
        entityType,
        scope,
        key,
        value,
        lastUpdateTs: Date.now()
      });
    });

    res.json({
      success: true,
      message: 'Attributes saved successfully'
    });
  } catch (error) {
    console.error('Save attribute error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save attribute'
    });
  }
});

// Delete attribute
router.delete('/:entityType/:entityId/:scope/:key', async (req, res) => {
  try {
    const { entityType, entityId, scope, key } = req.params;

    const initialLength = attributes.length;
    attributes = attributes.filter(attr => 
      !(attr.entityId === entityId && attr.entityType === entityType && 
        attr.scope === scope && attr.key === key)
    );

    if (attributes.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    res.json({
      success: true,
      message: 'Attribute deleted successfully'
    });
  } catch (error) {
    console.error('Delete attribute error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete attribute'
    });
  }
});

module.exports = router;