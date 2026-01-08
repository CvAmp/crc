import React from 'react';
import { Clock } from 'lucide-react';
import { FormField } from '../ui/FormField';
import type { ChangeType } from '../../types';

interface ChangeTypeSelectorProps {
  changeTypes: ChangeType[];
  selectedTypes: string[];
  onSelect: (typeId: string, isChecked: boolean) => void;
  isDisabled: (typeId: string) => boolean;
}

export function ChangeTypeSelector({
  changeTypes,
  selectedTypes,
  onSelect,
  isDisabled
}: ChangeTypeSelectorProps) {
  return (
    <FormField label="Change Type" required>
      <div className="space-y-2">
        {changeTypes.map((type) => {
          const isSelected = selectedTypes.includes(type.id);
          const disabled = isDisabled(type.id);

          return (
            <label 
              key={type.id} 
              className={`flex items-center justify-between p-3 bg-gray-50 rounded-md border ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
              } ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}
            >
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  value={type.id}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={(e) => onSelect(type.id, e.target.checked)}
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
      </div>
    </FormField>
  );
}