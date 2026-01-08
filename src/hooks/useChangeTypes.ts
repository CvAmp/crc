import { useState, useEffect } from 'react';
import type { ChangeType } from '../types';

export function useChangeTypes(productTypeId: string | null, changeTypes: ChangeType[]) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ChangeType[]>([]);

  // Update filtered types when product type or change types change
  useEffect(() => {
    if (productTypeId) {
      const filtered = changeTypes.filter(ct => ct.product_type_id === productTypeId);
      setFilteredTypes(filtered);
      setSelectedTypes([]);
    } else {
      setFilteredTypes([]);
      setSelectedTypes([]);
    }
  }, [productTypeId, changeTypes]);

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

  const onChangeTypeSelect = (typeId: string, isChecked: boolean) => {
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

  return {
    selectedTypes,
    filteredTypes,
    isChangeTypeDisabled,
    onChangeTypeSelect,
    setSelectedTypes
  };
}