
export interface Document {
  id: string;
  user_id: string;
  project_id?: string;
  title: string; // Renamed from 'name'
  type: string;
  source: 'upload' | 'notion' | 'drive' | 'github';
  url?: string;
  summary?: string;
  metadata: Record<string, any>;
  file_size?: number;
  file_path?: string; // New column
  mime_type?: string; // New column
  extraction_method?: string; // New column
  extraction_quality?: number; // New column
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
  };
}

export interface CreateDocumentData {
  title: string; // Renamed from 'name'
  type: string;
  source: 'upload' | 'notion' | 'drive' | 'github';
  url?: string;
  file_size?: number;
  file_path?: string; // New field
  mime_type?: string; // New field
  extraction_method?: string; // New field
  extraction_quality?: number; // New field
  project_id?: string;
  metadata?: Record<string, any>;
}

export interface DocumentFilters {
  project_id?: string;
}
