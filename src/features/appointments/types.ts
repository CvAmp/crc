export interface AppointmentFormData {
  customerName: string;
  orderId: string;
  srId: string;
  customerAddress: string;
  bridge: string;
  notes: string;
  needsFsoDispatch: boolean;
  sowDetails: string;
  productType: string;
  changeTypes: string[];
}

export interface AppointmentDetails {
  id: string;
  event_id: number;
  title: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerAddress: string;
  orderId: string;
  srId: string;
  bridge?: string;
  notes?: string;
  needsFsoDispatch: boolean;
  sowDetails?: string;
  teams_meeting_id?: string;
  teams_meeting_url?: string;
  teams_meeting_created_at?: string;
}