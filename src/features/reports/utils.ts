import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import type { DateRangeType, ReportSummary } from './types';

export function getDateRange(type: DateRangeType, startDate?: string, endDate?: string) {
  const now = new Date();

  switch (type) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now)
      };
    case 'week':
      return {
        start: startOfWeek(now),
        end: endOfWeek(now)
      };
    case 'month':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
    case 'quarter':
      return {
        start: startOfQuarter(now),
        end: endOfQuarter(now)
      };
    case 'year':
      return {
        start: startOfYear(now),
        end: endOfYear(now)
      };
    case 'custom':
      return {
        start: startDate ? parseISO(startDate) : startOfMonth(now),
        end: endDate ? parseISO(endDate) : endOfMonth(now)
      };
    default:
      return {
        start: startOfMonth(now),
        end: endOfMonth(now)
      };
  }
}

export function isDateInRange(dateStr: string, startDate: Date, endDate: Date): boolean {
  try {
    const date = parseISO(dateStr);
    return date >= startDate && date <= endDate;
  } catch {
    return false;
  }
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
}

export function createReportSummary(
  filteredData: unknown[],
  startDate: Date,
  endDate: Date,
  metrics: Record<string, unknown> = {}
): ReportSummary {
  return {
    totalRecords: filteredData.length,
    dateRange: {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd')
    },
    metrics
  };
}

export function groupByProperty<T extends Record<string, unknown>>(
  data: T[],
  property: string
): Record<string, T[]> {
  return data.reduce((groups, item) => {
    const key = String(item[property] ?? 'unknown');
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortData<T extends Record<string, unknown>>(
  data: T[],
  sortBy: string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
}

export function selectColumns<T extends Record<string, unknown>>(
  data: T[],
  columns: string[]
): Partial<T>[] {
  if (columns.length === 0) return data;

  return data.map(item => {
    const selected: Partial<T> = {};
    columns.forEach(col => {
      if (col in item) {
        selected[col as keyof T] = item[col];
      }
    });
    return selected;
  });
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        const stringValue = String(value ?? '');
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function exportToJSON(data: Record<string, unknown>[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
  link.click();
  window.URL.revokeObjectURL(url);
}
