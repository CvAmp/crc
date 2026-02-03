import React from 'react';
import { History, Trash2, Download, FileCheck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { ReportExecution } from '../types';
import { format, parseISO } from 'date-fns';

interface ReportHistoryProps {
  executions: ReportExecution[];
  onDelete: (executionId: string) => void;
}

export function ReportHistory({ executions, onDelete }: ReportHistoryProps) {
  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'appointments': 'Appointments',
      'tiv': 'TIV Requests',
      'accelerations': 'Accelerations',
      'team-activity': 'Team Activity',
      'capacity': 'Capacity',
      'custom': 'Custom'
    };
    return labels[type] || type;
  };

  if (executions.length === 0) {
    return (
      <Card className="text-center py-12">
        <History className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No report history</h3>
        <p className="text-gray-600 mt-2">Your generated reports will appear here</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {executions.map(execution => (
        <Card key={execution.id}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="primary">{getReportTypeLabel(execution.reportType)}</Badge>
                {execution.exported && (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <FileCheck className="w-3 h-3" />
                    <span>Exported</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date Range</p>
                  <p className="text-gray-900 font-medium">
                    {format(parseISO(execution.dateRangeStart), 'MMM dd')} - {format(parseISO(execution.dateRangeEnd), 'MMM dd, yyyy')}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Records</p>
                  <p className="text-gray-900 font-medium">{execution.resultCount.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-gray-500">Generated</p>
                  <p className="text-gray-900 font-medium">
                    {format(parseISO(execution.executedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {Object.keys(execution.resultSummary.metrics).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Metrics</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(execution.resultSummary.metrics).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-600">{key}:</span>{' '}
                        <span className="font-semibold text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onDelete(execution.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors ml-4"
              title="Delete from history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
