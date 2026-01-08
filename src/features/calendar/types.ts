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

export type EventFilter = 'my-events' | 'team-events' | 'all-events';