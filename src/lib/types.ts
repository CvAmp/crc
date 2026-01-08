export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: UserRole
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          team_id?: string | null
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          team_id: string
          user_id: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          team_id?: string
          user_id?: string
          role?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          start_time: string
          end_time: string
          created_by: string
          team_id: string | null
          customer_name: string
          customer_address: string
          product_type_id: string
          order_id: string
          sr_id: string
          bridge: string | null
          notes: string | null
          needs_fso_dispatch: boolean
          sow_details: string | null
          teams_meeting_id: string | null
          teams_meeting_url: string | null
          teams_meeting_created_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          start_time: string
          end_time: string
          created_by: string
          team_id?: string | null
          customer_name: string
          customer_address: string
          product_type_id: string
          order_id: string
          sr_id: string
          bridge?: string | null
          notes?: string | null
          needs_fso_dispatch?: boolean
          sow_details?: string | null
          teams_meeting_id?: string | null
          teams_meeting_url?: string | null
          teams_meeting_created_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          start_time?: string
          end_time?: string
          team_id?: string | null
          customer_name?: string
          customer_address?: string
          product_type_id?: string
          order_id?: string
          sr_id?: string
          bridge?: string | null
          notes?: string | null
          needs_fso_dispatch?: boolean
          sow_details?: string | null
          teams_meeting_id?: string | null
          teams_meeting_url?: string | null
          teams_meeting_created_at?: string | null
          updated_at?: string
        }
      }
    }
    Enums: {
      user_role: UserRole
    }
  }
}

export type UserRole = 'CPM' | 'ENGINEER' | 'CPM_MANAGER' | 'ENGINEER_MANAGER' | 'ADMIN'