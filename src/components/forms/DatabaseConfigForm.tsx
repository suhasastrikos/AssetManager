import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DatabaseConfig } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Database, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

const schema = yup.object({
  type: yup.string().required('Database type is required'),
  host: yup.string().required('Host is required'),
  port: yup.number().required('Port is required').positive('Port must be positive'),
  database: yup.string().required('Database name is required'),
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
  ssl: yup.boolean(),
});

interface DatabaseConfigFormProps {
  onConnect: (config: DatabaseConfig) => Promise<void>;
  onTest: (config: DatabaseConfig) => Promise<{ success: boolean; message: string }>;
  loading?: boolean;
  testResult?: { success: boolean; message: string } | null;
}

export const DatabaseConfigForm: React.FC<DatabaseConfigFormProps> = ({
  onConnect,
  onTest,
  loading = false,
  testResult,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<DatabaseConfig>({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: false,
    },
    mode: 'onChange',
  });

  const databaseTypes = [
    { value: 'postgresql', label: 'PostgreSQL', defaultPort: 5432 },
    { value: 'mysql', label: 'MySQL', defaultPort: 3306 },
    { value: 'mongodb', label: 'MongoDB', defaultPort: 27017 },
  ];

  const handleTestConnection = async () => {
    if (!isValid) return;
    
    setTesting(true);
    try {
      const config = getValues();
      await onTest(config);
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async (data: DatabaseConfig) => {
    await onConnect(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Database Configuration</h2>
          <p className="text-sm text-gray-600">Configure your database connection to start managing IoT assets and devices</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleConnect)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Database Type *
            </label>
            <select
              id="type"
              {...register('type')}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              {databaseTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
              Host *
            </label>
            <input
              type="text"
              id="host"
              {...register('host')}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.host ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="localhost"
            />
            {errors.host && (
              <p className="mt-1 text-sm text-red-600">{errors.host.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
              Port *
            </label>
            <input
              type="number"
              id="port"
              {...register('port', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.port ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="5432"
            />
            {errors.port && (
              <p className="mt-1 text-sm text-red-600">{errors.port.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-1">
              Database Name *
            </label>
            <input
              type="text"
              id="database"
              {...register('database')}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.database ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="iot_platform"
            />
            {errors.database && (
              <p className="mt-1 text-sm text-red-600">{errors.database.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              id="username"
              {...register('username')}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="ssl"
            {...register('ssl')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="ssl" className="ml-2 block text-sm text-gray-900">
            Use SSL Connection
          </label>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={!isValid || testing}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? (
              <LoadingSpinner size="sm" text="Testing..." />
            ) : (
              'Test Connection'
            )}
          </button>
          <button
            type="submit"
            disabled={!isValid || loading || (testResult && !testResult.success)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="Connecting..." />
            ) : (
              'Connect to Database'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};