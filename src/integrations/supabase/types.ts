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
      [_ in never]: never
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
    Enums: {},
  },
} as const
