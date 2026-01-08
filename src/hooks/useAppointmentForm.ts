import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { createAppointmentAction, updateSOWAction } from '../actions/appointment';
import type { AppointmentFormData, TimeSlot } from '../types';

interface UseAppointmentFormProps {
  onSubmit: (data: AppointmentFormData, slot: TimeSlot | null) => Promise<void>;
}

export function useAppointmentForm({ onSubmit }: UseAppointmentFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AppointmentFormData>({
    customerName: '',
    orderId: '',
    srId: '',
    customerAddress: '',
    bridge: '',
    notes: '',
    needsFsoDispatch: false,
    sowDetails: '',
    productType: '',
    changeTypes: []
  });
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!selectedSlot) {
      setError('Please select a time slot first.');
      return;
    }

    // Validate required fields
    const requiredFields = [
      { field: 'customerName', label: 'Customer Name' },
      { field: 'orderId', label: 'Order ID' },
      { field: 'srId', label: 'SR ID' },
      { field: 'customerAddress', label: 'Customer Address' },
      { field: 'productType', label: 'Product Type' },
      { field: 'changeTypes', label: 'Change Type', validate: (value: string[]) => value.length > 0 }
    ];

    const missingFields = requiredFields.filter(
      ({ field, validate }) => {
        const value = formData[field as keyof AppointmentFormData];
        if (validate) {
          return !validate(value as string[]);
        }
        return !value;
      }
    );

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      // In local storage mode, we don't need to check availability
      // as it's handled by the store

      await onSubmit(formData, selectedSlot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [formData, selectedSlot, onSubmit]);

  const updateField = useCallback(<K extends keyof AppointmentFormData>(
    field: K,
    value: AppointmentFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  }, []);

  const updateSOW = useCallback(async (sowDetails: string) => {
    const updatedFormData = await updateSOWAction(formData, sowDetails);
    setFormData(updatedFormData);
  }, [formData]);

  return {
    formData,
    selectedSlot,
    error,
    setSelectedSlot,
    updateField,
    updateSOW,
    handleSubmit
  };
}