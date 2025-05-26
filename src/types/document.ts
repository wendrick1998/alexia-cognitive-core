
export interface Document {
  id: string;
  user_id: string;
  project_id?: string;
  name: string;
  type: string;
  source: 'upload' | 'notion' | 'drive' | 'github';
  url?: string;
  summary?: string;
  metadata: Record<string, any>;
  file_size?: number;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
  };
}

export interface CreateDocumentData {
  name: string;
  type: string;
  source: 'upload' | 'notion' | 'drive' | 'github';
  url?: string;
  file_size?: number;
  project_id?: string;
  metadata?: Record<string, any>;
}

export interface DocumentFilters {
  project_id?: string;
}
