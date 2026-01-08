import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Users, AlertTriangle, Building2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTeams } from '../hooks/useTeams';
import { useStore } from '../store';
import { 
  addProductTypeAction, 
  removeProductTypeAction, 
  addChangeTypeAction, 
  removeChangeTypeAction, 
  updateChangeTypeAction 
} from '../actions/workflows';
import type { Database } from '../lib/types';

interface ProductTypeWithChanges extends ProductType {
  changeTypes: ChangeType[];
  threshold?: {
    id: string;
    minimumDaysNotice: number;
  };
}

interface ProductType {
  id: string;
  name: string;
}

interface ChangeType {
  id: string;
  name: string;
  product_type_id: string;
  duration_minutes: number;
  is_exclusive: boolean;
}

// Helper function to generate IDs
const generateId = () => uuidv4();

export function ModifyWorkflows() {
  const [productTypes, setProductTypes] = useState<ProductTypeWithChanges[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [newProductType, setNewProductType] = useState('');
  const [newChangeType, setNewChangeType] = useState('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newIsExclusive, setNewIsExclusive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingChangeTypes, setLoadingChangeTypes] = useState(false);
  const { teams, loading: loadingTeams } = useTeams();
  const store = useStore();

  useEffect(() => {
    if (selectedTeam) {
      setLoading(true);
      fetchTypes();
    } else {
      setProductTypes([]);
      setSelectedProductType(null);
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedProductType) {
      const selectedProduct = productTypes.find(p => p.id === selectedProductType);
      if (selectedProduct && selectedProduct.changeTypes.length === 0) {
        fetchChangeTypesForProduct(selectedProductType);
      }
      setNewDuration(30);
      setNewIsExclusive(false);
      setNewChangeType('');
    }
  }, [selectedProductType]);

  const fetchChangeTypesForProduct = async (productTypeId: string) => {
    setLoadingChangeTypes(true);
    try {
      const productChangeTypes = store.changeTypes
        .filter(ct => ct.product_type_id === productTypeId);
      
      setProductTypes(prev => prev.map(pt => 
        pt.id === productTypeId ? { ...pt, changeTypes: productChangeTypes } : pt
      ));
    } catch (err) {
      console.error('Error fetching change types:', err);
      setError('Failed to load change types');
    } finally {
      setLoadingChangeTypes(false);
    }
  };

  const fetchTypes = async () => {
    try {
      setError(null);
      if (!selectedTeam) {
        setProductTypes([]);
        setSelectedProductType(null);
        return;
      }
      
      // Get product types from store
      const filteredProducts = store.productTypes
        .filter(pt => !selectedTeam || pt.teamId === selectedTeam)
        .map(product => ({
          id: product.id,
          name: product.name,
          teamId: product.teamId,
          changeTypes: store.changeTypes.filter(ct => ct.product_type_id === product.id),
          threshold: {
            id: generateId(),
            minimumDaysNotice: 2 // Default value
          }
        }));
      
      setProductTypes(filteredProducts);
      setSelectedProductType(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load types. Please try again.';
      setError(errorMessage);
      console.error('Error fetching types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductType.trim()) {
      setError('Please enter a product type name');
      return;
    }
    if (!selectedTeam) {
      setError('Please select a team');
      return;
    }

    try {
      setSaving(true);
      await store.addProductType({
        name: newProductType.trim(),
        teamId: selectedTeam
      });
      setSuccess('Product type added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setNewProductType('');
      await fetchTypes();
    } catch (err) {
      console.error('Error adding product type:', err);
      setError('Failed to add product type');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChangeType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChangeType.trim() || !selectedProductType) {
      setError('Please enter a change type name and select a product type');
      return;
    }

    try {
      setSaving(true);
      await store.addChangeType({
        name: newChangeType.trim(),
        duration_minutes: newDuration,
        is_exclusive: newIsExclusive,
        product_type_id: selectedProductType
      });
      setSuccess('Change type added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setNewChangeType('');
      await fetchChangeTypesForProduct(selectedProductType);
    } catch (err) {
      console.error('Error adding change type:', err);
      setError('Failed to add change type');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDuration = async (id: string, value: string) => {
    try {
      const duration = parseInt(value);
      if (isNaN(duration)) {
        throw new Error('Duration must be a valid number');
      }
      if (duration < 30) {
        throw new Error('Duration must be at least 30 minutes');
      }
      
      setSaving(true);
      setError(null);

      await store.updateChangeType(id, { duration_minutes: duration });
      
      setSuccess('Duration updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      await fetchChangeTypesForProduct(selectedProductType!);
    } catch (err) {
      console.error('Error updating duration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update duration';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleExclusive = async (id: string, currentValue: boolean) => {
    try {
      setSaving(true);
      await store.updateChangeType(id, { is_exclusive: !currentValue });
      setSuccess('Exclusive setting updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      await fetchChangeTypesForProduct(selectedProductType!);
    } catch (err) {
      console.error('Error updating exclusive setting:', err);
      setError('Failed to update exclusive setting');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProductType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product type? This will also delete all associated change types.')) {
      return;
    }

    try {
      setSaving(true);
      await store.removeProductType(id);
      setSuccess('Product type deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      if (selectedProductType === id) {
        setSelectedProductType(null);
      }
      await fetchTypes();
    } catch (err) {
      console.error('Error deleting product type:', err);
      setError('Failed to delete product type');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChangeType = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this change type?')) {
      return;
    }

    try {
      setSaving(true);
      await store.removeChangeType(id);
      setSuccess('Change type deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      await fetchChangeTypesForProduct(selectedProductType!);
    } catch (err) {
      console.error('Error deleting change type:', err);
      setError('Failed to delete change type');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateThreshold = async (productTypeId: string, days: number) => {
    if (days < 0) {
      setError('Minimum days notice must be non-negative');
      return;
    }

    try {
      const productType = productTypes.find(p => p.id === productTypeId);
      if (!productType) return;

      // Update threshold in store
      store.updateProductType(productTypeId, {
        threshold: {
          id: productType.threshold?.id || uuidv4(),
          minimumDaysNotice: days
        }
      });

      setSuccess('Minimum days notice updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      await fetchTypes();
    } catch (err) {
      setError('Failed to update minimum days notice');
      console.error('Error updating threshold:', err);
    }
  };

  if (loadingTeams) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modify Workflows</h1>
            <p className="text-gray-600">Manage product types and their associated change types</p>
          </div>
          <div className="w-64">
            <FormField 
              label="Team" 
              required 
              icon={Building2}
              error={error && !selectedTeam ? 'Please select a team' : undefined}
            >
              <Select
                value={selectedTeam || ''}
                onChange={(e) => setSelectedTeam(e.target.value)}
                options={[
                  { value: '', label: 'Select a team' },
                  ...teams.map(team => ({
                    value: team.id,
                    label: team.name
                  }))
                ]}
              />
            </FormField>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {!selectedTeam ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Team</h3>
              <p className="text-gray-500">
                Please select a team to manage their product types and change types
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          {/* Product Types Section */}
          <Card>
            <CardHeader>
              <CardTitle>Product Types</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProductType} className="mb-6">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={newProductType}
                    onChange={(e) => setNewProductType(e.target.value)}
                    placeholder="Enter product type name"
                    required
                  />
                  <Button type="submit" icon={Plus}>Add</Button>
                </div>
              </form>

              <div className="space-y-4">
                {productTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>No product types found for {teams.find(t => t.id === selectedTeam)?.name}</p>
                  </div>
                ) : (
                  productTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setSelectedProductType(type.id)}
                      className={`p-4 rounded-lg border-2 transition-colors cursor-pointer relative ${
                        selectedProductType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{type.name}</span>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProductType(type.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Minimum Days Notice
                            </label>
                            <Input
                              type="number"
                              min="0"
                              value={type.threshold?.minimumDaysNotice ?? 2}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  handleUpdateThreshold(type.id, value);
                                }
                              }}
                              className="w-20 text-center"
                            />
                          </div>
                          <span className="text-sm text-gray-500 mt-6">days notice required</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Change Types Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                Change Types
                {selectedProductType && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    for {productTypes.find(p => p.id === selectedProductType)?.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedProductType ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p>Select a product type to manage change types</p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleAddChangeType} className="mb-6 space-y-4">
                    <FormField label="Change Type Name" required>
                      <Input
                        type="text"
                        value={newChangeType}
                        onChange={(e) => setNewChangeType(e.target.value)}
                        placeholder="Enter change type name"
                        required
                      />
                    </FormField>

                    <FormField label="Duration (minutes)" required>
                      <Input
                        type="number"
                        min="30"
                        step="30"
                        value={newDuration}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const roundedValue = Math.max(30, Math.round(value / 30) * 30);
                          setNewDuration(isNaN(value) ? 30 : roundedValue);
                        }}
                        required
                      />
                    </FormField>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newIsExclusive}
                        onChange={(e) => setNewIsExclusive(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Exclusive change type
                      </span>
                    </div>

                    <Button type="submit" icon={Plus} fullWidth>
                      Add Change Type
                    </Button>
                  </form>

                  <div className="space-y-4">
                    {productTypes
                      .find(p => p.id === selectedProductType)
                      ?.changeTypes.map((type) => (
                      <div
                        key={type.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{type.name}</span>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleDeleteChangeType(type.id)}
                            >
                              Delete
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <Input
                                type="number"
                                min="30"
                                step="30"
                                value={type.duration_minutes || 30}
                                onBlur={(e) => {
                                  const value = parseInt(e.target.value);
                                  const roundedValue = Math.max(30, Math.round(value / 30) * 30);
                                  handleUpdateDuration(type.id, roundedValue.toString());
                                }}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    const roundedValue = Math.max(30, Math.round(value / 30) * 30);
                                    e.target.value = roundedValue.toString();
                                  }
                                }}
                                className="w-20 text-center"
                              />
                              <span className="text-sm text-gray-500">min</span>
                            </div>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={type.is_exclusive}
                                onChange={() => handleToggleExclusive(type.id, type.is_exclusive)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-500">
                                Exclusive
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}