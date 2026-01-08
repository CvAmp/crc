import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { DialogFooter } from '../ui/DialogFooter';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import type { Acceleration } from './types';

interface EditModalProps {
  acceleration: Acceleration;
  editFormData: {
    customerName: string;
    orderId: string;
    srID: string;
    siteAddress: string;
    productType: string;
    changeTypes: string[];
  };
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onFormChange: (field: string, value: string | string[]) => void;
  productTypes: { id: string; name: string; }[];
  changeTypes: { id: string; name: string; product_type_id: string; }[];
}

export function EditModal({
  acceleration,
  editFormData,
  onClose,
  onUpdate,
  onDelete,
  onFormChange,
  productTypes,
  changeTypes
}: EditModalProps) {
  return (
    <Dialog
      open={true}
      onClose={onClose}
      title={`Edit Acceleration #${acceleration.id}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <FormField label="Customer Name" required>
          <Input
            type="text"
            value={editFormData.customerName}
            onChange={(e) => onFormChange('customerName', e.target.value)}
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="SO ID" required>
            <Input
              type="text"
              value={editFormData.orderId}
              onChange={(e) => onFormChange('orderId', e.target.value)}
              required
              pattern="\d{1,10}"
            />
          </FormField>

          <FormField label="SR ID" required>
            <Input
              type="text"
              value={editFormData.srID}
              onChange={(e) => onFormChange('srID', e.target.value)}
              required
            />
          </FormField>
        </div>

        <FormField label="Site Address" required>
          <TextArea
            value={editFormData.siteAddress}
            onChange={(e) => onFormChange('siteAddress', e.target.value)}
            rows={2}
            required
          />
        </FormField>

        <FormField label="Product Type" required>
          <Select
            value={editFormData.productType}
            onChange={(e) => onFormChange('productType', e.target.value)}
            required
            options={productTypes.map(type => ({
              value: type.id,
              label: type.name
            }))}
          />
        </FormField>

        <FormField label="Change Types" required>
          <div className="space-y-2">
            {changeTypes
              .filter(ct => ct.product_type_id === editFormData.productType)
              .map((type) => (
                <label key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.changeTypes.includes(type.id)}
                    onChange={(e) => {
                      const newChangeTypes = e.target.checked
                        ? [...editFormData.changeTypes, type.id]
                        : editFormData.changeTypes.filter(id => id !== type.id);
                      onFormChange('changeTypes', newChangeTypes);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">{type.name}</span>
                </label>
              ))}
          </div>
        </FormField>

        <DialogFooter>
          <Button
            variant="danger"
            onClick={onDelete}
            icon={Trash2}
          >
            Delete
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onUpdate}
            icon={Pencil}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}