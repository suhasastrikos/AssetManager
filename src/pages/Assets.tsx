import React from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { useState } from 'react';
import { Asset } from '../types';
import { AssetForm } from '../components/forms/AssetForm';
import { assetService } from '../services/assetService';
import { useApi, useApiMutation } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Assets: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: assetsData, loading, refetch } = useApi(
    () => assetService.getAll({ search: searchTerm, type: typeFilter }),
    [searchTerm, typeFilter]
  );

  const { mutate: createAsset, loading: creating } = useApiMutation(
    (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) =>
      assetService.create(data)
  );

  const { mutate: updateAsset, loading: updating } = useApiMutation(
    ({ id, ...data }: { id: string } & Partial<Asset>) =>
      assetService.update(id, data)
  );

  const assets = assetsData?.data || [];
  const assetTypes = ['Building', 'Room', 'Floor', 'Vehicle', 'Equipment', 'Sensor Group', 'Other'];

  const handleSubmit = async (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingAsset) {
        await updateAsset({ id: editingAsset.id, ...data });
      } else {
        await createAsset(data);
      }
      setShowForm(false);
      setEditingAsset(null);
      refetch();
    } catch (error) {
      console.error('Failed to save asset:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAsset(null);
  };

  const handleNewAsset = () => {
    setEditingAsset(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600">Track and manage your physical assets</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNewAsset}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Asset</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingAsset ? 'Edit Asset' : 'Create New Asset'}
            </h2>
            <p className="text-sm text-gray-600">
              {editingAsset
                ? 'Update the asset information below.'
                : 'Fill in the details to create a new asset. Select an asset profile to auto-populate some fields.'}
            </p>
          </div>
          <AssetForm
            initialData={editingAsset || undefined}
            onSubmit={handleSubmit}
            loading={creating || updating}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Types</option>
                    {assetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <LoadingSpinner size="lg" text="Loading assets..." />
            </div>
          ) : assets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assets Found</h3>
              <p className="text-gray-500">Create your first asset to get started.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Label
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{asset.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {asset.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.assetProfile?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};