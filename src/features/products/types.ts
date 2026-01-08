export interface ProductType {
  id: string;
  name: string;
}

export interface ChangeType {
  id: string;
  name: string;
  product_type_id?: string;
  duration_minutes: number;
  is_exclusive: boolean;
}

export interface SchedulingThreshold {
  id: string;
  product_type_id: string;
  minimum_days_notice: number;
  days_to_display: number;
}