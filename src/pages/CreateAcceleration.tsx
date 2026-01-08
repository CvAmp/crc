import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Building2 } from 'lucide-react';
import { useStore } from '../store';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner'; 

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

interface AccelerationField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'product_type' | 'change_type';
  required: boolean;
  order: number;
  options?: {
    options?: string[];
  };
  show_in_create_form: boolean;
}

interface AccelerationFormData {
  customerName: string;
  orderId: string;
  srId: string;
  siteAddress: string;
  productType: string;
  changeTypes: string[];
  customFields: Record<string, string>;
}

export function CreateAcceleration() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const store = useStore();
  const [teams, setTeams] = useState<{ id: string; name: string; }[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [changeTypes, setChangeTypes] = useState<ChangeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<AccelerationField[]>([]);
  const [formData, setFormData] = useState<AccelerationFormData>({
    customerName: '',
    orderId: '',
    srId: '',
    siteAddress: '',
    productType: '',
    changeTypes: [] as string[],
    customFields: {} as Record<string, string>
  });

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ChangeType[]>([]);

  // Initialize required fields
  useEffect(() => {
    setRequiredFields([
      'customer_name',
      'order_id',
      'sr_id',
      'site_address',
      'product_type',
      'change_types'
    ]);
  }, []);

  useEffect(() => {
    if (formData.productType) {
      setFilteredTypes(changeTypes.filter(ct => ct.product_type_id === formData.productType));
      setSelectedTypes([]);
    } else {
      setFilteredTypes([]);
      setSelectedTypes([]);
    }
  }, [formData.productType, changeTypes]);

  const isChangeTypeDisabled = (typeId: string) => {
    const changeType = changeTypes.find(ct => ct.id === typeId);
    if (!changeType) return false;

    if (changeType.is_exclusive && !selectedTypes.includes(typeId)) {
      return selectedTypes.length > 0;
    }

    const hasExclusiveSelected = selectedTypes.some(id => 
      changeTypes.find(ct => ct.id === id)?.is_exclusive
    );
    return hasExclusiveSelected && !selectedTypes.includes(typeId);
  };

  const handleChangeTypeSelection = (typeId: string, isChecked: boolean) => {
    const changeType = filteredTypes.find(ct => ct.id === typeId);
    if (!changeType) return;

    if (isChecked && changeType.is_exclusive) {
      setSelectedTypes([typeId]);
      return;
    }

    setSelectedTypes(prev => {
      if (isChecked) {
        const hasExclusiveType = prev.some(id => 
          changeTypes.find(ct => ct.id === id)?.is_exclusive
        );

        if (hasExclusiveType) {
          return prev;
        }

        return [...prev, typeId];
      }

      return prev.filter(t => t !== typeId);
    });
  };

  useEffect(() => {
    async function fetchData() {
      setTeams(store.teams);
      setProductTypes(store.productTypes.filter(pt => pt.teamId === selectedTeam));
      setChangeTypes(store.changeTypes);
      setLoading(false);
    }

    fetchData();
  }, [store.teams, store.productTypes, store.changeTypes, selectedTeam]);

  // Fetch product types when team is selected
  useEffect(() => {
    if (!selectedTeam) {
      setProductTypes([]);
      setChangeTypes([]);
      return;
    }

    setProductTypes(store.productTypes.filter(pt => pt.teamId === selectedTeam));
    setChangeTypes(store.changeTypes);
  }, [selectedTeam, store.productTypes, store.changeTypes]);

  const getTotalDuration = () => {
    return formData.changeTypes.reduce((total, typeId) => {
      const changeType = changeTypes.find(ct => ct.id === typeId);
      return total + (changeType?.duration_minutes || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create an acceleration');
      return;
    }

    // Validate required fields before proceeding
    const missingFields = requiredFields.filter(fieldName => {
      if (fieldName === 'customer_name') return !formData.customerName.trim();
      if (fieldName === 'order_id') return !formData.orderId.trim();
      if (fieldName === 'sr_id') return !formData.srId.trim();
      if (fieldName === 'site_address') return !formData.siteAddress.trim();
      if (fieldName === 'product_type') return !formData.productType;
      if (fieldName === 'change_types') return formData.changeTypes.length === 0;
      
      // Check custom fields
      if (fieldName in formData.customFields) {
        const value = formData.customFields[fieldName];
        return Array.isArray(value) ? value.length === 0 : !value?.trim();
      }
      
      return false;
    });

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(field => {
        const customField = customFields.find(f => f.name === field);
        return customField ? customField.label : field.replace(/_/g, ' ');
      }).join(', ')}`);
      return;
    }

    // Submit the form using the server action
    try {
      await store.addAcceleration({
        customer_name: formData.customerName,
        order_id: formData.orderId,
        sr_id: formData.srId,
        site_address: formData.siteAddress,
        product_type: formData.productType,
        change_types: selectedTypes,
        created_by: user?.id || 'anonymous'
      });
      
      navigate('/accelerations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create acceleration');
    }
  };

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Acceleration</h1>

        {/* Team Selection */}
        <div className="mb-6">
          <FormField 
            label="Team" 
            required 
            icon={Building2}
            error={error && !selectedTeam ? 'Please select a team' : undefined}
          >
            <Select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setFormData(prev => ({ ...prev, productType: '', changeTypes: [] }));
              }}
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

        {error && (
          <Alert type="error" message={error} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Customer Name"
            required={requiredFields.includes('customer_name')}
            error={error && !formData.customerName.trim() ? 'Customer name is required' : undefined}
          >
            <Input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="Enter customer name"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="SO ID"
              required={requiredFields.includes('order_id')}
              error={error && !formData.orderId.trim() ? 'SO ID is required' : undefined}
            >
              <Input
                type="text"
                required
                pattern="\d{1,10}"
                value={formData.orderId}
                onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="Enter SO ID"
              />
            </FormField>

            <FormField
              label="SR ID"
              required={requiredFields.includes('sr_id')}
              error={error && !formData.srId.trim() ? 'SR ID is required' : undefined}
            >
              <Input
                type="text"
                required
                value={formData.srId}
                onChange={(e) => setFormData(prev => ({ ...prev, srId: e.target.value }))}
                placeholder="Enter SR ID"
              />
            </FormField>
          </div>

          <FormField
            label="Site Address"
            required={requiredFields.includes('site_address')}
            error={error && !formData.siteAddress.trim() ? 'Site address is required' : undefined}
          >
            <TextArea
              required
              value={formData.siteAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, siteAddress: e.target.value }))}
              rows={4}
              placeholder="Enter site address"
            />
          </FormField>

          <FormField
            label="Product Type"
            required={requiredFields.includes('product_type')}
            error={error && selectedTeam && !formData.productType ? 'Product type is required' : undefined}
          >
            {!selectedTeam ? (
              <p className="text-sm text-gray-500">Please select a team first</p>
            ) : (
              <Select
                required
                value={formData.productType}
                onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                options={[
                  { value: '', label: 'Select a product type' },
                  ...productTypes.map(type => ({
                    value: type.id,
                    label: type.name
                  }))
                ]}
              />
            )}
          </FormField>

          <FormField
            label="Change Type"
            required={requiredFields.includes('change_types')}
            error={error && formData.changeTypes.length === 0 ? 'At least one change type is required' : undefined}
          >
            {!formData.productType ? (
              <p className="text-sm text-gray-500">Please select a product type first</p>
            ) : filteredTypes.length === 0 ? (
              <p className="text-sm text-gray-500">No change types available for this product</p>
            ) : (
              <div className="space-y-2">
                {filteredTypes.map((type) => {
                  const isSelected = selectedTypes.includes(type.id);
                  const isDisabled = isChangeTypeDisabled(type.id);

                  return (
                    <label 
                      key={type.id} 
                      className={`flex items-center justify-between p-3 bg-gray-50 rounded-md border ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
                      } ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          value={type.id}
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => handleChangeTypeSelection(type.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{type.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{type.duration_minutes} min</span>
                        {type.is_exclusive && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                            Exclusive
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
                {selectedTypes.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Total Duration: {getTotalDuration()} minutes
                  </p>
                )}
              </div>
            )}
          </FormField>

          <div className="space-y-6">
            {customFields
              .filter(field => {
                // Filter out built-in fields
                if (['customer_name', 'order_id', 'sr_id', 'site_address', 'product_type', 'change_type', 'change_types'].includes(field.name)) {
                  return false;
                }
                // Show field if it's required or marked as visible
                return field.required || field.show_in_create_form;
              })
              .map((field) => (
                <FormField
                  key={field.id}
                  label={field.label}
                  required={field.required}
                  error={error && field.required && !formData.customFields[field.name]?.trim() ? `${field.label} is required` : undefined}
                >
                  {field.type === 'select' ? (
                    <select
                      value={formData.customFields[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customFields: {
                          ...prev.customFields,
                          [field.name]: e.target.value
                        }
                      }))}
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData.customFields[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customFields: {
                          ...prev.customFields,
                          [field.name]: e.target.value
                        }
                      }))}
                      required={field.required}
                      rows={6}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.customFields[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        customFields: {
                          ...prev.customFields,
                          [field.name]: e.target.value
                        }
                      }))}
                      required={field.required}
                    />
                  )}
                </FormField>
              ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Create Acceleration
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAcceleration;