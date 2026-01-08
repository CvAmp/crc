'use server';

import { useStore } from '../store';
import type { Template } from '../features/templates/types';

export async function addTemplateAction(template: Omit<Template, 'id'>) {
  const store = useStore.getState();

  try {
    store.addTemplate(template);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add template' 
    };
  }
}

export async function updateTemplateAction(id: string, updates: Partial<Template>) {
  const store = useStore.getState();

  try {
    store.updateTemplate(id, updates);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update template' 
    };
  }
}

export async function removeTemplateAction(id: string) {
  const store = useStore.getState();

  try {
    store.removeTemplate(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove template' 
    };
  }
}

export async function setTemplateActiveAction(id: string) {
  const store = useStore.getState();

  try {
    const template = store.templates.find(t => t.id === id);
    if (!template) {
      return { 
        success: false, 
        error: 'Template not found' 
      };
    }
    
    store.setTemplatesInactive(template.type);
    store.setTemplateActive(id);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set template as active' 
    };
  }
}