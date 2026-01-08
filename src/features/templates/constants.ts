import type { TemplateVariable } from './types';

export const AVAILABLE_VARIABLES: TemplateVariable[] = [
  { name: 'Notes', variable: '{Notes}', description: 'Event notes/description' },
  { name: 'Bridge', variable: '{Bridge}', description: 'Conference bridge details' },
  { name: 'ProductType', variable: '{ProductType}', description: 'Product type name' },
  { name: 'ChangeTypes', variable: '{ChangeTypes}', description: 'List of change types' },
  { name: 'EventDate', variable: '{EventDate}', description: 'Event date' },
  { name: 'EventStartTime', variable: '{EventStartTime}', description: 'Event start time (time only)' },
  { name: 'EventEndTime', variable: '{EventEndTime}', description: 'Event end time (time only)' },
  { name: 'CustomerName', variable: '{CustomerName}', description: 'Customer name' },
  { name: 'CustomerAddress', variable: '{CustomerAddress}', description: 'Customer address' },
  { name: 'SRID', variable: '{SRID}', description: 'Service Request ID' },
  { name: 'SOID', variable: '{SOID}', description: 'Service Order ID' }
];