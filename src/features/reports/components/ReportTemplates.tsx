import React, { useState } from 'react';
import { FileText, Trash2, Play, Globe, Lock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import type { ReportTemplate } from '../types';
import { format, parseISO } from 'date-fns';

interface ReportTemplatesProps {
  templates: ReportTemplate[];
  onLoad: (template: ReportTemplate) => void;
  onDelete: (templateId: string) => void;
  currentUserId: string;
}

export function ReportTemplates({ templates, onLoad, onDelete, currentUserId }: ReportTemplatesProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

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

  if (templates.length === 0) {
    return (
      <Card className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No templates yet</h3>
        <p className="text-gray-600 mt-2">Save a report configuration as a template for quick access</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{template.name}</h4>
                  {template.isPublic ? (
                    <Globe className="w-4 h-4 text-blue-500" title="Public template" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" title="Private template" />
                  )}
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                )}
              </div>
              {template.userId === currentUserId && (
                <button
                  onClick={() => setDeleteId(template.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <Badge variant="primary">{getReportTypeLabel(template.reportType)}</Badge>
              <div className="text-xs text-gray-500">
                Created {format(parseISO(template.createdAt), 'MMM dd, yyyy')}
              </div>
              {template.updatedAt !== template.createdAt && (
                <div className="text-xs text-gray-500">
                  Updated {format(parseISO(template.updatedAt), 'MMM dd, yyyy')}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <span className="font-medium">{template.configuration.dateRange}</span>
                </div>
                {template.configuration.teamId && (
                  <div className="flex justify-between mt-1">
                    <span>Team Filter:</span>
                    <span className="font-medium">Yes</span>
                  </div>
                )}
                <div className="flex justify-between mt-1">
                  <span>Sort:</span>
                  <span className="font-medium">
                    {template.configuration.sortBy} ({template.configuration.sortDirection})
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => onLoad(template)}
              icon={Play}
              variant="ghost"
              size="sm"
              className="w-full mt-4"
            >
              Load Template
            </Button>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
