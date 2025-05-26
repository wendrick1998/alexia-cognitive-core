
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DocumentService } from '@/services/documentService';
import { CreateDocumentData, Document } from '@/types/document';

export function useDocumentUpload(
  onDocumentUploaded: (document: Document) => void
) {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadDocument = async (file: File, projectId?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setUploading(true);

      // Upload file to Supabase Storage
      const publicUrl = await DocumentService.uploadFile(file, user.id);

      // Create document record
      const documentData: CreateDocumentData = {
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        source: 'upload',
        url: publicUrl,
        file_size: file.size,
        project_id: projectId || null,
        metadata: {
          originalName: file.name,
          uploadDate: new Date().toISOString(),
        }
      };

      const document = await DocumentService.createDocumentRecord(documentData, user.id);
      
      onDocumentUploaded(document);
      
      toast({
        title: "Documento enviado com sucesso",
        description: `O arquivo ${file.name} foi carregado e será processado em breve.`,
      });

      // Trigger document processing asynchronously
      setTimeout(async () => {
        try {
          await DocumentService.triggerProcessing(document.id);
        } catch (processError) {
          console.error('Error triggering document processing:', processError);
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadDocument,
  };
}
