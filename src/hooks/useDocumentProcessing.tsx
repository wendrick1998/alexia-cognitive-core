
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useDocumentProcessing() {
  const { toast } = useToast();

  const processDocument = async (documentId: string): Promise<boolean> => {
    try {
      console.log(`Starting processing for document: ${documentId}`);

      // Add timeout to the function call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Processing timeout after 5 minutes')), 300000);
      });

      const processingPromise = supabase.functions.invoke('process-document', {
        body: { documentId }
      });

      const { data, error } = await Promise.race([processingPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error calling process-document function:', error);
        
        let errorMessage = 'Falha ao processar documento';
        
        // Handle specific error types
        if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
          errorMessage = 'Timeout no processamento do documento. Tente novamente.';
        } else if (error.message?.includes('OpenAI')) {
          errorMessage = 'Erro na API do OpenAI. Verifique sua configuração.';
        } else if (error.message?.includes('PDF')) {
          errorMessage = 'Erro ao processar PDF. Considere converter para texto.';
        } else if (error.message) {
          errorMessage = `Erro: ${error.message}`;
        }
        
        toast({
          title: "Erro no processamento",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      console.log('Document processing response:', data);
      
      const chunksCreated = data?.chunksCreated || 0;
      const processingTime = data?.processingTimeMs || 0;
      
      toast({
        title: "Documento processado",
        description: `Documento processado com sucesso. ${chunksCreated} chunks criados em ${Math.round(processingTime / 1000)}s.`,
      });

      return true;
    } catch (error) {
      console.error('Error in processDocument:', error);
      
      let errorMessage = "Ocorreu um erro inesperado ao processar o documento";
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = "Timeout no processamento. O documento pode ser muito grande.";
        } else if (error.message.includes('network')) {
          errorMessage = "Erro de conexão. Verifique sua internet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    processDocument
  };
}
