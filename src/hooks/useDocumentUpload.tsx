
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

      // Create document record with enhanced schema
      const documentData: CreateDocumentData = {
        title: file.name,
        type: file.name.split('.').pop() || 'unknown',
        source: 'upload',
        url: publicUrl,
        file_size: file.size,
        file_path: publicUrl,
        mime_type: file.type,
        extraction_method: 'pending',
        extraction_quality: 0,
        project_id: projectId || null,
        metadata: {
          originalName: file.name,
          uploadDate: new Date().toISOString(),
          fileType: file.type,
          uploadMethod: 'drag-drop'
        }
      };

      const document = await DocumentService.createDocumentRecord(documentData, user.id);
      
      onDocumentUploaded(document);
      
      toast({
        title: "Document uploaded successfully",
        description: `The file ${file.name} has been uploaded and will be processed using our enhanced extraction system.`,
      });

      // Trigger document processing asynchronously
      setTimeout(async () => {
        try {
          await DocumentService.triggerProcessing(document.id);
          
          toast({
            title: "Processing started",
            description: "Your document is being processed with our multi-strategy extraction system for optimal quality.",
          });
        } catch (processError) {
          console.error('Error triggering document processing:', processError);
          toast({
            title: "Processing error",
            description: "There was an issue starting the document processing. Please try reprocessing the document.",
            variant: "destructive",
          });
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      toast({
        title: "Upload error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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
