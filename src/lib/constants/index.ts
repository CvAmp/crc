// Day mappings
export const dayToNumber = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6
} as const;

export const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
] as const;

// Time constants
export const DEFAULT_START_TIME = '08:00';
export const DEFAULT_END_TIME = '17:00';
export const DEFAULT_CAPACITY = 2;

// Template variables
export const TEMPLATE_VARIABLES = [
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
] as const;