export interface TimeRange {
  startTime: string;
  endTime: string;
  capacity: number;
  teamId?: string;
  engineerId?: string;
  id?: string;
}

export interface DaySchedule {
  enabled: boolean;
  ranges: TimeRange[];
}

export interface Team {
  id: string;
  name: string;
}

export type WeekSchedule = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DaySchedule;
};

export interface BlockedDate {
  date: string;
  reason: string;
  teamId?: string;
  applyToAllTeams?: boolean;
}