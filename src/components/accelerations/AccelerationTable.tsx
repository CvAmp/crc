import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ArrowUpDown, GripHorizontal, Save, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';
import type { Column, Acceleration } from './types';

interface AccelerationField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  show_in_create_form: boolean;
}

interface AccelerationTableProps {
  accelerations: Acceleration[];
  onEdit: (acceleration: Acceleration) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  draggedColumn: number | null;
  sortField: keyof Acceleration;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Acceleration) => void;
}

export function AccelerationTable({
  accelerations,
  onEdit,
  onDragStart,
  onDragOver,
  onDragEnd,
  draggedColumn,
  sortField,
  sortDirection,
  onSort
}: AccelerationTableProps) {
  const user = useStore((state) => state.user);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableFields, setAvailableFields] = useState<AccelerationField[]>([]);
  const store = useStore();

  useEffect(() => {
    fetchFieldConfiguration();
  }, []);

  const handleSaveLayout = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Save layout to store
      store.setUserFieldLayout(user.id, columns.map((column, index) => ({
        field: column.key,
        order: index * 10
      })));

      setSuccess('Layout saved successfully');
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving layout:', err);
      setError('Failed to save layout');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetLayout = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Reset layout in store
      store.resetUserFieldLayout(user.id);

      // Refetch default layout
      await fetchFieldConfiguration();
      
      setSuccess('Layout reset to default');
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error resetting layout:', err);
      setError('Failed to reset layout');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };
  const fetchFieldConfiguration = async () => {
    try {
      // Get fields from store
      const fields = store.accelerationFields;
      if (!fields.length) throw new Error('No fields configuration found');

      setAvailableFields(fields);
      // Create a map of available fields for quick lookup
      const fieldMap = new Map(fields.map(f => [f.id, f]));

      if (user?.id) {
        try {
          // Get user's layout from store
          const userLayout = store.getUserFieldLayout(user.id);
          
          if (userLayout) {
            setColumns(mapFieldsToColumns(userLayout));
            setHasUnsavedChanges(false);
            return;
          }
        } catch (err) {
          console.warn('Error loading user layout, falling back to default:', err);
        }
      }

      // Fall back to default layout
      setColumns(mapFieldsToColumns(fields));
      setHasUnsavedChanges(false);

    } catch (err) {
      console.error('Error fetching field configuration:', err);
      setError('Failed to load field configuration');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const mapFieldsToColumns = (fields: { name: string; label: string }[]): Column[] => {
    return fields.map(field => ({
      key: field.name as keyof Acceleration,
      label: field.label,
      width: field.name === 'id' ? '80px' : 
             field.name === 'so_id' || field.name === 'sr_id' ? '120px' :
             field.name === 'created_at' ? '180px' : undefined
    }));
  };


  // Update hasUnsavedChanges when columns change
  useEffect(() => {
    if (!loading) {
      setHasUnsavedChanges(true);
    }
  }, [columns]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
          {success && (
            <span className="text-sm text-green-600">{success}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <span className="text-sm text-gray-500">
              You have unsaved changes
            </span>
          )}
          <button
            onClick={handleResetLayout}
            disabled={saving}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md flex items-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
          <button
            onClick={handleSaveLayout}
            disabled={!hasUnsavedChanges || saving}
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center space-x-1
              ${hasUnsavedChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Layout'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="select-none">
            {columns.map(({ key, label, width }, index) => (
              <th
                key={key}
                scope="col"
                draggable
                style={{ width }}
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragEnd={onDragEnd}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
                  ${draggedColumn === index ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
              >
                <div className="flex items-center space-x-2 group">
                  <GripHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                  <button
                    onClick={() => onSort(key)}
                    className="flex items-center space-x-1"
                  >
                    <span>{label}</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accelerations.map((acceleration) => (
            <tr
              key={acceleration.id}
              className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              onClick={() => onEdit(acceleration)}
            >
              {columns.map(({ key }) => (
                <td
                  key={key}
                  className={`px-6 py-4 text-sm ${
                    key === 'id' ? 'font-medium text-gray-900' : 'text-gray-600'
                  } ${key === 'site_address' ? '' : 'whitespace-nowrap'}`}
                >
                  {key === 'product_type_name' ? (
                    <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                      {acceleration[key]}
                    </span>
                  ) : key === 'created_at' ? (
                    format(new Date(acceleration[key]), 'PPp')
                  ) : (
                    acceleration[key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}