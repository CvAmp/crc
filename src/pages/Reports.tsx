import React, { useState, useEffect } from 'react';
import { BarChart3, Play, BookmarkPlus, History as HistoryIcon } from 'lucide-react';
import { useStore } from '../store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Tabs } from '../components/ui/Tabs';
import { Alert } from '../components/ui/Alert';
import { ReportConfigForm } from '../features/reports/components/ReportConfigForm';
import { ReportResults } from '../features/reports/components/ReportResults';
import { ReportTemplates } from '../features/reports/components/ReportTemplates';
import { ReportHistory } from '../features/reports/components/ReportHistory';
import { ReportService } from '../features/reports/services/reportService';
import { generateReportData } from '../features/reports/dataGenerator';
import type { ReportConfiguration, ReportTemplate, ReportExecution, ReportSummary } from '../features/reports/types';

export function Reports() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('generate');
  const [config, setConfig] = useState<ReportConfiguration>({
    reportType: 'appointments',
    dateRange: 'month',
    columns: [],
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  const [generatedData, setGeneratedData] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = store.user;

  useEffect(() => {
    if (user) {
      loadTemplates();
      loadExecutions();
    }
  }, [user]);

  const loadTemplates = () => {
    if (!user) return;
    const userTemplates = ReportService.getTemplates(user.id);
    setTemplates(userTemplates);
  };

  const loadExecutions = () => {
    if (!user) return;
    const userExecutions = ReportService.getExecutions(user.id, 20);
    setExecutions(userExecutions);
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleGenerateReport = async () => {
    if (!user) return;

    setIsGenerating(true);
    setError(null);

    try {
      const { data, summary: reportSummary } = generateReportData(config, {
        events: store.events,
        users: store.users,
        teams: store.teams,
        productTypes: store.productTypes
      });

      setGeneratedData(data);
      setSummary(reportSummary);

      const execution = ReportService.saveExecution({
        userId: user.id,
        reportType: config.reportType,
        dateRangeStart: reportSummary.dateRange.start,
        dateRangeEnd: reportSummary.dateRange.end,
        filters: config.filters || {},
        resultCount: data.length,
        resultSummary: reportSummary,
        exported: false
      });

      loadExecutions();
      showSuccessMessage('Report generated successfully');
    } catch (err) {
      console.error('Error generating report:', err);
      showErrorMessage('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!user) return;

    if (!templateName.trim()) {
      showErrorMessage('Template name is required');
      return;
    }

    try {
      ReportService.saveTemplate(user.id, templateName, templateDescription, config);
      loadTemplates();
      setShowSaveDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      showSuccessMessage('Template saved successfully');
    } catch (err) {
      console.error('Error saving template:', err);
      showErrorMessage('Failed to save template');
    }
  };

  const handleLoadTemplate = (template: ReportTemplate) => {
    setConfig(template.configuration);
    setActiveTab('generate');
    showSuccessMessage(`Template "${template.name}" loaded`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!user) return;

    try {
      ReportService.deleteTemplate(templateId, user.id);
      loadTemplates();
      showSuccessMessage('Template deleted');
    } catch (err) {
      console.error('Error deleting template:', err);
      showErrorMessage('Failed to delete template');
    }
  };

  const handleDeleteExecution = (executionId: string) => {
    if (!user) return;

    try {
      ReportService.deleteExecution(executionId, user.id);
      loadExecutions();
      showSuccessMessage('Report removed from history');
    } catch (err) {
      console.error('Error deleting execution:', err);
      showErrorMessage('Failed to delete execution');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to access reports</p>
      </div>
    );
  }

  const tabs = [
    { id: 'generate', label: 'Generate Report', icon: Play },
    { id: 'templates', label: 'Templates', icon: BookmarkPlus },
    { id: 'history', label: 'History', icon: HistoryIcon }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <BarChart3 className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate customizable reports and track analytics</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'generate' && (
        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Configure Report</h2>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  icon={BookmarkPlus}
                  variant="ghost"
                  size="sm"
                  disabled={!generatedData.length}
                >
                  Save as Template
                </Button>
              </div>

              <ReportConfigForm
                config={config}
                onChange={setConfig}
                teams={store.teams}
              />

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleGenerateReport}
                  icon={Play}
                  variant="primary"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </div>
          </Card>

          {summary && generatedData.length > 0 && (
            <ReportResults
              data={generatedData}
              summary={summary}
              reportName={`${config.reportType}-report`}
              onSaveTemplate={() => setShowSaveDialog(true)}
            />
          )}
        </div>
      )}

      {activeTab === 'templates' && user && (
        <ReportTemplates
          templates={templates}
          onLoad={handleLoadTemplate}
          onDelete={handleDeleteTemplate}
          currentUserId={user.id}
        />
      )}

      {activeTab === 'history' && (
        <ReportHistory
          executions={executions}
          onDelete={handleDeleteExecution}
        />
      )}

      {showSaveDialog && (
        <Dialog
          open={true}
          onClose={() => {
            setShowSaveDialog(false);
            setTemplateName('');
            setTemplateDescription('');
          }}
          title="Save Report Template"
          maxWidth="md"
        >
          <div className="space-y-4">
            <FormField label="Template Name" required>
              <Input
                type="text"
                placeholder="e.g., Monthly Team Performance"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                autoFocus
              />
            </FormField>

            <FormField label="Description">
              <TextArea
                placeholder="Add a description to help identify this template later..."
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
              />
            </FormField>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-gray-700">Template Configuration</p>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Report Type: <span className="font-medium">{config.reportType}</span></div>
                <div>Date Range: <span className="font-medium">{config.dateRange}</span></div>
                <div>Sort: <span className="font-medium">{config.sortBy} ({config.sortDirection})</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSaveDialog(false);
                  setTemplateName('');
                  setTemplateDescription('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveTemplate}
              >
                Save Template
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
