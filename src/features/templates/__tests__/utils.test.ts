import { describe, it, expect } from 'vitest';
import { parseTemplate, validateTemplate } from '../utils';
import { AVAILABLE_VARIABLES } from '../constants';

describe('Template Utils', () => {
  describe('parseTemplate', () => {
    it('replaces all variables in template', () => {
      const template = 'Customer: {CustomerName}\nOrder: {SOID}\nDate: {EventDate}';
      const values = {
        CustomerName: 'John Doe',
        SOID: '12345',
        EventDate: '2025-01-01'
      };

      const result = parseTemplate(template, values);
      expect(result).toBe('Customer: John Doe\nOrder: 12345\nDate: 2025-01-01');
    });

    it('handles missing values', () => {
      const template = 'Customer: {CustomerName}\nNotes: {Notes}';
      const values = { CustomerName: 'John Doe' };

      const result = parseTemplate(template, values);
      expect(result).toBe('Customer: John Doe\nNotes: {Notes}');
    });

    it('ignores unknown variables', () => {
      const template = 'Test: {Unknown}\nCustomer: {CustomerName}';
      const values = { CustomerName: 'John Doe' };

      const result = parseTemplate(template, values);
      expect(result).toBe('Test: {Unknown}\nCustomer: John Doe');
    });
  });

  describe('validateTemplate', () => {
    it('validates template with valid variables', () => {
      const template = 'Customer: {CustomerName}\nOrder: {SOID}';
      const result = validateTemplate(template);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects unknown variables', () => {
      const template = 'Test: {Unknown}\nCustomer: {CustomerName}';
      const result = validateTemplate(template);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unknown variable: {Unknown}');
    });

    it('detects malformed variables', () => {
      const template = 'Test: {CustomerName\nOrder: SOID}';
      const result = validateTemplate(template);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Malformed variable: {CustomerName');
      expect(result.errors).toContain('Malformed variable: SOID}');
    });

    it('validates empty template', () => {
      const result = validateTemplate('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('lists all available variables', () => {
      const result = validateTemplate('');
      expect(result.availableVariables).toEqual(
        AVAILABLE_VARIABLES.map(v => v.variable)
      );
    });
  });
});