import React from 'react';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import type { ProductType } from '../../types';

interface ProductTypeSelectorProps {
  productTypes: ProductType[];
  selectedType: string;
  onChange: (value: string) => void;
}

export function ProductTypeSelector({
  productTypes,
  selectedType,
  onChange
}: ProductTypeSelectorProps) {
  return (
    <FormField label="Product Type" required>
      <Select
        required
        value={selectedType}
        onChange={(e) => onChange(e.target.value)}
        options={[
          { value: '', label: 'Select a product type' },
          ...productTypes.map(type => ({
            value: type.id,
            label: type.name
          }))
        ]}
      />
    </FormField>
  );
}