import React, { useState, useEffect } from 'react';
import { useFormState } from 'react';
import { Plus, Trash2, AlertCircle, Check, FileText, Mail, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import { Alert } from '../components/ui/Alert';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { AVAILABLE_VARIABLES } from '../features/templates/constants';
import { 
  addTemplateAction, 
  updateTemplateAction, 
  removeTemplateAction, 
  setTemplateActiveAction 
} from '../actions/templates';
import type { Template } from '../features/templates/types';

export function ModifyTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const store = useStore();
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    type: 'email' | 'sow';
    content: string;
    is_active: boolean;
  }>({
    name: '',
    type: 'sow' as const,
    content: '',
    is_active: false
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setTemplates(store.templates);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await store.addTemplate(newTemplate);
      setSuccess('Template added successfully');
      setTimeout(() => setSuccess(null), 3000);
      setNewTemplate({
        name: '',
        type: 'sow',
        content: '',
        is_active: false
      });
      await fetchTemplates();
    } catch (err) {
      console.error('Error adding template:', err);
      setError('Failed to add template');
    }
  };

  const handleUpdateTemplate = async (template: Template) => {
    try {
      await store.updateTemplate(template.id, {
        name: template.name,
        content: template.content
      });
      setSuccess('Template updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      setEditingTemplate(null);
      await fetchTemplates();
    } catch (err) {
      console.error('Error updating template:', err);
      setError('Failed to update template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try {
      await store.removeTemplate(templateToDelete.id);
      setSuccess('Template deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      setTemplateToDelete(null);
      await fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
    }
  };

  const handleSetActive = async (template: Template) => {
    try {
      store.setTemplatesInactive(template.type);
      store.setTemplateActive(template.id);
      setSuccess('Template set as active successfully');
      setTimeout(() => setSuccess(null), 3000);
      await fetchTemplates();
    } catch (err) {
      console.error('Error setting template as active:', err);
      setError('Failed to set template as active');
    }
  };

  const insertVariable = (variable: string, targetId: string) => {
    const textarea = document.getElementById(targetId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);

    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        content: before + variable + after
      });
    } else {
      setNewTemplate(prev => ({
        ...prev,
        content: before + variable + after
      }));
    }

    // Reset the selected variable
    setSelectedVariable('');
  };

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Modify Templates</h1>

        {error && (
          <Alert type="error" message={error} />
        )}

        {success && (
          <Alert type="success" message={success} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Template Form */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Template</h2>
            
            <form onSubmit={handleAddTemplate} className="space-y-4">
              <FormField label="Template Name" required>
                <Input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormField>

              <FormField label="Template Type" required>
                <Select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    type: e.target.value as 'email' | 'sow'
                  }))}
                  required
                  options={[
                    { value: 'sow', label: 'Scope of Work Details' },
                    { value: 'email', label: 'Email Template' }
                  ]}
                />
              </FormField>

              <FormField label="Template Content" required>
                <div className="mb-2">
                  <Select
                    value={selectedVariable}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        insertVariable(value, 'newTemplateContent');
                      }
                    }}
                    options={[
                      { value: '', label: 'Insert Variable...' },
                      ...AVAILABLE_VARIABLES.map(v => ({
                        value: v.variable,
                        label: `${v.name} - ${v.description}`
                      }))
                    ]}
                  >
                  </Select>
                </div>
                <TextArea
                  id="newTemplateContent"
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                  required
                  rows={6}
                  placeholder="Enter template content"
                />
              </FormField>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Template
              </button>
            </form>
          </div>

          {/* Existing Templates */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Templates</h2>
            
            <div className="space-y-4">
              {templates.length === 0 ? (
                <p className="text-gray-500">No templates created yet</p>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {template.type === 'email' ? (
                          <Mail className="w-5 h-5 text-blue-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-green-500" />
                        )}
                        <h3 className="font-medium text-gray-900">
                          {template.name}
                        </h3>
                        {template.is_active && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            In use by {template.type === 'sow' ? 'Scope of Work Details' : 'Email Notifications'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {!template.is_active && template.type === 'sow' && (
                          <button
                            onClick={() => handleSetActive(template)}
                            className="text-green-600 hover:text-green-700 px-2 py-1 rounded-md hover:bg-green-50"
                          >
                            Set Active
                          </button>
                        )}
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setTemplateToDelete(template)}
                          className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingTemplate?.id === template.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            name: e.target.value
                          })}
                          className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div>
                          <select
                            value={selectedVariable}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                insertVariable(value, `template-${template.id}`);
                              }
                            }}
                            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500 mb-2"
                          >
                            <option value="">Insert Variable...</option>
                            {AVAILABLE_VARIABLES.map(v => (
                              <option key={v.variable} value={v.variable}>
                                {v.name} - {v.description}
                              </option>
                            ))}
                          </select>
                          <textarea
                            id={`template-${template.id}`}
                            value={editingTemplate.content}
                            onChange={(e) => setEditingTemplate({
                              ...editingTemplate,
                              content: e.target.value
                            })}
                            rows={6}
                            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingTemplate(null)}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateTemplate(editingTemplate)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        {template.content}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {templateToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 text-red-600 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Confirm Delete</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the template "{templateToDelete.name}"? 
                {templateToDelete.is_active && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Warning: This template is currently active and in use.
                  </span>
                )}
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setTemplateToDelete(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTemplate}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}