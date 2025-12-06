export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actions_log: {
        Row: {
          action: string
          created_at: string | null
          file_id: string | null
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          file_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          file_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_log_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          branch_code: string
          branch_type: string
          chain_id: string | null
          created_at: string
          icon_url: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          map_link: string | null
          name: string
          name_ar: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          branch_code: string
          branch_type?: string
          chain_id?: string | null
          created_at?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          map_link?: string | null
          name: string
          name_ar?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          branch_code?: string
          branch_type?: string
          chain_id?: string | null
          created_at?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          map_link?: string | null
          name?: string
          name_ar?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      file_permissions: {
        Row: {
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          file_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          file_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          file_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_permissions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          approved: boolean | null
          content_type: string | null
          created_at: string | null
          filename: string
          id: string
          is_readonly: boolean | null
          project_id: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          approved?: boolean | null
          content_type?: string | null
          created_at?: string | null
          filename: string
          id?: string
          is_readonly?: boolean | null
          project_id?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          approved?: boolean | null
          content_type?: string | null
          created_at?: string | null
          filename?: string
          id?: string
          is_readonly?: boolean | null
          project_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          reviewer_id: string | null
          technician_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          reviewer_id?: string | null
          technician_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          reviewer_id?: string | null
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          branch_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          final_cost: number | null
          id: string
          images: string[] | null
          notes: string | null
          order_number: string
          priority: string | null
          requested_by: string | null
          scheduled_at: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          started_at: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          technician_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          images?: string[] | null
          notes?: string | null
          order_number: string
          priority?: string | null
          requested_by?: string | null
          scheduled_at?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          technician_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          images?: string[] | null
          notes?: string | null
          order_number?: string
          priority?: string | null
          requested_by?: string | null
          scheduled_at?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          technician_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_locations: {
        Row: {
          id: string
          latitude: number
          longitude: number
          recorded_at: string
          technician_id: string
        }
        Insert: {
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string
          technician_id: string
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_locations_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string
          rating: number | null
          secondary_skills: Database["public"]["Enums"]["service_type"][] | null
          specialty: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["technician_status"] | null
          total_orders: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone: string
          rating?: number | null
          secondary_skills?:
            | Database["public"]["Enums"]["service_type"][]
            | null
          specialty: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["technician_status"] | null
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string
          rating?: number | null
          secondary_skills?:
            | Database["public"]["Enums"]["service_type"][]
            | null
          specialty?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["technician_status"] | null
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tender_access_links: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          tender_id: string | null
          valid_until: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          tender_id?: string | null
          valid_until: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          tender_id?: string | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_access_links_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_device_lock: {
        Row: {
          created_at: string | null
          device_fp: string
          id: string
          ip_address: string | null
          tender_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fp: string
          id?: string
          ip_address?: string | null
          tender_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fp?: string
          id?: string
          ip_address?: string | null
          tender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_device_lock_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_signatures: {
        Row: {
          full_name: string | null
          geo: string | null
          id: string
          ip_address: string
          organization: string | null
          phone: string | null
          signature_base64: string
          tender_id: string | null
          timestamp: string | null
          token_hash: string
        }
        Insert: {
          full_name?: string | null
          geo?: string | null
          id?: string
          ip_address: string
          organization?: string | null
          phone?: string | null
          signature_base64: string
          tender_id?: string | null
          timestamp?: string | null
          token_hash: string
        }
        Update: {
          full_name?: string | null
          geo?: string | null
          id?: string
          ip_address?: string
          organization?: string | null
          phone?: string | null
          signature_base64?: string
          tender_id?: string | null
          timestamp?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_signatures_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_tracking: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          employee_id: string | null
          entry_hash: string | null
          id: string
          ip_address: string | null
          tender_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          employee_id?: string | null
          entry_hash?: string | null
          id?: string
          ip_address?: string | null
          tender_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          employee_id?: string | null
          entry_hash?: string | null
          id?: string
          ip_address?: string | null
          tender_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_tracking_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_violations: {
        Row: {
          created_at: string | null
          device_fp: string | null
          employee_id: string | null
          id: string
          ip: string | null
          reason: string | null
          tender_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          device_fp?: string | null
          employee_id?: string | null
          id?: string
          ip?: string | null
          reason?: string | null
          tender_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          device_fp?: string | null
          employee_id?: string | null
          id?: string
          ip?: string | null
          reason?: string | null
          tender_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_violations_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          client_name: string | null
          created_at: string | null
          encrypted_pdf: string
          id: string
          link_expires_at: string
          server_key: string
          status: string | null
          tender_code: string
          title: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          encrypted_pdf: string
          id?: string
          link_expires_at: string
          server_key: string
          status?: string | null
          tender_code: string
          title: string
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          encrypted_pdf?: string
          id?: string
          link_expires_at?: string
          server_key?: string
          status?: string | null
          tender_code?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      vault_hash: { Args: { input: string }; Returns: string }
    }
    Enums: {
      order_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
      service_type:
        | "electrical"
        | "plumbing"
        | "ac"
        | "carpentry"
        | "painting"
        | "general"
      technician_status: "available" | "busy" | "offline"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      service_type: [
        "electrical",
        "plumbing",
        "ac",
        "carpentry",
        "painting",
        "general",
      ],
      technician_status: ["available", "busy", "offline"],
    },
  },
} as const
