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
      cognitive_connections: {
        Row: {
          auto_generated: boolean | null
          connection_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          source_node_id: string
          strength: number | null
          target_node_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_generated?: boolean | null
          connection_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_node_id: string
          strength?: number | null
          target_node_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_generated?: boolean | null
          connection_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          source_node_id?: string
          strength?: number | null
          target_node_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_connections_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_insights: {
        Row: {
          acted_upon_at: string | null
          confidence_score: number | null
          content: string
          created_at: string | null
          id: string
          insight_type: string
          metadata: Json | null
          priority_level: number | null
          related_nodes: Json | null
          shown_at: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acted_upon_at?: string | null
          confidence_score?: number | null
          content: string
          created_at?: string | null
          id?: string
          insight_type: string
          metadata?: Json | null
          priority_level?: number | null
          related_nodes?: Json | null
          shown_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acted_upon_at?: string | null
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          id?: string
          insight_type?: string
          metadata?: Json | null
          priority_level?: number | null
          related_nodes?: Json | null
          shown_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cognitive_nodes: {
        Row: {
          access_count: number | null
          content: string
          conversation_id: string | null
          created_at: string | null
          embedding_conceptual: string | null
          embedding_general: string | null
          embedding_relational: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          node_type: Database["public"]["Enums"]["cognitive_node_type"]
          parent_node_id: string | null
          project_id: string | null
          relevance_score: number | null
          root_session_id: string | null
          status: Database["public"]["Enums"]["node_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_count?: number | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          embedding_conceptual?: string | null
          embedding_general?: string | null
          embedding_relational?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          node_type: Database["public"]["Enums"]["cognitive_node_type"]
          parent_node_id?: string | null
          project_id?: string | null
          relevance_score?: number | null
          root_session_id?: string | null
          status?: Database["public"]["Enums"]["node_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_count?: number | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          embedding_conceptual?: string | null
          embedding_general?: string | null
          embedding_relational?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          node_type?: Database["public"]["Enums"]["cognitive_node_type"]
          parent_node_id?: string | null
          project_id?: string | null
          relevance_score?: number | null
          root_session_id?: string | null
          status?: Database["public"]["Enums"]["node_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_nodes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_snapshots: {
        Row: {
          active_conversations: Json | null
          active_projects: Json | null
          cognitive_load: number | null
          created_at: string | null
          current_context: Json | null
          description: string | null
          focus_level: number | null
          id: string
          name: string
          snapshot_data: Json
          thought_flow: Json | null
          user_id: string
        }
        Insert: {
          active_conversations?: Json | null
          active_projects?: Json | null
          cognitive_load?: number | null
          created_at?: string | null
          current_context?: Json | null
          description?: string | null
          focus_level?: number | null
          id?: string
          name: string
          snapshot_data: Json
          thought_flow?: Json | null
          user_id: string
        }
        Update: {
          active_conversations?: Json | null
          active_projects?: Json | null
          cognitive_load?: number | null
          created_at?: string | null
          current_context?: Json | null
          description?: string | null
          focus_level?: number | null
          id?: string
          name?: string
          snapshot_data?: Json
          thought_flow?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          position: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          position?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_favorite: boolean | null
          last_message_preview: string | null
          message_count: number | null
          name: string | null
          project_id: string | null
          session_id: string
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          last_message_preview?: string | null
          message_count?: number | null
          name?: string | null
          project_id?: string | null
          session_id: string
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          last_message_preview?: string | null
          message_count?: number | null
          name?: string | null
          project_id?: string | null
          session_id?: string
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "conversation_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sections: {
        Row: {
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
          section_number: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          section_number: number
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          section_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_sections_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          extraction_method: string | null
          extraction_quality: number | null
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          project_id: string | null
          source: string
          status_processing: string | null
          summary: string | null
          title: string
          type: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          extraction_method?: string | null
          extraction_quality?: number | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          project_id?: string | null
          source: string
          status_processing?: string | null
          summary?: string | null
          title: string
          type: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          extraction_method?: string | null
          extraction_quality?: number | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          project_id?: string | null
          source?: string
          status_processing?: string | null
          summary?: string | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      embeddings: {
        Row: {
          created_at: string | null
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          section_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          section_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          section_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          content: string
          created_at: string | null
          id: string
          project_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_embeddings: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_embeddings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          llm_used: string | null
          role: string
          tokens_used: number | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          llm_used?: string | null
          role: string
          tokens_used?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          llm_used?: string | null
          role?: string
          tokens_used?: number | null
          updated_at?: string | null
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
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      thought_sessions: {
        Row: {
          achievements: Json | null
          connections_made: number | null
          context: Json | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          goals: Json | null
          id: string
          insights_generated: number | null
          name: string | null
          nodes_created: number | null
          session_type: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          connections_made?: number | null
          context?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          goals?: Json | null
          id?: string
          insights_generated?: number | null
          name?: string | null
          nodes_created?: number | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          connections_made?: number | null
          context?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          goals?: Json | null
          id?: string
          insights_generated?: number | null
          name?: string | null
          nodes_created?: number | null
          session_type?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cognitive_search: {
        Args: {
          p_user_id: string
          p_query_embedding: string
          p_search_type?: string
          p_limit?: number
          p_similarity_threshold?: number
        }
        Returns: {
          id: string
          content: string
          title: string
          node_type: Database["public"]["Enums"]["cognitive_node_type"]
          relevance_score: number
          similarity: number
          access_count: number
          created_at: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_document_sections: {
        Args: {
          p_query_embedding: string
          p_match_similarity_threshold: number
          p_match_count: number
          p_user_id_filter: string
        }
        Returns: {
          id: string
          document_id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_document_sections_enhanced: {
        Args: {
          p_query_embedding: string
          p_match_similarity_threshold: number
          p_match_count: number
          p_user_id_filter: string
        }
        Returns: {
          id: string
          document_id: string
          content: string
          metadata: Json
          similarity: number
          document_name: string
          title: string
        }[]
      }
      search_cognitive_memories: {
        Args: {
          p_query_embedding: string
          p_match_similarity_threshold: number
          p_match_count: number
          p_user_id_filter?: string
        }
        Returns: {
          id: string
          user_id: string
          content: string
          source: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      cognitive_node_type:
        | "question"
        | "answer"
        | "decision"
        | "insight"
        | "code"
        | "design"
        | "document"
        | "conversation"
        | "project"
        | "memory"
        | "connection"
      node_status: "active" | "archived" | "connected" | "evolving"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cognitive_node_type: [
        "question",
        "answer",
        "decision",
        "insight",
        "code",
        "design",
        "document",
        "conversation",
        "project",
        "memory",
        "connection",
      ],
      node_status: ["active", "archived", "connected", "evolving"],
    },
  },
} as const
