export interface AccelerationField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'product_type' | 'change_type';
  required: boolean;
  order: number;
  options?: {
    options?: string[];
  };
  show_in_create_form: boolean;
}

export interface Acceleration {
  id: number;
  customer_name: string;
  order_id: string;
  sr_id: string;
  site_address: string;
  product_type: string;
  change_types: string[];
  created_at: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string;
  product_type_name?: string;
  change_type_names?: string[];
}

export interface Column {
  key: keyof Acceleration;
  label: string;
  width?: string;
}