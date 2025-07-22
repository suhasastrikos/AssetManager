import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Device, DeviceProfile, Asset } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { deviceProfileService } from '../../services/deviceProfileService';
import { assetService } from '../../services/assetService';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  label: yup.string().required('Label is required'),
  deviceProfileId: yup.string().required('Device profile is required'),
  assetId: yup.string().required('Asset is required'),
  type: yup.string().required('Type is required'),
});

type FormData = Omit<Device, 'id' | 'createdAt' | 'updatedAt' | 'deviceProfile' | 'asset' | 'attributes' | 'credentials' | 'additionalInfo' | 'isActive' | 'lastActivityTime'>;

interface DeviceFormProps {
  initialData?: Device;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export const DeviceForm: React.FC<DeviceFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const { data: profilesData, loading: profilesLoading } = useApi(
    () => deviceProfileService.getAll(),
    []
  );

  const { data: assetsData, loading: assetsLoading } = useApi(
    () => assetService.getAll(),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      name: '',
      description: '',
      label: '',
      deviceProfileId: '',
      assetId: '',
      type: '',
    },
    mode: 'onChange',
  });

  const profiles = profilesData?.data || [];
  const assets = assetsData?.data || [];
  const selectedProfileId = watch('deviceProfileId');
  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  useEffect(() => {
    if (selectedProfile && !initialData) {
      // Auto-fill type based on selected profile
      reset(prev => ({ ...prev, type: selectedProfile.deviceType }));
    }
  }, [selectedProfile, reset, initialData]);

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
            placeholder="Enter device name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            Label *
          </label>
          <input
            type="text"
            id="label"
            {...register('label')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.label ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter device label"
          />
          {errors.label && (
            <p className="mt-1 text-sm text-red-600">{errors.label.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="deviceProfileId" className="block text-sm font-medium text-gray-700 mb-1">
            Device Profile *
          </label>
          <select
            id="deviceProfileId"
            {...register('deviceProfileId')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.deviceProfileId ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            disabled={profilesLoading}
          >
            <option value="">Select device profile</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} ({profile.deviceType})
              </option>
            ))}
          </select>
          {errors.deviceProfileId && (
            <p className="mt-1 text-sm text-red-600">{errors.deviceProfileId.message}</p>
          )}
          {profilesLoading && (
            <p className="mt-1 text-sm text-gray-500">Loading profiles...</p>
          )}
        </div>

        <div>
          <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
            Parent Asset *
          </label>
          <select
            id="assetId"
            {...register('assetId')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.assetId ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            disabled={assetsLoading}
          >
            <option value="">Select parent asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.type})
              </option>
            ))}
          </select>
          {errors.assetId && (
            <p className="mt-1 text-sm text-red-600">{errors.assetId.message}</p>
          )}
          {assetsLoading && (
            <p className="mt-1 text-sm text-gray-500">Loading assets...</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <input
            type="text"
            id="type"
            {...register('type')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Device type"
            readOnly={!!selectedProfile}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
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
          placeholder="Provide a detailed description of this device"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {selectedProfile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">Selected Profile Information</h4>
          <div className="text-sm text-green-800">
            <p><strong>Name:</strong> {selectedProfile.name}</p>
            <p><strong>Type:</strong> {selectedProfile.deviceType}</p>
            <p><strong>Manufacturer:</strong> {selectedProfile.manufacturer}</p>
            <p><strong>Transport:</strong> {selectedProfile.transportType}</p>
          </div>
        </div>
      )}

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
            initialData ? 'Update Device' : 'Create Device'
          )}
        </button>
      </div>
    </form>
  );
};