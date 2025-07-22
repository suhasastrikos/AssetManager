import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { AssetProfile } from '../types';
import { AssetProfileForm } from '../components/forms/AssetProfileForm';
import { AssetProfileTable } from '../components/tables/AssetProfileTable';
import { assetProfileService } from '../services/assetProfileService';
import { useApi, useApiMutation } from '../hooks/useApi';

export const AssetProfiles: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AssetProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: profilesData, loading, refetch } = useApi(
    () => assetProfileService.getAll({ search: searchTerm, category: categoryFilter }),
    [searchTerm, categoryFilter]
  );

  const { mutate: createProfile, loading: creating } = useApiMutation(
    (data: Omit<AssetProfile, 'id' | 'createdAt' | 'updatedAt'>) =>
      assetProfileService.create(data)
  );

  const { mutate: updateProfile, loading: updating } = useApiMutation(
    ({ id, ...data }: { id: string } & Partial<AssetProfile>) =>
      assetProfileService.update(id, data)
  );

  const { mutate: deleteProfile } = useApiMutation((id: string) =>
    assetProfileService.delete(id)
  );

  const profiles = profilesData?.data || [];
  const assetTypes = ['Building', 'Room', 'Floor', 'Vehicle', 'Equipment', 'Sensor Group', 'Other'];

  const handleSubmit = async (data: Omit<AssetProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingProfile) {
        await updateProfile({ id: editingProfile.id, ...data });
      } else {
        await createProfile(data);
      }
      setShowForm(false);
      setEditingProfile(null);
      refetch();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleEdit = (profile: AssetProfile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProfile(id);
      refetch();
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProfile(null);
  };

  const handleNewProfile = () => {
    setEditingProfile(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Profiles</h1>
          <p className="text-gray-600">Manage asset profile templates and specifications</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNewProfile}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Profile</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingProfile ? 'Edit Asset Profile' : 'Create New Asset Profile'}
            </h2>
            <p className="text-sm text-gray-600">
              {editingProfile
                ? 'Update the asset profile information below.'
                : 'Fill in the details to create a new asset profile template.'}
            </p>
          </div>
          <AssetProfileForm
            initialData={editingProfile || undefined}
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
                    placeholder="Search profiles..."
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
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
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

          <AssetProfileTable
            data={profiles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};