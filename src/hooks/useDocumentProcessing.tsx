
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useDocumentProcessing() {
  const { toast } = useToast();

  const processDocument = async (documentId: string): Promise<boolean> => {
    try {
      console.log(`Starting processing for document: ${documentId}`);

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: { documentId }
      });

      if (error) {
        console.error('Error calling process-document function:', error);
        toast({
          title: "Erro no processamento",
          description: `Falha ao processar documento: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Document processing response:', data);
      
      toast({
        title: "Documento processado",
        description: `Documento processado com sucesso. ${data.chunksCreated} chunks criados.`,
      });

      return true;
    } catch (error) {
      console.error('Error in processDocument:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro inesperado ao processar o documento",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    processDocument
  };
}
