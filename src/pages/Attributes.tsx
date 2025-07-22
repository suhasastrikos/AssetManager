import React, { useState } from 'react';
import { Plus, Search, Key, Trash2, Edit2 } from 'lucide-react';
import { Attribute } from '../types';
import { attributeService } from '../services/attributeService';
import { useApi, useApiMutation } from '../hooks/useApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const Attributes: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<{ id: string; type: 'ASSET' | 'DEVICE'; name: string } | null>(null);
  const [selectedScope, setSelectedScope] = useState<'CLIENT_SCOPE' | 'SERVER_SCOPE' | 'SHARED_SCOPE'>('SERVER_SCOPE');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ key: '', value: '' });
  const [deleteAttribute, setDeleteAttribute] = useState<{ key: string; scope: string } | null>(null);

  const { data: attributesData, loading, refetch } = useApi(
    () => selectedEntity ? attributeService.getByEntity(selectedEntity.id, selectedEntity.type, selectedScope) : Promise.resolve([]),
    [selectedEntity, selectedScope]
  );

  const { mutate: saveAttribute, loading: saving } = useApiMutation(
    ({ entityId, entityType, scope, key, value }: { entityId: string; entityType: 'ASSET' | 'DEVICE'; scope: string; key: string; value: any }) =>
      attributeService.saveAttribute(entityId, entityType, scope, key, value)
  );

  const { mutate: removeAttribute } = useApiMutation(
    ({ entityId, entityType, scope, key }: { entityId: string; entityType: 'ASSET' | 'DEVICE'; scope: string; key: string }) =>
      attributeService.deleteAttribute(entityId, entityType, scope, key)
  );

  const attributes = attributesData || [];
  const scopes = [
    { value: 'SERVER_SCOPE', label: 'Server Attributes' },
    { value: 'SHARED_SCOPE', label: 'Shared Attributes' },
    { value: 'CLIENT_SCOPE', label: 'Client Attributes' },
  ];

  const handleAddAttribute = async () => {
    if (!selectedEntity || !newAttribute.key || !newAttribute.value) return;

    try {
      let value = newAttribute.value;
      // Try to parse as JSON for complex values
      try {
        value = JSON.parse(newAttribute.value);
      } catch {
        // Keep as string if not valid JSON
      }

      await saveAttribute({
        entityId: selectedEntity.id,
        entityType: selectedEntity.type,
        scope: selectedScope,
        key: newAttribute.key,
        value,
      });

      setNewAttribute({ key: '', value: '' });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to save attribute:', error);
    }
  };

  const handleDeleteAttribute = async () => {
    if (!selectedEntity || !deleteAttribute) return;

    try {
      await removeAttribute({
        entityId: selectedEntity.id,
        entityType: selectedEntity.type,
        scope: deleteAttribute.scope,
        key: deleteAttribute.key,
      });

      setDeleteAttribute(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete attribute:', error);
    }
  };

  const formatValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attributes</h1>
          <p className="text-gray-600">Manage static key-value attributes for assets and devices</p>
        </div>
      </div>

      {/* Entity Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
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
          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scope
            </label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {scopes.map((scope) => (
                <option key={scope.value} value={scope.value}>
                  {scope.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedEntity ? (
        <>
          {/* Add Attribute Form */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Attribute</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key *
                  </label>
                  <input
                    type="text"
                    value={newAttribute.key}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, key: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter attribute key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="text"
                    value={newAttribute.value}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter attribute value (JSON supported)"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAttribute}
                  disabled={!newAttribute.key || !newAttribute.value || saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Adding...' : 'Add Attribute'}
                </button>
              </div>
            </div>
          )}

          {/* Attributes List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {scopes.find(s => s.value === selectedScope)?.label}
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Attribute</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8">
                <LoadingSpinner size="lg" text="Loading attributes..." />
              </div>
            ) : attributes.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Attributes Found</h3>
                <p className="text-gray-500">Add your first attribute to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attributes.map((attr) => (
                      <tr key={attr.key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{attr.key}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {formatValue(attr.value)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(attr.lastUpdateTs).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setDeleteAttribute({ key: attr.key, scope: attr.scope })}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Delete attribute"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Entity</h3>
          <p className="text-gray-500">
            Choose an asset or device to view and manage its attributes.
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteAttribute !== null}
        onClose={() => setDeleteAttribute(null)}
        onConfirm={handleDeleteAttribute}
        title="Delete Attribute"
        message={`Are you sure you want to delete the attribute "${deleteAttribute?.key}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};