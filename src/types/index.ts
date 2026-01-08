// Core Types
export type UserRole = 'ADMIN' | 'CPM' | 'ENGINEER' | 'CPM_MANAGER' | 'ENGINEER_MANAGER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  created_at?: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'email' | 'sow';
  content: string;
  is_active: boolean;
}

export interface CalendarEvent {
  id: string;
  event_id: number;
  title: string;
  startTime: string;
  endTime: string;
  createdBy: string;
  assignedTo: string[];
  customerName: string;
  customerAddress: string;
  productType: string;
  changeTypes: string[];
  orderId: string;
  srId: string;
  notes?: string;
  bridge?: string;
  needsFsoDispatch?: boolean;
  sowDetails?: string;
  teams_meeting_id?: string;
  teams_meeting_url?: string;
  teams_meeting_created_at?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  capacity: number;
  available: number;
  key?: string;
}

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

export interface ProductType {
  id: string;
  name: string;
}

export interface ChangeType {
  id: string;
  name: string;
  product_type_id?: string;
  duration_minutes: number;
  is_exclusive: boolean;
}

export interface AccelerationField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'product_type' | 'change_type';
  required: boolean;
  order: number;
  options?: {
    options?: string[];
  };
  show_in_create_form: boolean;
}