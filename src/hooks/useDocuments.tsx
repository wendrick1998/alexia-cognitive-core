
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDocuments = async (filters?: { project_id?: string }) => {
    if (!user) return;
    
    try {
      setLoading(true);
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
        console.error('Error fetching documents:', error);
        toast({
          title: "Erro ao carregar documentos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Type the data properly with source field and metadata
      const typedDocuments: Document[] = (data || []).map(doc => ({
        ...doc,
        source: doc.source as 'upload' | 'notion' | 'drive' | 'github',
        metadata: (doc.metadata as Record<string, any>) || {},
        project_id: doc.project_id || undefined,
        url: doc.url || undefined,
        summary: doc.summary || undefined,
        file_size: doc.file_size || undefined
      }));

      setDocuments(typedDocuments);
    } catch (error) {
      console.error('Error in fetchDocuments:', error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, projectId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `documents/${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive",
        });
        return false;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const documentData: CreateDocumentData = {
        name: file.name,
        type: fileExt || 'unknown',
        source: 'upload',
        url: publicUrl,
        file_size: file.size,
        project_id: projectId || null,
        metadata: {
          originalName: file.name,
          uploadDate: new Date().toISOString(),
        }
      };

      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          user_id: user.id,
          status_processing: 'pending'
        })
        .select(`
          *,
          project:projects(name)
        `)
        .single();

      if (error) {
        console.error('Error creating document record:', error);
        toast({
          title: "Erro ao salvar documento",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Type the returned data properly with metadata casting
      const typedDocument: Document = {
        ...data,
        source: data.source as 'upload' | 'notion' | 'drive' | 'github',
        metadata: (data.metadata as Record<string, any>) || {},
        project_id: data.project_id || undefined,
        url: data.url || undefined,
        summary: data.summary || undefined,
        file_size: data.file_size || undefined
      };

      setDocuments(prev => [typedDocument, ...prev]);
      
      toast({
        title: "Documento enviado com sucesso",
        description: `O arquivo ${file.name} foi carregado e será processado em breve.`,
      });

      // Trigger document processing asynchronously
      setTimeout(async () => {
        try {
          await supabase.functions.invoke('process-document', {
            body: { documentId: data.id }
          });
        } catch (processError) {
          console.error('Error triggering document processing:', processError);
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Erro ao excluir documento",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      toast({
        title: "Erro ao excluir documento",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    fetchDocuments,
  };
}
