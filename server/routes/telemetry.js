const express = require('express');
const router = express.Router();
const databaseManager = require('../config/database');

// Mock data for demonstration
let telemetryData = [];

// Get telemetry data
router.get('/:entityType/:entityId/values/timeseries', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { keys, startTs, endTs, interval, limit } = req.query;

    let filteredData = telemetryData.filter(data => 
      data.entityId === entityId && data.entityType === entityType
    );

    if (keys) {
      const keyArray = keys.split(',');
      filteredData = filteredData.filter(data => keyArray.includes(data.key));
    }

    if (startTs) {
      filteredData = filteredData.filter(data => data.ts >= parseInt(startTs));
    }

    if (endTs) {
      filteredData = filteredData.filter(data => data.ts <= parseInt(endTs));
    }

    // Group by key
    const groupedData = {};
    filteredData.forEach(data => {
      if (!groupedData[data.key]) {
        groupedData[data.key] = [];
      }
      groupedData[data.key].push({
        ts: data.ts,
        value: data.value
      });
    });

    // Sort by timestamp and apply limit
    Object.keys(groupedData).forEach(key => {
      groupedData[key].sort((a, b) => a.ts - b.ts);
      if (limit) {
        groupedData[key] = groupedData[key].slice(-parseInt(limit));
      }
    });

    res.json(groupedData);
  } catch (error) {
    console.error('Get telemetry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch telemetry data'
    });
  }
});

// Save telemetry data
router.post('/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const data = req.body;
    const timestamp = Date.now();

    Object.entries(data).forEach(([key, value]) => {
      telemetryData.push({
        entityId,
        entityType,
        key,
        ts: timestamp,
        value: value.toString()
      });
    });

    res.json({
      success: true,
      message: 'Telemetry data saved successfully'
    });
  } catch (error) {
    console.error('Save telemetry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save telemetry data'
    });
  }
});

// Delete telemetry data
router.delete('/:entityType/:entityId/timeseries/delete', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { keys, startTs, endTs } = req.query;

    let initialLength = telemetryData.length;

    telemetryData = telemetryData.filter(data => {
      if (data.entityId !== entityId || data.entityType !== entityType) {
        return true;
      }

      if (keys) {
        const keyArray = keys.split(',');
        if (!keyArray.includes(data.key)) {
          return true;
        }
      }

      if (startTs && data.ts < parseInt(startTs)) {
        return true;
      }

      if (endTs && data.ts > parseInt(endTs)) {
        return true;
      }

      return false;
    });

    res.json({
      success: true,
      message: `Deleted ${initialLength - telemetryData.length} telemetry records`
    });
  } catch (error) {
    console.error('Delete telemetry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete telemetry data'
    });
  }
});

module.exports = router;