import React from 'react';
import { Plus, Search, Filter, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Device } from '../types';
import { DeviceForm } from '../components/forms/DeviceForm';
import { DeviceTable } from '../components/tables/DeviceTable';
import { deviceService } from '../services/deviceService';
import { useApi, useApiMutation } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Devices: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: devicesData, loading, refetch } = useApi(
    () => deviceService.getAll({ search: searchTerm, type: typeFilter }),
    [searchTerm, typeFilter]
  );

  const { mutate: createDevice, loading: creating } = useApiMutation(
    (data: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) =>
      deviceService.create(data)
  );

  const { mutate: updateDevice, loading: updating } = useApiMutation(
    ({ id, ...data }: { id: string } & Partial<Device>) =>
      deviceService.update(id, data)
  );

  const { mutate: deleteDevice } = useApiMutation((id: string) =>
    deviceService.delete(id)
  );

  const devices = devicesData?.data || [];
  const deviceTypes = ['Sensor', 'Gateway', 'Controller', 'Actuator', 'Camera', 'Meter', 'Tracker', 'Other'];

  const handleSubmit = async (data: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingDevice) {
        await updateDevice({ id: editingDevice.id, ...data });
      } else {
        await createDevice(data);
      }
      setShowForm(false);
      setEditingDevice(null);
      refetch();
    } catch (error) {
      console.error('Failed to save device:', error);
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDevice(id);
      refetch();
    } catch (error) {
      console.error('Failed to delete device:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDevice(null);
  };

  const handleNewDevice = () => {
    setEditingDevice(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600">Monitor and manage IoT devices connected to assets</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNewDevice}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Device</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingDevice ? 'Edit Device' : 'Create New Device'}
            </h2>
            <p className="text-sm text-gray-600">
              {editingDevice
                ? 'Update the device information below.'
                : 'Fill in the details to create a new device. Select a device profile and parent asset.'}
            </p>
          </div>
          <DeviceForm
            initialData={editingDevice || undefined}
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
                    placeholder="Search devices..."
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

          <DeviceTable
            data={devices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};