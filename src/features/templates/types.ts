export interface Template {
  id: string;
  name: string;
  type: 'email' | 'sow';
  content: string;
  is_active: boolean;
}

export interface TemplateVariable {
  name: string;
  variable: string;
  description: string;
}