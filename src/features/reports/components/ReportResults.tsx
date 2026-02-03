import React from 'react';
import { Download, FileJson } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import type { ReportSummary } from '../types';
import { exportToCSV, exportToJSON } from '../utils';

interface ReportResultsProps {
  data: Record<string, unknown>[];
  summary: ReportSummary;
  reportName: string;
  onSaveTemplate?: () => void;
}

export function ReportResults({ data, summary, reportName, onSaveTemplate }: ReportResultsProps) {
  const handleExportCSV = () => {
    exportToCSV(data, reportName);
  };

  const handleExportJSON = () => {
    exportToJSON(data, reportName);
  };

  const metricsEntries = Object.entries(summary.metrics);

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Report Results</h3>
            <p className="text-sm text-gray-500 mt-1">{summary.dateRange.start} to {summary.dateRange.end}</p>
          </div>
          <div className="flex gap-2">
            {onSaveTemplate && (
              <Button
                onClick={onSaveTemplate}
                variant="ghost"
                size="sm"
              >
                Save as Template
              </Button>
            )}
            <Button
              onClick={handleExportJSON}
              icon={FileJson}
              variant="ghost"
              size="sm"
            >
              JSON
            </Button>
            <Button
              onClick={handleExportCSV}
              icon={Download}
              variant="primary"
              size="sm"
            >
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{summary.totalRecords}</p>
          </div>
          {metricsEntries.slice(0, 3).map(([key, value]) => (
            <div key={key} className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {typeof value === 'number' ? value.toLocaleString() : String(value)}
              </p>
            </div>
          ))}
        </div>

        {data.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b border-gray-200">
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="px-4 py-3 text-left font-semibold text-gray-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      {Object.values(row).map((value, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-3 text-gray-600">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length > 50 && (
              <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 border-t">
                Showing 50 of {data.length} records. Export to see all data.
              </div>
            )}
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No data found for the selected criteria.
          </div>
        )}
      </div>
    </Card>
  );
}
