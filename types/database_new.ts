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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      benchmark_data: {
        Row: {
          avg_overall_score: number | null
          id: string
          month: string
          score_distribution: Json | null
          total_validations: number | null
          updated_at: string | null
        }
        Insert: {
          avg_overall_score?: number | null
          id?: string
          month: string
          score_distribution?: Json | null
          total_validations?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_overall_score?: number | null
          id?: string
          month?: string
          score_distribution?: Json | null
          total_validations?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ideas: {
        Row: {
          created_at: string | null
          distribution_channel: string
          id: string
          painkiller_moment: string
          problem: string
          revenue_model: string
          status: string | null
          target_customer: string
          time_commitment: string
          title: string
          unfair_advantage: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          distribution_channel: string
          id?: string
          painkiller_moment: string
          problem: string
          revenue_model: string
          status?: string | null
          target_customer: string
          time_commitment: string
          title: string
          unfair_advantage: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          distribution_channel?: string
          id?: string
          painkiller_moment?: string
          problem?: string
          revenue_model?: string
          status?: string | null
          target_customer?: string
          time_commitment?: string
          title?: string
          unfair_advantage?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_period: string | null
          canceled_at: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          started_at: string
          status: string
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_period?: string | null
          canceled_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string
          status: string
          tier: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_period?: string | null
          canceled_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          started_at?: string
          status?: string
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      validations: {
        Row: {
          acquisition_reasoning: string
          acquisition_score: number
          comparable_companies: Json | null
          created_at: string | null
          founder_fit_reasoning: string
          founder_fit_score: number
          id: string
          idea_id: string
          idea_snapshot: Json | null
          moat_reasoning: string
          moat_score: number
          model_used: string | null
          overall_score: number
          painkiller_reasoning: string
          painkiller_score: number
          processing_time_ms: number | null
          recommendations: Json | null
          red_flags: Json | null
          revenue_model_reasoning: string
          revenue_model_score: number
          scalability_reasoning: string
          scalability_score: number
          time_to_revenue_estimate: string | null
          time_to_revenue_reasoning: string
          time_to_revenue_score: number
          traffic_light: string
          user_id: string
        }
        Insert: {
          acquisition_reasoning: string
          acquisition_score: number
          comparable_companies?: Json | null
          created_at?: string | null
          founder_fit_reasoning: string
          founder_fit_score: number
          id?: string
          idea_id: string
          idea_snapshot?: Json | null
          moat_reasoning: string
          moat_score: number
          model_used?: string | null
          overall_score: number
          painkiller_reasoning: string
          painkiller_score: number
          processing_time_ms?: number | null
          recommendations?: Json | null
          red_flags?: Json | null
          revenue_model_reasoning: string
          revenue_model_score: number
          scalability_reasoning: string
          scalability_score: number
          time_to_revenue_estimate?: string | null
          time_to_revenue_reasoning: string
          time_to_revenue_score: number
          traffic_light: string
          user_id: string
        }
        Update: {
          acquisition_reasoning?: string
          acquisition_score?: number
          comparable_companies?: Json | null
          created_at?: string | null
          founder_fit_reasoning?: string
          founder_fit_score?: number
          id?: string
          idea_id?: string
          idea_snapshot?: Json | null
          moat_reasoning?: string
          moat_score?: number
          model_used?: string | null
          overall_score?: number
          painkiller_reasoning?: string
          painkiller_score?: number
          processing_time_ms?: number | null
          recommendations?: Json | null
          red_flags?: Json | null
          revenue_model_reasoning?: string
          revenue_model_score?: number
          scalability_reasoning?: string
          scalability_score?: number
          time_to_revenue_estimate?: string | null
          time_to_revenue_reasoning?: string
          time_to_revenue_score?: number
          traffic_light?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validations_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          user_id?: string | null
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
  public: {
    Enums: {},
  },
} as const
