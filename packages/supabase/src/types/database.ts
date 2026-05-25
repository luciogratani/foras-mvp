export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  template: {
    Tables: {
      allergens: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancellation_token: string
          covers: number
          created_at: string
          date: string
          email: string
          gdpr_consent: boolean
          id: string
          name: string
          notes: string | null
          phone: string | null
          preferred_time: string | null
          status: string
          time_slot_id: string
        }
        Insert: {
          cancellation_token?: string
          covers: number
          created_at?: string
          date: string
          email: string
          gdpr_consent?: boolean
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferred_time?: string | null
          status?: string
          time_slot_id: string
        }
        Update: {
          cancellation_token?: string
          covers?: number
          created_at?: string
          date?: string
          email?: string
          gdpr_consent?: boolean
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_time?: string | null
          status?: string
          time_slot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      closed_dates: {
        Row: {
          date: string
          end_date: string | null
          id: string
          reason: string | null
        }
        Insert: {
          date: string
          end_date?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          date?: string
          end_date?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          id: string
          is_active: boolean
          name: string
          position: number | null
          section_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          position?: number | null
          section_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          position?: number | null
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_section_id_fkey"
            columns: ["section_id"]
            referencedRelation: "menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergen_ids: string[]
          category_id: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          position: number | null
          price: number
        }
        Insert: {
          allergen_ids?: string[]
          category_id: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          position?: number | null
          price: number
        }
        Update: {
          allergen_ids?: string[]
          category_id?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          position?: number | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_sections: {
        Row: {
          id: string
          is_active: boolean
          name: string
          position: number | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          position?: number | null
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          position?: number | null
        }
        Relationships: []
      }
      news_slides: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          position: number | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: number | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          position?: number | null
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          bio: string | null
          description: string | null
          email: string | null
          extra_data: Json
          id: string
          maintenance_mode: boolean
          og_image: string | null
          opening_hours: Json
          phone: string | null
          slogan: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_whatsapp: string | null
          title: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          description?: string | null
          email?: string | null
          extra_data?: Json
          id?: string
          maintenance_mode?: boolean
          og_image?: string | null
          opening_hours?: Json
          phone?: string | null
          slogan?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_whatsapp?: string | null
          title?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          description?: string | null
          email?: string | null
          extra_data?: Json
          id?: string
          maintenance_mode?: boolean
          og_image?: string | null
          opening_hours?: Json
          phone?: string | null
          slogan?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_whatsapp?: string | null
          title?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          archived_at: string | null
          end_time: string | null
          id: string
          is_active: boolean
          label: string
          max_covers: number
          time: string
        }
        Insert: {
          archived_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          label: string
          max_covers: number
          time: string
        }
        Update: {
          archived_at?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          label?: string
          max_covers?: number
          time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  template: {
    Enums: {},
  },
} as const
