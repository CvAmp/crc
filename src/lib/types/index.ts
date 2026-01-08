// Core Types
export type UserRole = 'USER' | 'CPM_MANAGER' | 'ENGINEER' | 'ENGINEER_MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  teamId?: string;
}

// Common Types
export interface BaseResponse {
  error?: string;
  success?: boolean;
  message?: string;
}