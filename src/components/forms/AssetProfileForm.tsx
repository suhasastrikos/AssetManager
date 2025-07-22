import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AssetProfile } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  type: yup.string().required('Type is required'),
  manufacturer: yup.string().required('Manufacturer is required'),
  model: yup.string().required('Model is required'),
  specifications: yup.string().required('Specifications are required'),
});

type FormData = Omit<AssetProfile, 'id' | 'createdAt' | 'updatedAt' | 'defaultAttributes' | 'rules'>;

interface AssetProfileFormProps {
  initialData?: AssetProfile;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export const AssetProfileForm: React.FC<AssetProfileFormProps> = ({
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
      type: '',
      manufacturer: '',
      model: '',
      specifications: '',
    },
    mode: 'onChange',
  });

  const assetTypes = [
    'Building',
    'Room',
    'Floor',
    'Vehicle',
    'Equipment',
    'Sensor Group',
    'Other',
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
            placeholder="Enter asset profile name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Asset Type *
          </label>
          <select
            id="type"
            {...register('type')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Select asset type</option>
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
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
          placeholder="Provide a detailed description of this asset profile"
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
          placeholder="Enter technical specifications, features, and requirements"
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