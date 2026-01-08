'use server';

import { useStore } from '../store';
import type { AppointmentFormData, TimeSlot } from '../types';

export async function createAppointmentAction(
  formData: AppointmentFormData,
  slot: TimeSlot,
  userId: string | undefined
) {
  const store = useStore.getState();

  // Create a mock Teams meeting
  const meetingId = Math.random().toString(36).substring(2, 15);
  const joinUrl = `https://teams.microsoft.com/l/meetup-join/${meetingId}`;
  
  // Add event to store
  store.addEvent({
    title: `Order-${formData.orderId}`,
    startTime: slot.startTime,
    endTime: slot.endTime,
    createdBy: userId || 'anonymous',
    assignedTo: [],
    customerName: formData.customerName,
    customerAddress: formData.customerAddress,
    productType: formData.productType,
    changeTypes: formData.changeTypes,
    orderId: formData.orderId,
    srId: formData.srId,
    bridge: `Microsoft Teams Meeting\nJoin URL: ${joinUrl}`,
    notes: formData.notes,
    needsFsoDispatch: formData.needsFsoDispatch,
    sowDetails: formData.needsFsoDispatch ? formData.sowDetails : undefined,
    teams_meeting_id: meetingId,
    teams_meeting_url: joinUrl,
    teams_meeting_created_at: new Date().toISOString()
  });

  return { success: true };
}

export async function updateSOWAction(
  formData: AppointmentFormData,
  sowDetails: string
) {
  return {
    ...formData,
    sowDetails
  };
}