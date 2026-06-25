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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      market_attendance_intentions: {
        Row: {
          created_at: string
          id: string
          intention_type: string
          market_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intention_type: string
          market_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intention_type?: string
          market_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_attendance_intentions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_clicks: {
        Row: {
          click_type: Database["public"]["Enums"]["click_type"]
          created_at: string
          id: string
          market_id: string
        }
        Insert: {
          click_type: Database["public"]["Enums"]["click_type"]
          created_at?: string
          id?: string
          market_id: string
        }
        Update: {
          click_type?: Database["public"]["Enums"]["click_type"]
          created_at?: string
          id?: string
          market_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_clicks_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_date_overrides: {
        Row: {
          created_at: string
          id: string
          market_id: string
          new_date: string
          new_end_time: string | null
          new_start_time: string | null
          note: string | null
          original_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          new_date: string
          new_end_time?: string | null
          new_start_time?: string | null
          note?: string | null
          original_date: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          new_date?: string
          new_end_time?: string | null
          new_start_time?: string | null
          note?: string | null
          original_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_date_overrides_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_exceptions: {
        Row: {
          created_at: string
          exception_date: string
          id: string
          market_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          exception_date: string
          id?: string
          market_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          exception_date?: string
          id?: string
          market_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_exceptions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_submissions: {
        Row: {
          address: string
          admin_notes: string | null
          category: Database["public"]["Enums"]["market_category"]
          created_at: string
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          municipality: string
          name: string
          organizer_contact_url: string | null
          organizer_email: string | null
          organizer_instagram: string | null
          organizer_name: string
          organizer_phone: string | null
          published_market_id: string | null
          recurrence_day_of_week: string | null
          recurrence_end_date: string | null
          recurrence_label: string | null
          recurrence_start_date: string
          recurrence_type: string
          recurrence_week_of_month: string | null
          region: Database["public"]["Enums"]["market_region"]
          reviewed_at: string | null
          reviewed_by: string | null
          start_time: string
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          category: Database["public"]["Enums"]["market_category"]
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          municipality: string
          name: string
          organizer_contact_url?: string | null
          organizer_email?: string | null
          organizer_instagram?: string | null
          organizer_name: string
          organizer_phone?: string | null
          published_market_id?: string | null
          recurrence_day_of_week?: string | null
          recurrence_end_date?: string | null
          recurrence_label?: string | null
          recurrence_start_date: string
          recurrence_type?: string
          recurrence_week_of_month?: string | null
          region: Database["public"]["Enums"]["market_region"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["market_category"]
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          municipality?: string
          name?: string
          organizer_contact_url?: string | null
          organizer_email?: string | null
          organizer_instagram?: string | null
          organizer_name?: string
          organizer_phone?: string | null
          published_market_id?: string | null
          recurrence_day_of_week?: string | null
          recurrence_end_date?: string | null
          recurrence_label?: string | null
          recurrence_start_date?: string
          recurrence_type?: string
          recurrence_week_of_month?: string | null
          region?: Database["public"]["Enums"]["market_region"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_submissions_published_market_id_fkey"
            columns: ["published_market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          address: string
          category: Database["public"]["Enums"]["market_category"]
          created_at: string
          description: string | null
          end_time: string
          focal_x: number
          focal_y: number
          id: string
          image_url: string | null
          is_active: boolean
          municipality: string
          name: string
          organizer_contact_url: string | null
          organizer_email: string | null
          organizer_instagram: string | null
          organizer_logo_url: string | null
          organizer_name: string
          organizer_phone: string | null
          recurrence_day_of_week: string | null
          recurrence_end_date: string | null
          recurrence_label: string | null
          recurrence_start_date: string
          recurrence_type: string
          recurrence_week_of_month: string | null
          region: Database["public"]["Enums"]["market_region"]
          start_time: string
          updated_at: string
          view_count: number
        }
        Insert: {
          address: string
          category: Database["public"]["Enums"]["market_category"]
          created_at?: string
          description?: string | null
          end_time: string
          focal_x?: number
          focal_y?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          municipality: string
          name: string
          organizer_contact_url?: string | null
          organizer_email?: string | null
          organizer_instagram?: string | null
          organizer_logo_url?: string | null
          organizer_name: string
          organizer_phone?: string | null
          recurrence_day_of_week?: string | null
          recurrence_end_date?: string | null
          recurrence_label?: string | null
          recurrence_start_date: string
          recurrence_type?: string
          recurrence_week_of_month?: string | null
          region: Database["public"]["Enums"]["market_region"]
          start_time: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          address?: string
          category?: Database["public"]["Enums"]["market_category"]
          created_at?: string
          description?: string | null
          end_time?: string
          focal_x?: number
          focal_y?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          municipality?: string
          name?: string
          organizer_contact_url?: string | null
          organizer_email?: string | null
          organizer_instagram?: string | null
          organizer_logo_url?: string | null
          organizer_name?: string
          organizer_phone?: string | null
          recurrence_day_of_week?: string | null
          recurrence_end_date?: string | null
          recurrence_label?: string | null
          recurrence_start_date?: string
          recurrence_type?: string
          recurrence_week_of_month?: string | null
          region?: Database["public"]["Enums"]["market_region"]
          start_time?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      producer_update_requests: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          market_names: string | null
          message: string
          producer_name: string
          requester_email: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          market_names?: string | null
          message: string
          producer_name: string
          requester_email: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          market_names?: string | null
          message?: string
          producer_name?: string
          requester_email?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      productor_mercados: {
        Row: {
          created_at: string
          id: string
          mercado_nombre: string
          productor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mercado_nombre: string
          productor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mercado_nombre?: string
          productor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "productor_mercados_productor_id_fkey"
            columns: ["productor_id"]
            isOneToOne: false
            referencedRelation: "productores"
            referencedColumns: ["id"]
          },
        ]
      }
      productores: {
        Row: {
          contacto: string | null
          created_at: string
          email: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          nombre: string
          region: string | null
          telefono: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          contacto?: string | null
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nombre: string
          region?: string | null
          telefono?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          contacto?: string | null
          created_at?: string
          email?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          nombre?: string
          region?: string | null
          telefono?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: { Args: { market_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      click_type:
        | "view_detail"
        | "click_phone"
        | "click_email"
        | "click_instagram"
        | "click_directions"
        | "click_attendance"
        | "click_contact"
      market_category:
        | "Mercado Agrícola"
        | "Bazaar/Pop Up"
        | "Feria Artesanal"
        | "Food Market"
        | "Mercado Mixto"
        | "Flea Market"
      market_region: "Metro" | "Norte" | "Sur" | "Este" | "Oeste" | "Centro"
      submission_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "moderator", "user"],
      click_type: [
        "view_detail",
        "click_phone",
        "click_email",
        "click_instagram",
        "click_directions",
        "click_attendance",
        "click_contact",
      ],
      market_category: [
        "Mercado Agrícola",
        "Bazaar/Pop Up",
        "Feria Artesanal",
        "Food Market",
        "Mercado Mixto",
        "Flea Market",
      ],
      market_region: ["Metro", "Norte", "Sur", "Este", "Oeste", "Centro"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
