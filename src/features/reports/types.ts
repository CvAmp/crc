export type ReportType = 'appointments' | 'tiv' | 'accelerations' | 'team-activity' | 'capacity' | 'custom';

export type DateRangeType = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ReportConfiguration {
  reportType: ReportType;
  dateRange: DateRangeType;
  startDate?: string;
  endDate?: string;
  teamId?: string;
  userId?: string;
  status?: string;
  columns: string[];
  groupBy?: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface ReportTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  reportType: ReportType;
  configuration: ReportConfiguration;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: string;
  templateId?: string;
  userId: string;
  reportType: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  filters: Record<string, unknown>;
  resultCount: number;
  resultSummary: ReportSummary;
  executedAt: string;
  exported: boolean;
  exportFormat?: string;
}

export interface ReportSummary {
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: Record<string, unknown>;
}

export interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  data: Record<string, unknown>[];
  summary: ReportSummary;
  generatedAt: string;
}
