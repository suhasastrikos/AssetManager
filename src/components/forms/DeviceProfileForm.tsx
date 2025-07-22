import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DeviceProfile } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  deviceType: yup.string().required('Device type is required'),
  manufacturer: yup.string().required('Manufacturer is required'),
  model: yup.string().required('Model is required'),
  firmwareVersion: yup.string().required('Firmware version is required'),
  transportType: yup.string().required('Transport type is required'),
  specifications: yup.string().required('Specifications are required'),
});

type FormData = Omit<DeviceProfile, 'id' | 'createdAt' | 'updatedAt' | 'defaultAttributes' | 'alarmRules'>;

interface DeviceProfileFormProps {
  initialData?: DeviceProfile;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export const DeviceProfileForm: React.FC<DeviceProfileFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      name: '',
      description: '',
      deviceType: '',
      manufacturer: '',
      model: '',
      firmwareVersion: '',
      transportType: 'MQTT',
      specifications: '',
    },
    mode: 'onChange',
  });

  const deviceTypes = [
    'Sensor',
    'Gateway',
    'Controller',
    'Actuator',
    'Camera',
    'Meter',
    'Tracker',
    'Other',
  ];

  const transportTypes = [
    { value: 'MQTT', label: 'MQTT' },
    { value: 'HTTP', label: 'HTTP' },
    { value: 'CoAP', label: 'CoAP' },
    { value: 'LWM2M', label: 'LWM2M' },
  ];

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    if (!initialData) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter device profile name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-1">
            Device Type *
          </label>
          <select
            id="deviceType"
            {...register('deviceType')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.deviceType ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select device type</option>
            {deviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.deviceType && (
            <p className="mt-1 text-sm text-red-600">{errors.deviceType.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturer *
          </label>
          <input
            type="text"
            id="manufacturer"
            {...register('manufacturer')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.manufacturer ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter manufacturer name"
          />
          {errors.manufacturer && (
            <p className="mt-1 text-sm text-red-600">{errors.manufacturer.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Model *
          </label>
          <input
            type="text"
            id="model"
            {...register('model')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.model ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter model number"
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="firmwareVersion" className="block text-sm font-medium text-gray-700 mb-1">
            Firmware Version *
          </label>
          <input
            type="text"
            id="firmwareVersion"
            {...register('firmwareVersion')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.firmwareVersion ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter firmware version"
          />
          {errors.firmwareVersion && (
            <p className="mt-1 text-sm text-red-600">{errors.firmwareVersion.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="transportType" className="block text-sm font-medium text-gray-700 mb-1">
            Transport Type *
          </label>
          <select
            id="transportType"
            {...register('transportType')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.transportType ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            {transportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.transportType && (
            <p className="mt-1 text-sm text-red-600">{errors.transportType.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
            errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Provide a detailed description of this device profile"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-1">
          Specifications *
        </label>
        <textarea
          id="specifications"
          rows={4}
          {...register('specifications')}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
            errors.specifications ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Enter technical specifications, communication protocols, and capabilities"
        />
        {errors.specifications && (
          <p className="mt-1 text-sm text-red-600">{errors.specifications.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <LoadingSpinner size="sm" text={initialData ? 'Updating...' : 'Creating...'} />
          ) : (
            initialData ? 'Update Profile' : 'Create Profile'
          )}
        </button>
      </div>
    </form>
  );
};