
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useDocumentProcessing() {
  const { toast } = useToast();

  const processDocument = async (documentId: string): Promise<boolean> => {
    try {
      console.log(`Starting enhanced processing for document: ${documentId}`);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout after 10 minutes')), 600000);
      });

      const processingPromise = supabase.functions.invoke('process-document', {
        body: { documentId }
      });

      const { data, error } = await Promise.race([processingPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error calling process-document function:', error);
        
        let errorMessage = 'Failed to process document';
        
        if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
          errorMessage = 'Processing timeout. The document may be too large.';
        } else if (error.message?.includes('Memory limit exceeded')) {
          errorMessage = 'Document too large for processing. Consider splitting into smaller files.';
        } else if (error.message?.includes('OpenAI')) {
          errorMessage = 'Error with OpenAI API. Please check your configuration.';
        } else if (error.message?.includes('PDF')) {
          errorMessage = 'Error processing PDF. Consider converting to text format.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast({
          title: "Processing error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      console.log('Enhanced document processing response:', data);
      
      const chunksCreated = data?.chunksCreated || 0;
      const processingTime = data?.processingTimeMs || 0;
      const extractionQuality = data?.extractionQuality || 0;
      const extractionMethod = data?.extractionMethod || 'unknown';
      
      // Show enhanced success message with quality info
      const qualityEmoji = extractionQuality >= 80 ? '🎯' : extractionQuality >= 60 ? '✅' : '⚠️';
      
      toast({
        title: "Document processed successfully",
        description: `${qualityEmoji} Quality: ${extractionQuality.toFixed(1)}% | Method: ${extractionMethod} | ${chunksCreated} sections created in ${Math.round(processingTime / 1000)}s`,
      });

      // Show additional info for low quality
      if (extractionQuality < 60) {
        setTimeout(() => {
          toast({
            title: "Extraction quality notice",
            description: `The document was processed with ${extractionQuality.toFixed(1)}% quality. You may want to reprocess or check the original file quality.`,
            variant: "default",
          });
        }, 2000);
      }

      return true;
    } catch (error) {
      console.error('Error in processDocument:', error);
      
      let errorMessage = "An unexpected error occurred while processing the document";
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = "Processing timeout. The document may be too large.";
        } else if (error.message.includes('Memory limit exceeded')) {
          errorMessage = "Document too large for processing. Consider smaller files.";
        } else if (error.message.includes('network')) {
          errorMessage = "Connection error. Please check your internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Processing error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const reprocessDocument = async (documentId: string): Promise<boolean> => {
    try {
      console.log(`Starting enhanced reprocessing for document: ${documentId}`);

      // Update document status to processing before starting
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          status_processing: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document status:', updateError);
        toast({
          title: "Error",
          description: "Failed to update document status",
          variant: "destructive",
        });
        return false;
      }

      // Delete existing sections for this document before reprocessing
      const { error: deleteError } = await supabase
        .from('document_sections')
        .delete()
        .eq('document_id', documentId);

      if (deleteError) {
        console.error('Error deleting existing sections:', deleteError);
      }

      // Delete existing embeddings
      await supabase
        .from('embeddings')
        .delete()
        .eq('document_id', documentId);

      toast({
        title: "Reprocessing started",
        description: "The document is being reprocessed with our enhanced multi-strategy extraction system.",
      });

      // Call the enhanced process function
      return await processDocument(documentId);
    } catch (error) {
      console.error('Error in reprocessDocument:', error);
      
      toast({
        title: "Reprocessing error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    processDocument,
    reprocessDocument
  };
}
