import { v4 as uuidv4 } from 'uuid';
import type { ReportTemplate, ReportExecution, ReportConfiguration } from '../types';

const TEMPLATES_KEY = 'report_templates';
const EXECUTIONS_KEY = 'report_executions';

export class ReportService {
  static getTemplates(userId: string): ReportTemplate[] {
    try {
      const templates = localStorage.getItem(TEMPLATES_KEY);
      if (!templates) return [];

      const allTemplates: ReportTemplate[] = JSON.parse(templates);
      return allTemplates.filter(t => t.userId === userId || t.isPublic);
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  static getTemplate(id: string): ReportTemplate | null {
    try {
      const templates = localStorage.getItem(TEMPLATES_KEY);
      if (!templates) return null;

      const allTemplates: ReportTemplate[] = JSON.parse(templates);
      return allTemplates.find(t => t.id === id) || null;
    } catch (error) {
      console.error('Error loading template:', error);
      return null;
    }
  }

  static saveTemplate(userId: string, name: string, description: string, config: ReportConfiguration): ReportTemplate {
    try {
      const templates = this.getTemplates(userId);
      const allTemplates = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');

      const newTemplate: ReportTemplate = {
        id: uuidv4(),
        userId,
        name,
        description,
        reportType: config.reportType,
        configuration: config,
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      allTemplates.push(newTemplate);
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(allTemplates));

      return newTemplate;
    } catch (error) {
      console.error('Error saving template:', error);
      throw new Error('Failed to save template');
    }
  }

  static updateTemplate(templateId: string, userId: string, updates: Partial<ReportTemplate>): ReportTemplate {
    try {
      const allTemplates: ReportTemplate[] = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
      const index = allTemplates.findIndex(t => t.id === templateId && t.userId === userId);

      if (index === -1) {
        throw new Error('Template not found or unauthorized');
      }

      allTemplates[index] = {
        ...allTemplates[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(allTemplates));
      return allTemplates[index];
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  }

  static deleteTemplate(templateId: string, userId: string): void {
    try {
      const allTemplates: ReportTemplate[] = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
      const filtered = allTemplates.filter(t => !(t.id === templateId && t.userId === userId));

      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw new Error('Failed to delete template');
    }
  }

  static getExecutions(userId: string, limit: number = 50): ReportExecution[] {
    try {
      const executions = localStorage.getItem(EXECUTIONS_KEY);
      if (!executions) return [];

      const allExecutions: ReportExecution[] = JSON.parse(executions);
      return allExecutions
        .filter(e => e.userId === userId)
        .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error loading executions:', error);
      return [];
    }
  }

  static saveExecution(execution: Omit<ReportExecution, 'id' | 'executedAt'>): ReportExecution {
    try {
      const allExecutions: ReportExecution[] = JSON.parse(localStorage.getItem(EXECUTIONS_KEY) || '[]');

      const newExecution: ReportExecution = {
        ...execution,
        id: uuidv4(),
        executedAt: new Date().toISOString()
      };

      allExecutions.push(newExecution);

      // Keep only last 100 executions per user
      const userExecutions = allExecutions.filter(e => e.userId === execution.userId);
      if (userExecutions.length > 100) {
        const sorted = userExecutions.sort((a, b) =>
          new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
        );
        const toKeep = sorted.slice(0, 100).map(e => e.id);
        const filtered = allExecutions.filter(e =>
          e.userId !== execution.userId || toKeep.includes(e.id)
        );
        localStorage.setItem(EXECUTIONS_KEY, JSON.stringify([...filtered, newExecution]));
      } else {
        localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(allExecutions));
      }

      return newExecution;
    } catch (error) {
      console.error('Error saving execution:', error);
      throw new Error('Failed to save execution');
    }
  }

  static deleteExecution(executionId: string, userId: string): void {
    try {
      const allExecutions: ReportExecution[] = JSON.parse(localStorage.getItem(EXECUTIONS_KEY) || '[]');
      const filtered = allExecutions.filter(e => !(e.id === executionId && e.userId === userId));

      localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting execution:', error);
      throw new Error('Failed to delete execution');
    }
  }

  static clearUserData(userId: string): void {
    try {
      const allTemplates: ReportTemplate[] = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
      const filteredTemplates = allTemplates.filter(t => t.userId !== userId);
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filteredTemplates));

      const allExecutions: ReportExecution[] = JSON.parse(localStorage.getItem(EXECUTIONS_KEY) || '[]');
      const filteredExecutions = allExecutions.filter(e => e.userId !== userId);
      localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(filteredExecutions));
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}
