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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      breed_legislation: {
        Row: {
          banned_breeds: Json | null
          created_at: string
          id: string
          lat: number | null
          legislation_type: Database["public"]["Enums"]["legislation_type"]
          lng: number | null
          municipality: string
          municipality_type:
            | Database["public"]["Enums"]["municipality_type"]
            | null
          ordinance: string | null
          ordinance_url: string | null
          population: number | null
          repeal_date: string | null
          state: string
          updated_at: string
          verification_date: string | null
        }
        Insert: {
          banned_breeds?: Json | null
          created_at?: string
          id?: string
          lat?: number | null
          legislation_type?: Database["public"]["Enums"]["legislation_type"]
          lng?: number | null
          municipality: string
          municipality_type?:
            | Database["public"]["Enums"]["municipality_type"]
            | null
          ordinance?: string | null
          ordinance_url?: string | null
          population?: number | null
          repeal_date?: string | null
          state: string
          updated_at?: string
          verification_date?: string | null
        }
        Update: {
          banned_breeds?: Json | null
          created_at?: string
          id?: string
          lat?: number | null
          legislation_type?: Database["public"]["Enums"]["legislation_type"]
          lng?: number | null
          municipality?: string
          municipality_type?:
            | Database["public"]["Enums"]["municipality_type"]
            | null
          ordinance?: string | null
          ordinance_url?: string | null
          population?: number | null
          repeal_date?: string | null
          state?: string
          updated_at?: string
          verification_date?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          clicked_at: string | null
          email_type: Database["public"]["Enums"]["email_type"]
          error_message: string | null
          id: string
          opened_at: string | null
          provider_id: string | null
          recipient_email: string
          sent_at: string
          status: Database["public"]["Enums"]["email_status"]
          subject: string
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          email_type: Database["public"]["Enums"]["email_type"]
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_id?: string | null
          recipient_email: string
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject: string
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          email_type?: Database["public"]["Enums"]["email_type"]
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_id?: string | null
          recipient_email?: string
          sent_at?: string
          status?: Database["public"]["Enums"]["email_status"]
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_campaigns: {
        Row: {
          clicked_count: number | null
          content: string
          created_at: string
          created_by: string
          delivered_count: number | null
          html_content: string | null
          id: string
          opened_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          clicked_count?: number | null
          content: string
          created_at?: string
          created_by: string
          delivered_count?: number | null
          html_content?: string | null
          id?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          clicked_count?: number | null
          content?: string
          created_at?: string
          created_by?: string
          delivered_count?: number | null
          html_content?: string | null
          id?: string
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      submission_documents: {
        Row: {
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          submission_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          submission_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          submission_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_documents_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          admin_feedback: string | null
          created_at: string
          id: string
          original_record_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_data: Json
          type: Database["public"]["Enums"]["submission_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_feedback?: string | null
          created_at?: string
          id?: string
          original_record_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_data: Json
          type: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_feedback?: string | null
          created_at?: string
          id?: string
          original_record_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_data?: Json
          type?: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_original_record_id_fkey"
            columns: ["original_record_id"]
            isOneToOne: false
            referencedRelation: "breed_legislation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_contributions: {
        Row: {
          approved_count: number
          created_at: string
          id: string
          last_contribution: string | null
          rejected_count: number
          reputation_score: number
          submission_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_count?: number
          created_at?: string
          id?: string
          last_contribution?: string | null
          rejected_count?: number
          reputation_score?: number
          submission_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_count?: number
          created_at?: string
          id?: string
          last_contribution?: string | null
          rejected_count?: number
          reputation_score?: number
          submission_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          marketing_emails: boolean
          newsletter_confirmed: boolean
          newsletter_subscribed: boolean
          updated_at: string
          user_id: string
          welcome_email_sent: boolean
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_emails?: boolean
          newsletter_confirmed?: boolean
          newsletter_subscribed?: boolean
          updated_at?: string
          user_id: string
          welcome_email_sent?: boolean
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          marketing_emails?: boolean
          newsletter_confirmed?: boolean
          newsletter_subscribed?: boolean
          updated_at?: string
          user_id?: string
          welcome_email_sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_submission: {
        Args: { admin_user_id: string; submission_id: string }
        Returns: boolean
      }
      create_audit_log: {
        Args: {
          _action: string
          _new_values?: Json
          _old_values?: Json
          _record_id?: string
          _table_name: string
        }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id?: string
            }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_role_or_higher: {
        Args: {
          _required_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      email_status: "sent" | "failed" | "bounced" | "delivered" | "opened"
      email_type:
        | "welcome"
        | "newsletter"
        | "submission_update"
        | "admin_notification"
        | "newsletter_confirmation"
      legislation_type: "ban" | "restriction" | "repealed"
      municipality_type: "city" | "county"
      submission_status: "pending" | "approved" | "rejected" | "needs_changes"
      submission_type: "new_legislation" | "update_existing"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      email_status: ["sent", "failed", "bounced", "delivered", "opened"],
      email_type: [
        "welcome",
        "newsletter",
        "submission_update",
        "admin_notification",
        "newsletter_confirmation",
      ],
  legislation_type: ["ban", "restriction", "repealed", "unverified"],
      municipality_type: ["city", "county"],
      submission_status: ["pending", "approved", "rejected", "needs_changes"],
      submission_type: ["new_legislation", "update_existing"],
    },
  },
} as const
