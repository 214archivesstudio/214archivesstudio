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
      post_media: {
        Row: {
          alt: string | null
          created_at: string
          display_order: number
          height: number | null
          id: string
          post_id: string
          public_id: string | null
          type: Database["public"]["Enums"]["media_type"]
          video_id: string | null
          video_platform: Database["public"]["Enums"]["video_platform"] | null
          video_title: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          created_at?: string
          display_order?: number
          height?: number | null
          id?: string
          post_id: string
          public_id?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          video_id?: string | null
          video_platform?: Database["public"]["Enums"]["video_platform"] | null
          video_title?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          created_at?: string
          display_order?: number
          height?: number | null
          id?: string
          post_id?: string
          public_id?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          video_id?: string | null
          video_platform?: Database["public"]["Enums"]["video_platform"] | null
          video_title?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          city: string | null
          client: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          display_order: number
          id: string
          published: boolean
          section: Database["public"]["Enums"]["post_section"]
          slug: string
          thumbnail_alt: string | null
          thumbnail_height: number
          thumbnail_public_id: string
          thumbnail_width: number
          title: string
          updated_at: string
          video_id: string | null
          video_platform: Database["public"]["Enums"]["video_platform"] | null
          video_thumbnail_url: string | null
          video_title: string | null
          year_label: string | null
        }
        Insert: {
          city?: string | null
          client?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          display_order?: number
          id?: string
          published?: boolean
          section: Database["public"]["Enums"]["post_section"]
          slug: string
          thumbnail_alt?: string | null
          thumbnail_height?: number
          thumbnail_public_id: string
          thumbnail_width?: number
          title: string
          updated_at?: string
          video_id?: string | null
          video_platform?: Database["public"]["Enums"]["video_platform"] | null
          video_thumbnail_url?: string | null
          video_title?: string | null
          year_label?: string | null
        }
        Update: {
          city?: string | null
          client?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          display_order?: number
          id?: string
          published?: boolean
          section?: Database["public"]["Enums"]["post_section"]
          slug?: string
          thumbnail_alt?: string | null
          thumbnail_height?: number
          thumbnail_public_id?: string
          thumbnail_width?: number
          title?: string
          updated_at?: string
          video_id?: string | null
          video_platform?: Database["public"]["Enums"]["video_platform"] | null
          video_thumbnail_url?: string | null
          video_title?: string | null
          year_label?: string | null
        }
        Relationships: []
      }
      publish_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          github_run_url: string | null
          id: string
          message: string | null
          status: Database["public"]["Enums"]["publish_status"]
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          github_run_url?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          github_run_url?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          triggered_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_authenticated_admin_user: { Args: never; Returns: boolean }
      reorder_post_media: {
        Args: { p_ids: string[]; p_post_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      media_type: "image" | "video"
      post_section:
        | "showreel"
        | "archives"
        | "film"
        | "photography"
        | "personal"
      publish_status: "pending" | "running" | "success" | "failed"
      video_platform: "youtube" | "vimeo"
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
      app_role: ["admin", "editor"],
      media_type: ["image", "video"],
      post_section: ["showreel", "archives", "film", "photography", "personal"],
      publish_status: ["pending", "running", "success", "failed"],
      video_platform: ["youtube", "vimeo"],
    },
  },
} as const
