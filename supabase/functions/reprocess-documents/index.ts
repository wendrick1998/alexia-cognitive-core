
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReprocessResult {
  success: boolean;
  documentsProcessed: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Iniciando reprocessamento de documentos...');

    // 1. Buscar documentos que precisam reprocessamento
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .or('extraction_method.eq.pending_reprocess,extraction_quality.lt.50')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar documentos: ${error.message}`);
    }

    console.log(`📄 Documentos para reprocessar: ${documents?.length || 0}`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 2. Reprocessar cada documento
    for (const doc of documents || []) {
      console.log(`📋 Processando: ${doc.title}`);
      
      try {
        // Chamar a função de processamento existente
        const processResponse = await fetch(`${supabaseUrl}/functions/v1/process-document`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            document_id: doc.id,
            reprocess: true
          })
        });

        if (processResponse.ok) {
          const result = await processResponse.json();
          if (result.success) {
            console.log(`✅ Sucesso! Qualidade: ${result.extraction_quality || 'N/A'}%`);
            successCount++;
          } else {
            const errorMsg = `Erro no documento ${doc.title}: ${result.error}`;
            console.error(`❌ ${errorMsg}`);
            errors.push(errorMsg);
            errorCount++;
          }
        } else {
          const errorMsg = `Erro HTTP ${processResponse.status} no documento ${doc.title}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
          errorCount++;
        }

      } catch (error) {
        const errorMsg = `Erro ao processar ${doc.title}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        errorCount++;
      }

      // Aguardar um pouco entre processamentos para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('📊 Resumo do reprocessamento:');
    console.log(`✅ Sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📄 Total: ${documents?.length || 0}`);

    const result: ReprocessResult = {
      success: true,
      documentsProcessed: documents?.length || 0,
      successCount,
      errorCount,
      errors
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no reprocessamento:', error);
    
    const result: ReprocessResult = {
      success: false,
      documentsProcessed: 0,
      successCount: 0,
      errorCount: 1,
      errors: [error.message]
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
