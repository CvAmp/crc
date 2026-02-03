import React from 'react';
import { FormField } from '../../../components/ui/FormField';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import type { ReportConfiguration, ReportType, DateRangeType } from '../types';

interface ReportConfigFormProps {
  config: ReportConfiguration;
  onChange: (config: ReportConfiguration) => void;
  teams: Array<{ id: string; name: string }>;
}

export function ReportConfigForm({ config, onChange, teams }: ReportConfigFormProps) {
  const updateConfig = (updates: Partial<ReportConfiguration>) => {
    onChange({ ...config, ...updates });
  };

  const reportTypeOptions = [
    { value: 'appointments', label: 'Appointments' },
    { value: 'tiv', label: 'TIV Requests' },
    { value: 'accelerations', label: 'Accelerations' },
    { value: 'team-activity', label: 'Team Activity' },
    { value: 'capacity', label: 'Capacity Utilization' },
  ];

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'status', label: 'Status' },
    { value: 'productType', label: 'Product Type' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Report Type" required>
          <Select
            value={config.reportType}
            onChange={(e) => updateConfig({ reportType: e.target.value as ReportType })}
            options={reportTypeOptions}
          />
        </FormField>

        <FormField label="Date Range" required>
          <Select
            value={config.dateRange}
            onChange={(e) => updateConfig({ dateRange: e.target.value as DateRangeType })}
            options={dateRangeOptions}
          />
        </FormField>
      </div>

      {config.dateRange === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Start Date" required>
            <Input
              type="date"
              value={config.startDate || ''}
              onChange={(e) => updateConfig({ startDate: e.target.value })}
            />
          </FormField>
          <FormField label="End Date" required>
            <Input
              type="date"
              value={config.endDate || ''}
              onChange={(e) => updateConfig({ endDate: e.target.value })}
            />
          </FormField>
        </div>
      )}

      {config.reportType !== 'team-activity' && config.reportType !== 'capacity' && (
        <FormField label="Filter by Team">
          <Select
            value={config.teamId || ''}
            onChange={(e) => updateConfig({ teamId: e.target.value })}
            options={[
              { value: '', label: 'All Teams' },
              ...teams.map(team => ({ value: team.id, label: team.name }))
            ]}
          />
        </FormField>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Sort By">
          <Select
            value={config.sortBy}
            onChange={(e) => updateConfig({ sortBy: e.target.value })}
            options={sortOptions}
          />
        </FormField>

        <FormField label="Sort Direction">
          <Select
            value={config.sortDirection}
            onChange={(e) => updateConfig({ sortDirection: e.target.value as 'asc' | 'desc' })}
            options={[
              { value: 'asc', label: 'Ascending' },
              { value: 'desc', label: 'Descending' },
            ]}
          />
        </FormField>
      </div>
    </div>
  );
}
