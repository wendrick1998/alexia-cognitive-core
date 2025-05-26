
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DocumentService } from '@/services/documentService';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { Document, DocumentFilters } from '@/types/document';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDocumentUploaded = (document: Document) => {
    setDocuments(prev => [document, ...prev]);
  };

  const { uploading, uploadDocument } = useDocumentUpload(handleDocumentUploaded);

  const fetchDocuments = async (filters?: DocumentFilters) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await DocumentService.fetchDocuments(user.id, filters);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Erro ao carregar documentos",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await DocumentService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Erro ao excluir documento",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
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

// Export types for backward compatibility
export type { Document, CreateDocumentData } from '@/types/document';
