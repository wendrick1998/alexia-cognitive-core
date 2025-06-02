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
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          llm_model: string | null
          role: string
          session_id: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          llm_model?: string | null
          role: string
          session_id: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          llm_model?: string | null
          role?: string
          session_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          auto_title: boolean | null
          created_at: string | null
          id: string
          is_favorite: boolean | null
          last_message_preview: string | null
          message_count: number | null
          pinned: boolean | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_title?: boolean | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          last_message_preview?: string | null
          message_count?: number | null
          pinned?: boolean | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_title?: boolean | null
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          last_message_preview?: string | null
          message_count?: number | null
          pinned?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cognitive_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          related_project_id: string | null
          related_task_id: string | null
          resolved_at: string | null
          severity: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_project_id?: string | null
          related_task_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          related_project_id?: string | null
          related_task_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_alerts_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "project_status_dashboard"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "cognitive_alerts_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_alerts_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "task_priority_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_alerts_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_clusters: {
        Row: {
          centroid_embedding: string | null
          cluster_type: string | null
          coherence_score: number | null
          created_at: string | null
          density_score: number | null
          discovery_method: string | null
          id: string
          last_validated_at: string | null
          member_nodes: string[] | null
          metadata: Json | null
          temporal_stability: number | null
          user_id: string
        }
        Insert: {
          centroid_embedding?: string | null
          cluster_type?: string | null
          coherence_score?: number | null
          created_at?: string | null
          density_score?: number | null
          discovery_method?: string | null
          id?: string
          last_validated_at?: string | null
          member_nodes?: string[] | null
          metadata?: Json | null
          temporal_stability?: number | null
          user_id: string
        }
        Update: {
          centroid_embedding?: string | null
          cluster_type?: string | null
          coherence_score?: number | null
          created_at?: string | null
          density_score?: number | null
          discovery_method?: string | null
          id?: string
          last_validated_at?: string | null
          member_nodes?: string[] | null
          metadata?: Json | null
          temporal_stability?: number | null
          user_id?: string
        }
        Relationships: []
      }
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
            referencedRelation: "active_neural_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "active_neural_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_connections_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
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
          activation_strength: number | null
          base_activation: number | null
          connected_nodes: string[] | null
          consolidation_score: number | null
          content: string
          conversation_id: string | null
          created_at: string | null
          decay_rate: number | null
          embedding_conceptual: string | null
          embedding_contextual: string | null
          embedding_general: string | null
          embedding_relational: string | null
          embedding_semantic: string | null
          id: string
          is_sensitive: boolean | null
          last_accessed_at: string | null
          last_consolidation_at: string | null
          last_validated_at: string | null
          memory_type: string | null
          metadata: Json | null
          node_type: Database["public"]["Enums"]["cognitive_node_type"]
          parent_node_id: string | null
          project_id: string | null
          propagation_depth: number | null
          relevance_score: number | null
          replay_count: number | null
          root_session_id: string | null
          status: Database["public"]["Enums"]["node_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string
          validation_confidence: number | null
          validation_status: string | null
        }
        Insert: {
          access_count?: number | null
          activation_strength?: number | null
          base_activation?: number | null
          connected_nodes?: string[] | null
          consolidation_score?: number | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          decay_rate?: number | null
          embedding_conceptual?: string | null
          embedding_contextual?: string | null
          embedding_general?: string | null
          embedding_relational?: string | null
          embedding_semantic?: string | null
          id?: string
          is_sensitive?: boolean | null
          last_accessed_at?: string | null
          last_consolidation_at?: string | null
          last_validated_at?: string | null
          memory_type?: string | null
          metadata?: Json | null
          node_type: Database["public"]["Enums"]["cognitive_node_type"]
          parent_node_id?: string | null
          project_id?: string | null
          propagation_depth?: number | null
          relevance_score?: number | null
          replay_count?: number | null
          root_session_id?: string | null
          status?: Database["public"]["Enums"]["node_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          validation_confidence?: number | null
          validation_status?: string | null
        }
        Update: {
          access_count?: number | null
          activation_strength?: number | null
          base_activation?: number | null
          connected_nodes?: string[] | null
          consolidation_score?: number | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          decay_rate?: number | null
          embedding_conceptual?: string | null
          embedding_contextual?: string | null
          embedding_general?: string | null
          embedding_relational?: string | null
          embedding_semantic?: string | null
          id?: string
          is_sensitive?: boolean | null
          last_accessed_at?: string | null
          last_consolidation_at?: string | null
          last_validated_at?: string | null
          memory_type?: string | null
          metadata?: Json | null
          node_type?: Database["public"]["Enums"]["cognitive_node_type"]
          parent_node_id?: string | null
          project_id?: string | null
          propagation_depth?: number | null
          relevance_score?: number | null
          replay_count?: number | null
          root_session_id?: string | null
          status?: Database["public"]["Enums"]["node_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          validation_confidence?: number | null
          validation_status?: string | null
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
            referencedRelation: "active_neural_network"
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
            foreignKeyName: "cognitive_nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_nodes_parent_node_id_fkey"
            columns: ["parent_node_id"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_status_dashboard"
            referencedColumns: ["project_id"]
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
            referencedRelation: "project_status_dashboard"
            referencedColumns: ["project_id"]
          },
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
      cortex_decision_logs: {
        Row: {
          activated_nodes: Json | null
          created_at: string | null
          execution_time_ms: number | null
          fallback_reason: string | null
          fallback_used: boolean | null
          id: string
          insights_generated: Json | null
          reasoning: string | null
          response_stored_in: string | null
          selected_model: string
          session_id: string | null
          user_id: string
          user_request: string
        }
        Insert: {
          activated_nodes?: Json | null
          created_at?: string | null
          execution_time_ms?: number | null
          fallback_reason?: string | null
          fallback_used?: boolean | null
          id?: string
          insights_generated?: Json | null
          reasoning?: string | null
          response_stored_in?: string | null
          selected_model: string
          session_id?: string | null
          user_id: string
          user_request: string
        }
        Update: {
          activated_nodes?: Json | null
          created_at?: string | null
          execution_time_ms?: number | null
          fallback_reason?: string | null
          fallback_used?: boolean | null
          id?: string
          insights_generated?: Json | null
          reasoning?: string | null
          response_stored_in?: string | null
          selected_model?: string
          session_id?: string | null
          user_id?: string
          user_request?: string
        }
        Relationships: [
          {
            foreignKeyName: "cortex_decision_logs_response_stored_in_fkey"
            columns: ["response_stored_in"]
            isOneToOne: false
            referencedRelation: "active_neural_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cortex_decision_logs_response_stored_in_fkey"
            columns: ["response_stored_in"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cortex_decision_logs_response_stored_in_fkey"
            columns: ["response_stored_in"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cortex_decision_logs_response_stored_in_fkey"
            columns: ["response_stored_in"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          approved_at: string | null
          approved_by_user: boolean | null
          confidence_score: number | null
          context: Json
          created_at: string | null
          decision_type: string
          executed: boolean | null
          executed_at: string | null
          id: string
          impact_assessment: Json | null
          options: Json
          outcome_quality: number | null
          rationale: string | null
          selected_option: string | null
          task_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by_user?: boolean | null
          confidence_score?: number | null
          context?: Json
          created_at?: string | null
          decision_type: string
          executed?: boolean | null
          executed_at?: string | null
          id?: string
          impact_assessment?: Json | null
          options?: Json
          outcome_quality?: number | null
          rationale?: string | null
          selected_option?: string | null
          task_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by_user?: boolean | null
          confidence_score?: number | null
          context?: Json
          created_at?: string | null
          decision_type?: string
          executed?: boolean | null
          executed_at?: string | null
          id?: string
          impact_assessment?: Json | null
          options?: Json
          outcome_quality?: number | null
          rationale?: string | null
          selected_option?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task_priority_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
            referencedRelation: "project_status_dashboard"
            referencedColumns: ["project_id"]
          },
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
      epics: {
        Row: {
          actual_hours: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          name: string
          priority: number | null
          project_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          name: string
          priority?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          name?: string
          priority?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_status_dashboard"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "epics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_cache_metrics: {
        Row: {
          cache_item_id: string
          id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          cache_item_id: string
          id?: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          cache_item_id?: string
          id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_cache_metrics_cache_item_id_fkey"
            columns: ["cache_item_id"]
            isOneToOne: false
            referencedRelation: "llm_response_cache"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_call_logs: {
        Row: {
          answer_length: number
          cache_hit: boolean | null
          created_at: string | null
          end_time: string
          error_message: string | null
          estimated_cost: number
          fallback_model: string | null
          fallback_reason: string | null
          id: string
          metadata: Json | null
          model_name: string
          provider: string
          question: string
          response_time: number
          session_id: string
          start_time: string
          status: string | null
          task_type: string
          tokens_input: number
          tokens_output: number
          total_tokens: number
          used_fallback: boolean | null
          user_id: string
        }
        Insert: {
          answer_length: number
          cache_hit?: boolean | null
          created_at?: string | null
          end_time: string
          error_message?: string | null
          estimated_cost: number
          fallback_model?: string | null
          fallback_reason?: string | null
          id?: string
          metadata?: Json | null
          model_name: string
          provider: string
          question: string
          response_time: number
          session_id: string
          start_time: string
          status?: string | null
          task_type: string
          tokens_input: number
          tokens_output: number
          total_tokens: number
          used_fallback?: boolean | null
          user_id: string
        }
        Update: {
          answer_length?: number
          cache_hit?: boolean | null
          created_at?: string | null
          end_time?: string
          error_message?: string | null
          estimated_cost?: number
          fallback_model?: string | null
          fallback_reason?: string | null
          id?: string
          metadata?: Json | null
          model_name?: string
          provider?: string
          question?: string
          response_time?: number
          session_id?: string
          start_time?: string
          status?: string | null
          task_type?: string
          tokens_input?: number
          tokens_output?: number
          total_tokens?: number
          used_fallback?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      llm_execution_logs: {
        Row: {
          created_at: string | null
          execution_time: number | null
          id: string
          input_hash: string
          model_used: string
          output_quality: number | null
          success: boolean | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          execution_time?: number | null
          id?: string
          input_hash: string
          model_used: string
          output_quality?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          execution_time?: number | null
          id?: string
          input_hash?: string
          model_used?: string
          output_quality?: number | null
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      llm_feedback: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          model_name: string
          processed: boolean | null
          processed_at: string | null
          provider: string
          question: string
          rating: string | null
          response_time: number
          score: number | null
          session_id: string
          timestamp: string | null
          tokens_used: number
          used_fallback: boolean | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          model_name: string
          processed?: boolean | null
          processed_at?: string | null
          provider: string
          question: string
          rating?: string | null
          response_time: number
          score?: number | null
          session_id: string
          timestamp?: string | null
          tokens_used: number
          used_fallback?: boolean | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          model_name?: string
          processed?: boolean | null
          processed_at?: string | null
          provider?: string
          question?: string
          rating?: string | null
          response_time?: number
          score?: number | null
          session_id?: string
          timestamp?: string | null
          tokens_used?: number
          used_fallback?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      llm_integrations: {
        Row: {
          active: boolean | null
          api_key: string
          avg_response_time: number | null
          base_url: string
          created_at: string | null
          custom_headers: Json | null
          endpoint_path: string | null
          fallback_priority: number | null
          id: string
          last_tested_at: string | null
          max_tokens: number | null
          model: string
          name: string
          temperature: number | null
          test_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          api_key: string
          avg_response_time?: number | null
          base_url: string
          created_at?: string | null
          custom_headers?: Json | null
          endpoint_path?: string | null
          fallback_priority?: number | null
          id?: string
          last_tested_at?: string | null
          max_tokens?: number | null
          model: string
          name: string
          temperature?: number | null
          test_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          api_key?: string
          avg_response_time?: number | null
          base_url?: string
          created_at?: string | null
          custom_headers?: Json | null
          endpoint_path?: string | null
          fallback_priority?: number | null
          id?: string
          last_tested_at?: string | null
          max_tokens?: number | null
          model?: string
          name?: string
          temperature?: number | null
          test_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      llm_model_metrics: {
        Row: {
          avg_response_time: number
          avg_tokens_per_call: number
          cache_hit_count: number
          cache_hit_rate: number
          created_at: string | null
          failed_calls: number
          fallback_count: number
          fallback_rate: number
          id: string
          model_name: string
          p50_response_time: number
          p95_response_time: number
          p99_response_time: number
          period_end: string
          period_start: string
          provider: string
          successful_calls: number
          timeout_calls: number
          total_calls: number
          total_cost: number
          total_tokens_used: number
        }
        Insert: {
          avg_response_time: number
          avg_tokens_per_call: number
          cache_hit_count: number
          cache_hit_rate: number
          created_at?: string | null
          failed_calls: number
          fallback_count: number
          fallback_rate: number
          id?: string
          model_name: string
          p50_response_time: number
          p95_response_time: number
          p99_response_time: number
          period_end: string
          period_start: string
          provider: string
          successful_calls: number
          timeout_calls: number
          total_calls: number
          total_cost: number
          total_tokens_used: number
        }
        Update: {
          avg_response_time?: number
          avg_tokens_per_call?: number
          cache_hit_count?: number
          cache_hit_rate?: number
          created_at?: string | null
          failed_calls?: number
          fallback_count?: number
          fallback_rate?: number
          id?: string
          model_name?: string
          p50_response_time?: number
          p95_response_time?: number
          p99_response_time?: number
          period_end?: string
          period_start?: string
          provider?: string
          successful_calls?: number
          timeout_calls?: number
          total_calls?: number
          total_cost?: number
          total_tokens_used?: number
        }
        Relationships: []
      }
      llm_orchestrator_preferences: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          preferred_model: string
          task_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          preferred_model: string
          task_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          preferred_model?: string
          task_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      llm_response_cache: {
        Row: {
          answer: string
          created_at: string | null
          embedding: string
          id: string
          metadata: Json | null
          model_name: string
          provider: string
          question: string
          task_type: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          embedding: string
          id?: string
          metadata?: Json | null
          model_name: string
          provider: string
          question: string
          task_type: string
          tokens_used: number
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          embedding?: string
          id?: string
          metadata?: Json | null
          model_name?: string
          provider?: string
          question?: string
          task_type?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: []
      }
      llm_usage_stats: {
        Row: {
          avg_response_time: number | null
          cost_to_date: number | null
          failure_rate: number | null
          id: string
          model_name: string
          total_calls: number | null
          updated_at: string | null
        }
        Insert: {
          avg_response_time?: number | null
          cost_to_date?: number | null
          failure_rate?: number | null
          id?: string
          model_name: string
          total_calls?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_response_time?: number | null
          cost_to_date?: number | null
          failure_rate?: number | null
          id?: string
          model_name?: string
          total_calls?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "project_status_dashboard"
            referencedColumns: ["project_id"]
          },
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
      memory_consolidation_sessions: {
        Row: {
          completed_at: string | null
          connections_strengthened: number | null
          consolidation_quality: number | null
          id: string
          metadata: Json | null
          nodes_processed: number | null
          patterns_discovered: number | null
          session_type: string | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connections_strengthened?: number | null
          consolidation_quality?: number | null
          id?: string
          metadata?: Json | null
          nodes_processed?: number | null
          patterns_discovered?: number | null
          session_type?: string | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connections_strengthened?: number | null
          consolidation_quality?: number | null
          id?: string
          metadata?: Json | null
          nodes_processed?: number | null
          patterns_discovered?: number | null
          session_type?: string | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      memory_feedback: {
        Row: {
          confidence_level: string | null
          created_at: string | null
          feedback_text: string | null
          id: string
          memory_id: string | null
          user_id: string
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          memory_id?: string | null
          user_id: string
        }
        Update: {
          confidence_level?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          memory_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_feedback_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "active_neural_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_feedback_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_feedback_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_feedback_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_validation_logs: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          details: Json | null
          id: string
          memory_id: string
          validated_by: string | null
          validation_result: string
          validation_type: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          details?: Json | null
          id?: string
          memory_id: string
          validated_by?: string | null
          validation_result: string
          validation_type: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          details?: Json | null
          id?: string
          memory_id?: string
          validated_by?: string | null
          validation_result?: string
          validation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_validation_logs_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "active_neural_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_validation_logs_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_validation_logs_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_validation_logs_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_versions: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          memory_id: string | null
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          memory_id?: string | null
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          memory_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "memory_versions_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "active_neural_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_versions_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_versions_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_versions_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
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
          actual_hours: number | null
          completion_percentage: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          metadata: Json | null
          name: string
          priority: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          name: string
          priority?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          priority?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
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
      short_term_memory: {
        Row: {
          buffer_position: number
          cognitive_context: Json | null
          created_at: string | null
          emotional_valence: number | null
          expires_at: string | null
          id: string
          importance_score: number | null
          interaction_data: Json
          user_id: string
        }
        Insert: {
          buffer_position: number
          cognitive_context?: Json | null
          created_at?: string | null
          emotional_valence?: number | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          interaction_data: Json
          user_id: string
        }
        Update: {
          buffer_position?: number
          cognitive_context?: Json | null
          created_at?: string | null
          emotional_valence?: number | null
          expires_at?: string | null
          id?: string
          importance_score?: number | null
          interaction_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      task_context_references: {
        Row: {
          cognitive_node_id: string | null
          id: string
          linked_at: string | null
          memory_id: string | null
          metadata: Json | null
          reference_type: string
          relevance_score: number | null
          task_id: string | null
        }
        Insert: {
          cognitive_node_id?: string | null
          id?: string
          linked_at?: string | null
          memory_id?: string | null
          metadata?: Json | null
          reference_type: string
          relevance_score?: number | null
          task_id?: string | null
        }
        Update: {
          cognitive_node_id?: string | null
          id?: string
          linked_at?: string | null
          memory_id?: string | null
          metadata?: Json | null
          reference_type?: string
          relevance_score?: number | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_context_references_cognitive_node_id_fkey"
            columns: ["cognitive_node_id"]
            isOneToOne: false
            referencedRelation: "active_neural_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_context_references_cognitive_node_id_fkey"
            columns: ["cognitive_node_id"]
            isOneToOne: false
            referencedRelation: "cognitive_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_context_references_cognitive_node_id_fkey"
            columns: ["cognitive_node_id"]
            isOneToOne: false
            referencedRelation: "memory_confidence_score"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_context_references_cognitive_node_id_fkey"
            columns: ["cognitive_node_id"]
            isOneToOne: false
            referencedRelation: "memory_inconsistencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_context_references_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_embeddings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_context_references_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task_priority_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_context_references_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          status_after: string | null
          status_before: string | null
          task_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          status_after?: string | null
          status_before?: string | null
          task_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          status_after?: string | null
          status_before?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task_priority_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_performance_metrics: {
        Row: {
          actual_value: number | null
          id: string
          learning_factor: number | null
          metadata: Json | null
          metric_type: string
          predicted_value: number | null
          recorded_at: string | null
          task_id: string | null
          variance: number | null
        }
        Insert: {
          actual_value?: number | null
          id?: string
          learning_factor?: number | null
          metadata?: Json | null
          metric_type: string
          predicted_value?: number | null
          recorded_at?: string | null
          task_id?: string | null
          variance?: number | null
        }
        Update: {
          actual_value?: number | null
          id?: string
          learning_factor?: number | null
          metadata?: Json | null
          metric_type?: string
          predicted_value?: number | null
          recorded_at?: string | null
          task_id?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "task_performance_metrics_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task_priority_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_performance_metrics_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completion_percentage: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          epic_id: string | null
          estimated_hours: number | null
          id: string
          metadata: Json | null
          owner: string
          parent_task_id: string | null
          priority: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          owner: string
          parent_task_id?: string | null
          priority?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          epic_id?: string | null
          estimated_hours?: number | null
          id?: string
          metadata?: Json | null
          owner?: string
          parent_task_id?: string | null
          priority?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "task_priority_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
      active_neural_network: {
        Row: {
          activation_strength: number | null
          connected_nodes: string[] | null
          content: string | null
          created_at: string | null
          id: string | null
          last_accessed_at: string | null
          node_type: Database["public"]["Enums"]["cognitive_node_type"] | null
          title: string | null
        }
        Insert: {
          activation_strength?: number | null
          connected_nodes?: string[] | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          last_accessed_at?: string | null
          node_type?: Database["public"]["Enums"]["cognitive_node_type"] | null
          title?: string | null
        }
        Update: {
          activation_strength?: number | null
          connected_nodes?: string[] | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          last_accessed_at?: string | null
          node_type?: Database["public"]["Enums"]["cognitive_node_type"] | null
          title?: string | null
        }
        Relationships: []
      }
      cognitive_evolution_stats: {
        Row: {
          avg_activation: number | null
          avg_consolidation: number | null
          concept_diversity: number | null
          last_activity: string | null
          long_term_memories: number | null
          recent_nodes: number | null
          total_nodes: number | null
          user_id: string | null
        }
        Relationships: []
      }
      memory_confidence_score: {
        Row: {
          content: string | null
          created_at: string | null
          feedback_confidence: number | null
          feedback_count: number | null
          global_confidence_score: number | null
          id: string | null
          is_sensitive: boolean | null
          relevance_score: number | null
          title: string | null
          updated_at: string | null
          validation_confidence: number | null
        }
        Relationships: []
      }
      memory_inconsistencies: {
        Row: {
          content_similarity_score: number | null
          current_content: string | null
          id: string | null
          title: string | null
          updated_at: string | null
          version_content: string | null
          version_created_at: string | null
          version_number: number | null
        }
        Relationships: []
      }
      project_status_dashboard: {
        Row: {
          blocked_tasks: number | null
          completed_tasks: number | null
          created_at: string | null
          end_date: string | null
          overdue_tasks: number | null
          project_completion: number | null
          project_id: string | null
          project_name: string | null
          project_status: string | null
          start_date: string | null
          total_actual_hours: number | null
          total_epics: number | null
          total_estimated_hours: number | null
          total_tasks: number | null
          updated_at: string | null
          user_id: string | null
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
      task_priority_view: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          calculated_priority: number | null
          completion_percentage: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          epic_id: string | null
          epic_name: string | null
          estimated_hours: number | null
          id: string | null
          metadata: Json | null
          owner: string | null
          parent_task_id: string | null
          priority: number | null
          project_name: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          urgency_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_epic_id_fkey"
            columns: ["epic_id"]
            isOneToOne: false
            referencedRelation: "epics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "task_priority_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_connect_similar_nodes: {
        Args: {
          node_id: string
          similarity_threshold?: number
          max_connections?: number
        }
        Returns: undefined
      }
      auto_rename_chat_session: {
        Args: { p_session_id: string }
        Returns: string
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      cleanup_expired_short_term_memory: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      consolidate_memory_session: {
        Args: { p_user_id: string; p_threshold_hours?: number }
        Returns: string
      }
      create_memory_version: {
        Args: { p_memory_id: string; p_content: string; p_user_id: string }
        Returns: string
      }
      discover_cognitive_clusters: {
        Args: {
          p_user_id: string
          p_min_cluster_size?: number
          p_similarity_threshold?: number
        }
        Returns: number
      }
      get_context_thread: {
        Args: {
          p_project_id?: string
          p_conversation_id?: string
          p_user_id?: string
          p_limit?: number
        }
        Returns: {
          node_id: string
          content: string
          title: string
          node_type: Database["public"]["Enums"]["cognitive_node_type"]
          created_at: string
          relevance_score: number
          is_sensitive: boolean
          global_confidence: number
          context_position: number
        }[]
      }
      get_memory_feedback_summary: {
        Args: { memory_id_param: string }
        Returns: {
          confidence_level: string
          count: number
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
      mark_memory_sensitive: {
        Args: { p_memory_id: string; p_is_sensitive?: boolean }
        Returns: boolean
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
      match_question_embeddings: {
        Args: {
          query_embedding: string
          similarity_threshold: number
          match_count: number
          min_created_at: string
          task_type: string
        }
        Returns: {
          id: string
          question: string
          answer: string
          similarity: number
          model_name: string
          provider: string
        }[]
      }
      neural_cognitive_search: {
        Args: {
          p_user_id: string
          p_query_embedding: string
          p_search_type?: string
          p_limit?: number
          p_similarity_threshold?: number
          p_boost_activation?: boolean
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
          activation_strength: number
          combined_score: number
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
      spread_activation: {
        Args: {
          source_node_id: string
          activation_boost?: number
          max_depth?: number
        }
        Returns: undefined
      }
      validate_memory_consistency: {
        Args: { p_memory_id: string }
        Returns: Json
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
