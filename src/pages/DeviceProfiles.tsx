import React, { useState } from 'react';
import { Plus, Search, Filter, Settings, Upload } from 'lucide-react';
import { DeviceProfile } from '../types';
import { DeviceProfileForm } from '../components/forms/DeviceProfileForm';
import { DeviceProfileTable } from '../components/tables/DeviceProfileTable';
import { ImportDialog } from '../components/common/ImportDialog';
import { deviceProfileService } from '../services/deviceProfileService';
import { useApi, useApiMutation } from '../hooks/useApi';

export const DeviceProfiles: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<DeviceProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);

  const { data: profilesData, loading, refetch } = useApi(
    () => deviceProfileService.getAll({ search: searchTerm, deviceType: typeFilter }),
    [searchTerm, typeFilter]
  );

  const { mutate: createProfile, loading: creating } = useApiMutation(
    (data: Omit<DeviceProfile, 'id' | 'createdAt' | 'updatedAt'>) =>
      deviceProfileService.create(data)
  );

  const { mutate: updateProfile, loading: updating } = useApiMutation(
    ({ id, ...data }: { id: string } & Partial<DeviceProfile>) =>
      deviceProfileService.update(id, data)
  );

  const { mutate: deleteProfile } = useApiMutation((id: string) =>
    deviceProfileService.delete(id)
  );

  const profiles = profilesData?.data || [];
  const deviceTypes = ['Sensor', 'Gateway', 'Controller', 'Actuator', 'Camera', 'Meter', 'Tracker', 'Other'];

  const sampleDeviceProfile = {
    name: 'Sample Temperature Sensor',
    description: 'A sample device profile for temperature monitoring',
    deviceType: 'Sensor',
    manufacturer: 'SensorTech',
    model: 'TEMP-2024',
    firmwareVersion: '1.0.0',
    transportType: 'MQTT',
    specifications: 'Temperature range: -40°C to 85°C, Accuracy: ±0.5°C'
  };

  const handleSubmit = async (data: Omit<DeviceProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const handleEdit = (profile: DeviceProfile) => {
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

  const handleImport = async (data: any[], format: string) => {
    try {
      const importPromises = data.map(item => createProfile(item));
      await Promise.all(importPromises);
      refetch();
    } catch (error) {
      console.error('Failed to import profiles:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Profiles</h1>
          <p className="text-gray-600">Manage device profile templates and specifications</p>
        </div>
        {!showForm && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportDialog(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button
              onClick={handleNewProfile}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Profile</span>
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingProfile ? 'Edit Device Profile' : 'Create New Device Profile'}
            </h2>
            <p className="text-sm text-gray-600">
              {editingProfile
                ? 'Update the device profile information below.'
                : 'Fill in the details to create a new device profile template.'}
            </p>
          </div>
          <DeviceProfileForm
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
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">All Types</option>
                    {deviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <DeviceProfileTable
            data={profiles}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </>
      )}

      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImport={handleImport}
        entityType="Device Profiles"
        sampleData={sampleDeviceProfile}
      />
    </div>
  );
};