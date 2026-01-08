import React from 'react';
import { format, parseISO } from 'date-fns';
import { Building2, Calendar as CalendarIcon, Clock, FileText, MapPin, User, FileSpreadsheet } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { DialogFooter } from './ui/DialogFooter';
import { Button } from './ui/Button';
import { useFormState } from 'react';
import { updateSOWAction } from '../actions/appointment';

interface FSOConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    sowDetails: string;
    customerName: string;
    orderId: string;
    srId: string;
    customerAddress: string;
    startTime: string;
    endTime: string;
    notes: string;
  };
}

export function FSOConfirmationModal({ open, onClose, onConfirm, data }: FSOConfirmationModalProps) {
  const [formData, updateSOW] = useFormState(updateSOWAction, data);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Confirm FSO Dispatch Appointment"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="bg-secondary-bg/50 rounded-lg p-4 space-y-4">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-accent mt-1" />
            <div>
              <h3 className="font-medium text-primary-text">Customer Information</h3>
              <p className="text-secondary-text">{data.customerName}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-accent mt-1" />
            <div>
              <h3 className="font-medium text-primary-text">Site Address</h3>
              <p className="text-secondary-text whitespace-pre-line">{data.customerAddress}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <FileSpreadsheet className="w-5 h-5 text-accent mt-1" />
            <div>
              <h3 className="font-medium text-primary-text">Service Orders</h3>
              <div className="space-y-1">
                <p className="text-secondary-text">Order ID: {data.orderId}</p>
                <p className="text-secondary-text">SR ID: {data.srId}</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <CalendarIcon className="w-5 h-5 text-accent mt-1" />
            <div>
              <h3 className="font-medium text-primary-text">Date & Time</h3>
              <div className="space-y-1">
                <p className="text-secondary-text">
                  {format(parseISO(data.startTime), 'MMMM d, yyyy')}
                </p>
                <p className="text-secondary-text">
                  {format(parseISO(data.startTime), 'h:mm a')} - {format(parseISO(data.endTime), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {data.notes && (
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-accent mt-1" />
              <div>
                <h3 className="font-medium text-primary-text">Notes</h3>
                <p className="text-secondary-text whitespace-pre-line">{data.notes}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-accent/5 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Building2 className="w-5 h-5 text-accent" />
            <h3 className="font-medium text-primary-text">Scope of Work Details</h3>
            <span className="text-sm text-secondary-text">(Click to edit)</span>
          </div>
          <div className="bg-primary-bg rounded-md p-4">
            <textarea
              value={formData.sowDetails}
              onChange={(e) => updateSOW(e.target.value)}
              className="w-full min-h-[200px] bg-transparent border-0 focus:ring-0 text-secondary-text text-sm resize-none"
              placeholder="Enter scope of work details..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Back to Edit
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm and Create
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}