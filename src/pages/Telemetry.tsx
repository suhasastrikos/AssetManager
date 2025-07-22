import React, { useState, useEffect } from 'react';
import { Activity, Search, Calendar, TrendingUp, Zap } from 'lucide-react';
import { TelemetryResponse } from '../types';
import { telemetryService } from '../services/telemetryService';
import { useApiMutation } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Telemetry: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; type: 'ASSET' | 'DEVICE'; name: string } | null>(null);
  const [telemetryData, setTelemetryData] = useState<TelemetryResponse>({});
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('1h');
  const [loading, setLoading] = useState(false);

  const { mutate: fetchTelemetry } = useApiMutation(
    ({ entityId, entityType, keys, startTs, endTs }: { 
      entityId: string; 
      entityType: 'ASSET' | 'DEVICE'; 
      keys: string[]; 
      startTs: number; 
      endTs: number; 
    }) => telemetryService.getTelemetryHistory(entityId, entityType, keys, startTs, endTs)
  );

  const timeRanges = [
    { value: '1h', label: 'Last Hour', ms: 60 * 60 * 1000 },
    { value: '24h', label: 'Last 24 Hours', ms: 24 * 60 * 60 * 1000 },
    { value: '7d', label: 'Last 7 Days', ms: 7 * 24 * 60 * 60 * 1000 },
    { value: '30d', label: 'Last 30 Days', ms: 30 * 24 * 60 * 60 * 1000 },
  ];

  const commonTelemetryKeys = [
    'temperature',
    'humidity',
    'pressure',
    'voltage',
    'current',
    'power',
    'energy',
    'status',
    'signal_strength',
    'battery_level',
  ];

  const loadTelemetryData = async () => {
    if (!selectedEntity || selectedKeys.length === 0) return;

    setLoading(true);
    try {
      const endTs = Date.now();
      const startTs = endTs - (timeRanges.find(r => r.value === timeRange)?.ms || 60 * 60 * 1000);

      const data = await fetchTelemetry({
        entityId: selectedEntity.id,
        entityType: selectedEntity.type,
        keys: selectedKeys,
        startTs,
        endTs,
      });

      setTelemetryData(data);
    } catch (error) {
      console.error('Failed to load telemetry data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetryData();
  }, [selectedEntity, selectedKeys, timeRange]);

  const getLatestValue = (key: string) => {
    const keyData = telemetryData[key];
    if (!keyData || keyData.length === 0) return 'N/A';
    return keyData[keyData.length - 1].value;
  };

  const getValueChange = (key: string) => {
    const keyData = telemetryData[key];
    if (!keyData || keyData.length < 2) return null;
    
    const latest = parseFloat(keyData[keyData.length - 1].value);
    const previous = parseFloat(keyData[keyData.length - 2].value);
    
    if (isNaN(latest) || isNaN(previous)) return null;
    
    const change = latest - previous;
    const percentage = (change / previous) * 100;
    
    return { change, percentage };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Telemetry</h1>
          <p className="text-gray-600">Monitor real-time and historical telemetry data</p>
        </div>
      </div>

      {/* Entity and Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Entity
            </label>
            <input
              type="text"
              placeholder="Search and select an asset or device..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              readOnly
              value={selectedEntity ? `${selectedEntity.name} (${selectedEntity.type})` : ''}
            />
            <p className="mt-1 text-sm text-gray-500">
              Entity selection would be implemented with a searchable dropdown
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telemetry Keys
            </label>
            <select
              multiple
              value={selectedKeys}
              onChange={(e) => setSelectedKeys(Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              size={4}
            >
              {commonTelemetryKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <button
              onClick={loadTelemetryData}
              className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {selectedEntity && selectedKeys.length > 0 ? (
        <>
          {/* Latest Values Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedKeys.map((key) => {
              const latestValue = getLatestValue(key);
              const change = getValueChange(key);
              
              return (
                <div key={key} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace('_', ' ')}
                      </h3>
                    </div>
                    {change && (
                      <div className={`flex items-center space-x-1 ${
                        change.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`h-4 w-4 ${change.change < 0 ? 'rotate-180' : ''}`} />
                        <span className="text-xs font-medium">
                          {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {latestValue}
                  </div>
                  <div className="text-sm text-gray-500">
                    {telemetryData[key]?.length || 0} data points
                  </div>
                </div>
              );
            })}
          </div>

          {/* Telemetry Data Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Historical Data</h3>
            </div>

            {loading ? (
              <div className="p-8">
                <LoadingSpinner size="lg" text="Loading telemetry data..." />
              </div>
            ) : Object.keys(telemetryData).length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Telemetry Data</h3>
                <p className="text-gray-500">No data available for the selected time range.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      {selectedKeys.map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace('_', ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* This would show combined data from all keys by timestamp */}
                    <tr>
                      <td colSpan={selectedKeys.length + 1} className="px-6 py-4 text-center text-gray-500">
                        Telemetry data visualization would be implemented here with proper time-series data merging
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select Entity and Keys</h3>
          <p className="text-gray-500">
            Choose an asset or device and select telemetry keys to view real-time and historical data.
          </p>
        </div>
      )}
    </div>
  );
};