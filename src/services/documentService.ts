
import { supabase } from '@/integrations/supabase/client';
import { Document, CreateDocumentData, DocumentFilters } from '@/types/document';

export class DocumentService {
  static async fetchDocuments(userId: string, filters?: DocumentFilters): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select(`
        *,
        project:projects(name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.project_id) {
      if (filters.project_id === 'none') {
        query = query.is('project_id', null);
      } else {
        query = query.eq('project_id', filters.project_id);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Type the data properly with source field and metadata
    return (data || []).map(doc => ({
      ...doc,
      source: doc.source as 'upload' | 'notion' | 'drive' | 'github',
      metadata: (doc.metadata as Record<string, any>) || {},
      project_id: doc.project_id || undefined,
      url: doc.url || undefined,
      summary: doc.summary || undefined,
      file_size: doc.file_size || undefined,
      file_path: doc.file_path || undefined,
      mime_type: doc.mime_type || undefined,
      extraction_method: doc.extraction_method || undefined,
      extraction_quality: doc.extraction_quality || undefined
    }));
  }

  static async uploadFile(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${userId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  static async createDocumentRecord(
    documentData: CreateDocumentData, 
    userId: string
  ): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...documentData,
        user_id: userId,
        status_processing: 'pending'
      })
      .select(`
        *,
        project:projects(name)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Type the returned data properly with metadata casting
    return {
      ...data,
      source: data.source as 'upload' | 'notion' | 'drive' | 'github',
      metadata: (data.metadata as Record<string, any>) || {},
      project_id: data.project_id || undefined,
      url: data.url || undefined,
      summary: data.summary || undefined,
      file_size: data.file_size || undefined,
      file_path: data.file_path || undefined,
      mime_type: data.mime_type || undefined,
      extraction_method: data.extraction_method || undefined,
      extraction_quality: data.extraction_quality || undefined
    };
  }

  static async deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw error;
    }
  }

  static async triggerProcessing(documentId: string): Promise<void> {
    await supabase.functions.invoke('process-document', {
      body: { documentId }
    });
  }
}
