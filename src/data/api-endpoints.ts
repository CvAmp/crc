interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  authentication: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  response?: {
    status: number;
    example: string;
  };
}

export const endpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/events',
    description: 'Retrieve a list of calendar events',
    authentication: true,
    parameters: [
      {
        name: 'start_date',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Start date for the range of events'
      },
      {
        name: 'end_date',
        type: 'string (ISO 8601)',
        required: true,
        description: 'End date for the range of events'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "start_time": "string",
      "end_time": "string",
      "customer_name": "string",
      "so_id": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/events',
    description: 'Create a new calendar event',
    authentication: true,
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Title of the event'
      },
      {
        name: 'start_time',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Start time of the event'
      },
      {
        name: 'end_time',
        type: 'string (ISO 8601)',
        required: true,
        description: 'End time of the event'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "title": "string",
    "start_time": "string",
    "end_time": "string"
  }
}`
    }
  }
];

export const additionalEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/accelerations',
    description: 'Retrieve a list of acceleration requests',
    authentication: true,
    parameters: [
      {
        name: 'product_type',
        type: 'string (uuid)',
        required: false,
        description: 'Filter by product type ID'
      },
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Filter by status (pending, approved, rejected)'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "number",
      "customer_name": "string",
      "so_id": "string",
      "sr_id": "string",
      "site_address": "string",
      "product_type": "uuid",
      "change_types": "uuid[]",
      "created_at": "string",
      "created_by": "uuid"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/accelerations',
    description: 'Create a new acceleration request',
    authentication: true,
    parameters: [
      {
        name: 'customer_name',
        type: 'string',
        required: true,
        description: 'Name of the customer'
      },
      {
        name: 'so_id',
        type: 'string',
        required: true,
        description: 'Service Order ID'
      },
      {
        name: 'sr_id',
        type: 'string',
        required: true,
        description: 'Service Request ID'
      },
      {
        name: 'site_address',
        type: 'string',
        required: true,
        description: 'Customer site address'
      },
      {
        name: 'product_type',
        type: 'string (uuid)',
        required: true,
        description: 'Product type ID'
      },
      {
        name: 'change_types',
        type: 'array<string> (uuid[])',
        required: true,
        description: 'Array of change type IDs'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "number",
    "customer_name": "string",
    "so_id": "string",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/availability',
    description: 'Get available time slots',
    authentication: true,
    parameters: [
      {
        name: 'date',
        type: 'string (YYYY-MM-DD)',
        required: true,
        description: 'Date to check availability'
      },
      {
        name: 'product_type',
        type: 'string (uuid)',
        required: true,
        description: 'Product type ID to check availability for'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "start_time": "string",
      "end_time": "string",
      "capacity": "number",
      "available": "number"
    }
  ]
}`
    }
  },
  {
    method: 'GET',
    path: '/users/me',
    description: 'Get current user information',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "team_id": "uuid"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/events/:id',
    description: 'Update an existing calendar event',
    authentication: true,
    parameters: [
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'New title for the event'
      },
      {
        name: 'start_time',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New start time'
      },
      {
        name: 'end_time',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New end time'
      },
      {
        name: 'notes',
        type: 'string',
        required: false,
        description: 'Updated notes'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "title": "string",
    "start_time": "string",
    "end_time": "string",
    "updated_at": "string"
  }
}`
    }
  },
  {
    method: 'DELETE',
    path: '/events/:id',
    description: 'Delete a calendar event',
    authentication: true,
    response: {
      status: 204,
      example: ''
    }
  }
];

export const templateEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/templates',
    description: 'Retrieve all templates',
    authentication: true,
    parameters: [
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Filter by template type (email, sow)'
      },
      {
        name: 'is_active',
        type: 'boolean',
        required: false,
        description: 'Filter by active status'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "type": "string",
      "content": "string",
      "is_active": "boolean",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/templates',
    description: 'Create a new template',
    authentication: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Template name'
      },
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Template type (email, sow)'
      },
      {
        name: 'content',
        type: 'string',
        required: true,
        description: 'Template content with variables'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "name": "string",
    "type": "string",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/product-types',
    description: 'Retrieve all product types',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "created_at": "string",
      "change_types": [
        {
          "id": "uuid",
          "name": "string",
          "duration_minutes": "number",
          "is_exclusive": "boolean"
        }
      ]
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/product-types',
    description: 'Create a new product type',
    authentication: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Product type name'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "name": "string",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'POST',
    path: '/change-types',
    description: 'Create a new change type',
    authentication: true,
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Change type name'
      },
      {
        name: 'product_type_id',
        type: 'string (uuid)',
        required: true,
        description: 'Associated product type ID'
      },
      {
        name: 'duration_minutes',
        type: 'number',
        required: true,
        description: 'Duration in minutes'
      },
      {
        name: 'is_exclusive',
        type: 'boolean',
        required: true,
        description: 'Whether this change type is exclusive'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "name": "string",
    "product_type_id": "uuid",
    "duration_minutes": "number",
    "is_exclusive": "boolean",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/templates/:id/activate',
    description: 'Set a template as active (deactivates other templates of the same type)',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "is_active": true,
    "updated_at": "string"
  }
}`
    }
  }
];

export const availabilityEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/availability/defaults',
    description: 'Retrieve default availability settings for each day of the week',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "day_of_week": "number",
      "start_time": "string (HH:mm)",
      "end_time": "string (HH:mm)",
      "capacity": "number"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/availability/defaults',
    description: 'Create a new default availability setting',
    authentication: true,
    parameters: [
      {
        name: 'day_of_week',
        type: 'number (0-6)',
        required: true,
        description: 'Day of week (0 = Sunday, 6 = Saturday)'
      },
      {
        name: 'start_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'Start time in 24-hour format'
      },
      {
        name: 'end_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'End time in 24-hour format'
      },
      {
        name: 'capacity',
        type: 'number',
        required: true,
        description: 'Maximum number of concurrent appointments'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "day_of_week": "number",
    "start_time": "string",
    "end_time": "string",
    "capacity": "number"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/availability/overrides',
    description: 'Retrieve date-specific availability overrides',
    authentication: true,
    parameters: [
      {
        name: 'start_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'Start date for filtering overrides'
      },
      {
        name: 'end_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'End date for filtering overrides'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "override_date": "string",
      "start_time": "string",
      "end_time": "string",
      "capacity": "number"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/availability/defaults/engineer',
    description: 'Assign an engineer to a specific time slot',
    authentication: true,
    parameters: [
      {
        name: 'day_of_week',
        type: 'number (0-6)',
        required: true,
        description: 'Day of week (0 = Sunday, 6 = Saturday)'
      },
      {
        name: 'start_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'Start time in 24-hour format'
      },
      {
        name: 'end_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'End time in 24-hour format'
      },
      {
        name: 'engineer_id',
        type: 'string (uuid)',
        required: true,
        description: 'ID of the engineer to assign'
      },
      {
        name: 'team_id',
        type: 'string (uuid)',
        required: true,
        description: 'ID of the team'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "day_of_week": "number",
    "start_time": "string",
    "end_time": "string",
    "engineer_id": "string",
    "team_id": "string"
  }
}`
    }
  },
  {
    method: 'POST',
    path: '/availability/overrides',
    description: 'Create a date-specific availability override',
    authentication: true,
    parameters: [
      {
        name: 'override_date',
        type: 'string (YYYY-MM-DD)',
        required: true,
        description: 'Date for the override'
      },
      {
        name: 'start_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'Start time in 24-hour format'
      },
      {
        name: 'end_time',
        type: 'string (HH:mm)',
        required: true,
        description: 'End time in 24-hour format'
      },
      {
        name: 'capacity',
        type: 'number',
        required: true,
        description: 'Maximum number of concurrent appointments'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "override_date": "string",
    "start_time": "string",
    "end_time": "string",
    "capacity": "number"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/blocked-dates',
    description: 'Retrieve blocked dates',
    authentication: true,
    parameters: [
      {
        name: 'start_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'Start date for filtering blocked dates'
      },
      {
        name: 'end_date',
        type: 'string (YYYY-MM-DD)',
        required: false,
        description: 'End date for filtering blocked dates'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "date": "string",
      "reason": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/blocked-dates',
    description: 'Block a specific date',
    authentication: true,
    parameters: [
      {
        name: 'date',
        type: 'string (YYYY-MM-DD)',
        required: true,
        description: 'Date to block'
      },
      {
        name: 'reason',
        type: 'string',
        required: false,
        description: 'Reason for blocking the date'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "date": "string",
    "reason": "string"
  }
}`
    }
  }
];

export const teamsMeetingEndpoints: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/teams/meetings',
    description: 'Create a new Teams meeting for an appointment',
    authentication: true,
    parameters: [
      {
        name: 'startTime',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Meeting start time'
      },
      {
        name: 'endTime',
        type: 'string (ISO 8601)',
        required: true,
        description: 'Meeting end time'
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        description: 'Meeting title (e.g., SO-12345)'
      },
      {
        name: 'customerName',
        type: 'string',
        required: true,
        description: 'Customer name for meeting details'
      },
      {
        name: 'soId',
        type: 'string',
        required: true,
        description: 'Service Order ID for reference'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "string",
    "joinUrl": "string",
    "createdAt": "string"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/teams/meetings/:id',
    description: 'Update an existing Teams meeting',
    authentication: true,
    parameters: [
      {
        name: 'startTime',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New meeting start time'
      },
      {
        name: 'endTime',
        type: 'string (ISO 8601)',
        required: false,
        description: 'New meeting end time'
      },
      {
        name: 'title',
        type: 'string',
        required: false,
        description: 'New meeting title'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "string",
    "joinUrl": "string",
    "updatedAt": "string"
  }
}`
    }
  },
  {
    method: 'DELETE',
    path: '/teams/meetings/:id',
    description: 'Delete a Teams meeting',
    authentication: true,
    response: {
      status: 204,
      example: ''
    }
  },
  {
    method: 'GET',
    path: '/teams/meetings/:id',
    description: 'Get Teams meeting details',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "string",
    "joinUrl": "string",
    "title": "string",
    "startTime": "string",
    "endTime": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}`
    }
  }
];

export const schedulingThresholdEndpoints: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/scheduling-thresholds',
    description: 'Retrieve scheduling thresholds for all product types',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": [
    {
      "id": "uuid",
      "product_type_id": "uuid",
      "minimum_days_notice": "number",
      "max_displayed_slots": "number",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}`
    }
  },
  {
    method: 'POST',
    path: '/scheduling-thresholds',
    description: 'Create a scheduling threshold for a product type',
    authentication: true,
    parameters: [
      {
        name: 'product_type_id',
        type: 'string (uuid)',
        required: true,
        description: 'Product type ID to create threshold for'
      },
      {
        name: 'minimum_days_notice',
        type: 'number',
        required: true,
        description: 'Minimum number of days notice required for scheduling'
      },
      {
        name: 'max_displayed_slots',
        type: 'number',
        required: true,
        description: 'Maximum number of time slots to display in suggestions'
      }
    ],
    response: {
      status: 201,
      example: `{
  "data": {
    "id": "uuid",
    "product_type_id": "uuid",
    "minimum_days_notice": "number",
    "max_displayed_slots": "number",
    "created_at": "string"
  }
}`
    }
  },
  {
    method: 'PUT',
    path: '/scheduling-thresholds/:id',
    description: 'Update a scheduling threshold',
    authentication: true,
    parameters: [
      {
        name: 'minimum_days_notice',
        type: 'number',
        required: false,
        description: 'New minimum days notice requirement'
      },
      {
        name: 'max_displayed_slots',
        type: 'number',
        required: false,
        description: 'New maximum displayed slots'
      }
    ],
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "minimum_days_notice": "number",
    "max_displayed_slots": "number",
    "updated_at": "string"
  }
}`
    }
  },
  {
    method: 'GET',
    path: '/scheduling-thresholds/:id',
    description: 'Get scheduling threshold details',
    authentication: true,
    response: {
      status: 200,
      example: `{
  "data": {
    "id": "uuid",
    "product_type_id": "uuid",
    "minimum_days_notice": "number",
    "max_displayed_slots": "number",
    "created_at": "string",
    "updated_at": "string"
  }
}`
    }
  }
];