import React from 'react';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import type { AppointmentFormData } from '../../types';

interface AppointmentDetailsProps {
  formData: AppointmentFormData;
  onFieldChange: <K extends keyof AppointmentFormData>(field: K, value: AppointmentFormData[K]) => void;
}

export function AppointmentDetails({ formData, onFieldChange }: AppointmentDetailsProps) {
  return (
    <div className="space-y-4">
      <FormField label="Customer Name" required>
        <Input
          type="text"
          required
          value={formData.customerName}
          onChange={(e) => onFieldChange('customerName', e.target.value)}
          placeholder="Enter customer name"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="SO ID" required>
          <Input
            type="text"
            required
            pattern="\d{1,10}"
            value={formData.orderId}
            onChange={(e) => onFieldChange('orderId', e.target.value)}
            placeholder="Enter Order ID"
          />
        </FormField>

        <FormField label="SR ID" required>
          <Input
            type="text"
            required
            value={formData.srId}
            onChange={(e) => onFieldChange('srId', e.target.value)}
            placeholder="Enter SR ID"
          />
        </FormField>
      </div>

      <FormField label="Customer Address" required>
        <TextArea
          required
          value={formData.customerAddress}
          onChange={(e) => onFieldChange('customerAddress', e.target.value)}
          rows={2}
          placeholder="Enter Customer Address"
        />
      </FormField>

      <FormField label="Bridge">
        <Input
          type="text"
          value={formData.bridge}
          onChange={(e) => onFieldChange('bridge', e.target.value)}
          placeholder="leave blank for Teams automation"
        />
      </FormField>

      <FormField label="Notes / Description">
        <TextArea
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="Enter additional notes (optional)"
        />
      </FormField>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.needsFsoDispatch}
            onChange={(e) => onFieldChange('needsFsoDispatch', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Needs FSO Dispatch
          </span>
        </label>
      </div>

      {formData.needsFsoDispatch && (
        <FormField label="Scope of Work Details" required>
          <TextArea
            required
            value={formData.sowDetails}
            onChange={(e) => onFieldChange('sowDetails', e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Enter Scope of Work details"
          />
        </FormField>
      )}
    </div>
  );
}