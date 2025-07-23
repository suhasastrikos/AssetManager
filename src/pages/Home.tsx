import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Settings, Building, Smartphone, ArrowRight, BarChart3, Users, Shield, Database, CheckCircle } from 'lucide-react';
import { DatabaseConfigForm } from '../components/forms/DatabaseConfigForm';
import { databaseService } from '../services/databaseService';
import { useApiMutation } from '../hooks/useApi';
import { DatabaseConfig, DatabaseConnection } from '../types';

export const Home: React.FC = () => {
  const [dbConnection, setDbConnection] = useState<DatabaseConnection>({ isConnected: false });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { mutate: connectToDatabase, loading: connecting } = useApiMutation(
    (config: DatabaseConfig) => databaseService.connect(config)
  );

  const { mutate: testConnection } = useApiMutation(
    (config: DatabaseConfig) => databaseService.testConnection(config)
  );

  useEffect(() => {
    // Check existing connection status on component mount
    const checkConnection = async () => {
      try {
        const status = await databaseService.getConnectionStatus();
        setDbConnection(status);
      } catch (error) {
        // Silently handle network errors when backend is not available
        // This is expected when no backend server is running
        setDbConnection({ isConnected: false });
      }
    };
    checkConnection();
  }, []);

  const handleConnect = async (config: DatabaseConfig) => {
    try {
      const connection = await connectToDatabase(config);
      setDbConnection(connection);
      setTestResult(null);
    } catch (error) {
      console.error('Failed to connect to database:', error);
    }
  };

  const handleTest = async (config: DatabaseConfig) => {
    try {
      const result = await testConnection(config);
      setTestResult(result);
      return result;
    } catch (error) {
      const result = { success: false, message: 'Connection test failed' };
      setTestResult(result);
      return result;
    }
  };

  const handleDisconnect = async () => {
    try {
      await databaseService.disconnect();
      setDbConnection({ isConnected: false });
      setTestResult(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const features = [
    {
      icon: Building,
      title: 'Asset Profiles',
      description: 'Create and manage reusable asset profile templates with specifications and requirements.',
      link: '/asset-profiles',
      color: 'bg-blue-500',
    },
    {
      icon: Settings,
      title: 'Device Profiles',
      description: 'Define device profile templates with technical specifications and firmware details.',
      link: '/device-profiles',
      color: 'bg-green-500',
    },
    {
      icon: Package,
      title: 'Assets',
      description: 'Track and manage physical assets with their profiles, locations, and status.',
      link: '/assets',
      color: 'bg-purple-500',
    },
    {
      icon: Smartphone,
      title: 'Devices',
      description: 'Monitor devices linked to assets with network information and status tracking.',
      link: '/devices',
      color: 'bg-orange-500',
    },
  ];

  const stats = [
    { label: 'Asset Management', value: 'Centralized', icon: BarChart3 },
    { label: 'Profile Templates', value: 'Reusable', icon: Users },
    { label: 'Data Security', value: 'Protected', icon: Shield },
  ];

  return (
    <div className="space-y-12">
      {/* Database Connection Status */}
      {dbConnection.isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Database Connected</h3>
                <p className="text-sm text-green-700">
                  Connected to {dbConnection.config?.type} database "{dbConnection.config?.database}" 
                  {dbConnection.connectionTime && ` at ${new Date(dbConnection.connectionTime).toLocaleString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Database Configuration Form */}
      {!dbConnection.isConnected && (
        <DatabaseConfigForm
          onConnect={handleConnect}
          onTest={handleTest}
          loading={connecting}
          testResult={testResult}
        />
      )}

      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Package className="h-16 w-16 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Asset Management System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Streamline your asset and device management with powerful profiles, 
          comprehensive tracking, and intuitive organization tools.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="flex justify-center mb-3">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-gray-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!dbConnection.isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
        {features.map(({ icon: Icon, title, description, link, color }) => (
          <div
            key={title}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200 group relative"
          >
            {dbConnection.isConnected ? (
              <Link to={link} className="block">
                <div className="flex items-start space-x-4">
                  <div className={`${color} p-3 rounded-lg group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    <p className="text-gray-600">{description}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <>
                <div className="flex items-start space-x-4">
                  <div className={`${color} p-3 rounded-lg opacity-50`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-gray-600">{description}</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Database connection required</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {!dbConnection.isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Database className="h-6 w-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Database Connection Required</h3>
              <p className="text-yellow-800 mb-4">
                To start managing your IoT assets and devices, please configure and connect to your database first. 
                All asset profiles, device profiles, assets, and devices will be stored in your selected database.
              </p>
              <div className="text-sm text-yellow-700">
                <p className="mb-1">• <strong>PostgreSQL:</strong> Recommended for production IoT deployments</p>
                <p className="mb-1">• <strong>MySQL:</strong> Compatible with existing MySQL infrastructure</p>
                <p>• <strong>MongoDB:</strong> Flexible document storage for complex IoT data</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Section */}
      {dbConnection.isConnected && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Begin by creating asset and device profiles that serve as templates. 
              Then add your actual assets and devices, linking them to the appropriate profiles 
              for streamlined management and reporting.
            </p>
            <div className="flex items-start space-x-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/asset-profiles"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Building className="h-5 w-5 mr-2" />
                Create Asset Profile
              </Link>
              <Link
                to="/device-profiles"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Settings className="h-5 w-5 mr-2" />
                Create Device Profile
              </Link>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};