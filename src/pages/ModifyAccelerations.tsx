import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Plus, Trash2, GripVertical, Settings, X } from 'lucide-react';
import { useStore } from '../store';

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

export function ModifyAccelerations() {
  const store = useStore();
  const [fields, setFields] = useState<AccelerationField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<AccelerationField | null>(null);
  const [draggedField, setDraggedField] = useState<AccelerationField | null>(null);
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text' as AccelerationField['type'],
    required: false,
    options: { options: [] as string[] },
    show_in_create_form: false
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setFields(store.accelerationFields);
    } catch (err) {
      console.error('Error fetching fields:', err);
      setError('Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (field: AccelerationField) => {
    setDraggedField(field);
  };

  const handleDragOver = (e: React.DragEvent, targetField: AccelerationField) => {
    e.preventDefault();
    if (!draggedField || draggedField.id === targetField.id) return;

    const updatedFields = [...fields];
    const draggedIndex = fields.findIndex(f => f.id === draggedField.id);
    const targetIndex = fields.findIndex(f => f.id === targetField.id);

    updatedFields.splice(draggedIndex, 1);
    updatedFields.splice(targetIndex, 0, draggedField);
    
    // Update order values
    const reorderedFields = updatedFields.map((field, index) => ({
      ...field,
      order: (index + 1) * 10
    }));
    
    setFields(reorderedFields);
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    if (!draggedField) return;
    setDraggedField(null);
  };

  const handleSaveLayout = async () => {
    try {
      // Update fields in store
      store.setAccelerationFields(fields);

      setSuccess('Field order updated successfully');
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating field order:', err);
      setError('Failed to update field order');
      await fetchFields(); // Reload original order
    }
  };

  const handleToggleRequired = async (field: AccelerationField) => {
    try {
      store.updateAccelerationField(field.id, { required: !field.required });

      setSuccess('Field updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchFields();
    } catch (err) {
      console.error('Error updating field:', err);
      setError('Failed to update field');
    }
  };

  const handleToggleActive = async (field: AccelerationField) => {
    try {
      store.updateAccelerationField(field.id, { 
        show_in_create_form: !field.show_in_create_form 
      });

      setSuccess('Field visibility updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      fetchFields();
    } catch (err) {
      console.error('Error updating field:', err);
      setError('Failed to update field');
    }
  };

  const handleUpdateField = async (field: AccelerationField) => {
    try {
      store.updateAccelerationField(field.id, {
        label: field.label,
        options: field.options
      });

      setSuccess('Field updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      setEditingField(null);
      fetchFields();
    } catch (err) {
      console.error('Error updating field:', err);
      setError('Failed to update field');
    }
  };

  const handleAddField = async () => {
    if (!newField.name.trim() || !newField.label.trim()) {
      setError('Name and label are required');
      return;
    }

    // Convert name to snake_case
    const snakeCaseName = newField.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    try {
      store.addAccelerationField({
        name: snakeCaseName,
        label: newField.label,
        type: newField.type,
        required: newField.required,
        order: (fields.length + 1) * 10,
        options: newField.type === 'select' ? newField.options : null,
        show_in_create_form: newField.required
      });

      setSuccess('Field added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setShowNewFieldForm(false);
      setNewField({
        name: '',
        label: '',
        type: 'text',
        required: false,
        options: { options: [] }
      });
      fetchFields();
    } catch (err) {
      console.error('Error adding field:', err);
      setError('Failed to add field');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Modify Accelerations</h1>
            {success && (
              <div className="text-green-600 font-medium flex items-center">
                <Check className="w-5 h-5 mr-2" />
                {success}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <button
                onClick={handleSaveLayout}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <Check className="w-5 h-5 mr-2" />
                Save Layout
              </button>
            )}
            <button
              onClick={() => setShowNewFieldForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Field
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {fields.map((field) => (
            <div
              key={field.id}
              draggable
              onDragStart={() => handleDragStart(field)}
              onDragOver={(e) => handleDragOver(e, field)}
              onDragEnd={handleDragEnd}
              className={`p-4 bg-white border rounded-lg ${
                draggedField?.id === field.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                  {editingField?.id === field.id ? (
                    <input
                      type="text"
                      value={editingField.label}
                      onChange={(e) => setEditingField({
                        ...editingField,
                        label: e.target.value
                      })}
                      className="rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{field.label}</span>
                  )}
                  <span className="text-sm text-gray-500">({field.type})</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={() => handleToggleRequired(field)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </label>

                  <label className="flex items-center space-x-2" title="Controls whether this field appears in the Create Acceleration form">
                    <input
                      type="checkbox"
                     checked={field.show_in_create_form}
                      disabled={field.required}
                      onChange={() => handleToggleActive(field)}
                      className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                        field.required
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    />
                    <span className="text-sm text-gray-600">Show in Create Form</span>
                  </label>

                  {/* Edit button */}
                  <button
                    onClick={() => setEditingField(field)}
                    className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {editingField?.id === field.id && (
                <div className="mt-4 pl-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Label
                      </label>
                      <input
                        type="text"
                        value={editingField.label}
                        onChange={(e) => setEditingField({
                          ...editingField,
                          label: e.target.value
                        })}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {field.type === 'select' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Options
                        </label>
                        <div className="space-y-2">
                          {editingField.options?.options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(editingField.options?.options || [])];
                                  newOptions[index] = e.target.value;
                                  setEditingField({
                                    ...editingField,
                                    options: { options: newOptions }
                                  });
                                }}
                                className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                onClick={() => {
                                  const newOptions = [...(editingField.options?.options || [])];
                                  newOptions.splice(index, 1);
                                  setEditingField({
                                    ...editingField,
                                    options: { options: newOptions }
                                  });
                                }}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newOptions = [...(editingField.options?.options || []), ''];
                              setEditingField({
                                ...editingField,
                                options: { options: newOptions }
                              });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setEditingField(null)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateField(editingField)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* New Field Modal */}
        {showNewFieldForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Field</h2>
                <button
                  onClick={() => setShowNewFieldForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name *
                  </label>
                  <input
                    type="text"
                    value={newField.name}
                    onChange={(e) => setNewField(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter field name (will be converted to snake_case)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Label *
                  </label>
                  <input
                    type="text"
                    value={newField.label}
                    onChange={(e) => setNewField(prev => ({
                      ...prev,
                      label: e.target.value
                    }))}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter display label"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField(prev => ({
                      ...prev,
                      type: e.target.value as AccelerationField['type']
                    }))}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                  </select>
                </div>

                {newField.type === 'select' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options
                    </label>
                    <div className="space-y-2">
                      {newField.options.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newField.options.options];
                              newOptions[index] = e.target.value;
                              setNewField(prev => ({
                                ...prev,
                                options: { options: newOptions }
                              }));
                            }}
                            className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => {
                              const newOptions = [...newField.options.options];
                              newOptions.splice(index, 1);
                              setNewField(prev => ({
                                ...prev,
                                options: { options: newOptions }
                              }));
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setNewField(prev => ({
                            ...prev,
                            options: {
                              options: [...prev.options.options, '']
                            }
                          }));
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Option
                      </button>
                    </div>
                  </div>
                )}

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => {
                      const isRequired = e.target.checked;
                      setNewField(prev => ({
                        ...prev,
                        required: isRequired,
                        // If field becomes required, ensure it's active
                        is_active: isRequired ? true : prev.is_active
                      }));
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Required field</span>
                  <span className="text-xs text-gray-500 ml-2">(Required fields are automatically shown in Create Form)</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newField.is_active}
                    disabled={newField.required}
                    onChange={(e) => setNewField(prev => ({
                      ...prev,
                      is_active: e.target.checked
                    }))}
                    className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                      newField.required ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="text-sm text-gray-700">Show in Create Form</span>
                  <span className="text-xs text-gray-500 ml-2">(Controls visibility in Create Acceleration form)</span>
                </label>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowNewFieldForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddField}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Field
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModifyAccelerations;