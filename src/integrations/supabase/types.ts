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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          action_type: string
          agent_id: string
          case_id: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          action_type: string
          agent_id: string
          case_id: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          agent_id?: string
          case_id?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      case_audit_events: {
        Row: {
          actor_id: string
          actor_name: string
          case_id: string
          created_at: string
          event_description: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor_id: string
          actor_name: string
          case_id: string
          created_at?: string
          event_description: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor_id?: string
          actor_name?: string
          case_id?: string
          created_at?: string
          event_description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "case_audit_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      case_intakes: {
        Row: {
          assigned_agent_id: string | null
          client_id: string
          contract_id: string | null
          created_at: string
          created_by: string
          currency_code: string
          debt_status_id: string | null
          debtor_address: Json | null
          debtor_country: string | null
          debtor_email: string | null
          debtor_name: string
          debtor_phone: string | null
          debtor_tax_id: string | null
          debtor_type: string | null
          debtor_vat_id: string | null
          id: string
          is_gdpr_subject: boolean | null
          lawful_basis_id: string | null
          notes: string | null
          reference: string
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_level_id: string | null
          status: string
          submitted_at: string | null
          total_amount: number
          total_fees: number | null
          total_interest: number | null
          total_penalties: number | null
          total_vat: number | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          client_id: string
          contract_id?: string | null
          created_at?: string
          created_by: string
          currency_code?: string
          debt_status_id?: string | null
          debtor_address?: Json | null
          debtor_country?: string | null
          debtor_email?: string | null
          debtor_name: string
          debtor_phone?: string | null
          debtor_tax_id?: string | null
          debtor_type?: string | null
          debtor_vat_id?: string | null
          id?: string
          is_gdpr_subject?: boolean | null
          lawful_basis_id?: string | null
          notes?: string | null
          reference: string
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_level_id?: string | null
          status?: string
          submitted_at?: string | null
          total_amount?: number
          total_fees?: number | null
          total_interest?: number | null
          total_penalties?: number | null
          total_vat?: number | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          client_id?: string
          contract_id?: string | null
          created_at?: string
          created_by?: string
          currency_code?: string
          debt_status_id?: string | null
          debtor_address?: Json | null
          debtor_country?: string | null
          debtor_email?: string | null
          debtor_name?: string
          debtor_phone?: string | null
          debtor_tax_id?: string | null
          debtor_type?: string | null
          debtor_vat_id?: string | null
          id?: string
          is_gdpr_subject?: boolean | null
          lawful_basis_id?: string | null
          notes?: string | null
          reference?: string
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_level_id?: string | null
          status?: string
          submitted_at?: string | null
          total_amount?: number
          total_fees?: number | null
          total_interest?: number | null
          total_penalties?: number | null
          total_vat?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_intakes_debt_status_id_fkey"
            columns: ["debt_status_id"]
            isOneToOne: false
            referencedRelation: "debt_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_intakes_lawful_basis_id_fkey"
            columns: ["lawful_basis_id"]
            isOneToOne: false
            referencedRelation: "lawful_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_intakes_service_level_id_fkey"
            columns: ["service_level_id"]
            isOneToOne: false
            referencedRelation: "service_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      case_invoices: {
        Row: {
          amount: number
          case_id: string
          created_at: string
          currency_code: string
          description: string | null
          due_date: string
          fees: number | null
          id: string
          interest: number | null
          invoice_number: string
          issue_date: string
          penalties: number | null
          updated_at: string
          vat_amount: number | null
        }
        Insert: {
          amount: number
          case_id: string
          created_at?: string
          currency_code?: string
          description?: string | null
          due_date: string
          fees?: number | null
          id?: string
          interest?: number | null
          invoice_number: string
          issue_date: string
          penalties?: number | null
          updated_at?: string
          vat_amount?: number | null
        }
        Update: {
          amount?: number
          case_id?: string
          created_at?: string
          currency_code?: string
          description?: string | null
          due_date?: string
          fees?: number | null
          id?: string
          interest?: number | null
          invoice_number?: string
          issue_date?: string
          penalties?: number | null
          updated_at?: string
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      case_messages: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          mentions: Json | null
          message_type: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          mentions?: Json | null
          message_type?: string
          sender_id: string
          sender_name: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          mentions?: Json | null
          message_type?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "case_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
          user_name: string
          user_role: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
          user_name: string
          user_role: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
          user_name?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          case_id: string | null
          created_at: string
          created_by: string
          id: string
          is_client_visible: boolean
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_client_visible?: boolean
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_client_visible?: boolean
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      debt_statuses: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_default: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_default?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_default?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lawful_bases: {
        Row: {
          article_reference: string | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_default: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          article_reference?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_default?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          article_reference?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_default?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_internal: boolean
          message_type: string
          sender_id: string
          sender_name: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_internal?: boolean
          message_type?: string
          sender_id: string
          sender_name: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          message_type?: string
          sender_id?: string
          sender_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_levels: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_default: boolean | null
          name: string
          sla_hours: number | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_default?: boolean | null
          name: string
          sla_hours?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_default?: boolean | null
          name?: string
          sla_hours?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_case_with_privacy_protection: {
        Args: { case_id_param: string }
        Returns: {
          assigned_agent_id: string
          client_id: string
          contract_id: string
          created_at: string
          created_by: string
          currency_code: string
          debt_status_id: string
          debtor_address: Json
          debtor_country: string
          debtor_email: string
          debtor_name: string
          debtor_phone: string
          debtor_tax_id: string
          debtor_type: string
          debtor_vat_id: string
          id: string
          is_gdpr_subject: boolean
          lawful_basis_id: string
          notes: string
          reference: string
          rejection_reason: string
          review_notes: string
          reviewed_at: string
          reviewed_by: string
          service_level_id: string
          status: string
          submitted_at: string
          total_amount: number
          total_fees: number
          total_interest: number
          total_penalties: number
          total_vat: number
          updated_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_conversation_member: {
        Args: { conv_id: string }
        Returns: boolean
      }
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
