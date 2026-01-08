export interface Column {
  key: keyof Acceleration;
  label: string;
  width?: string;
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
  product_type_name?: string;
  change_type_names?: string[];
}