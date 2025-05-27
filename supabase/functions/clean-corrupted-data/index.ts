
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  success: boolean;
  sectionsRemoved: number;
  documentsMarked: number;
  error?: string;
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

    console.log('🧹 Iniciando limpeza de document_sections corrompidas...');

    // 1. Analisar todas as sections
    const { data: sections, error } = await supabase
      .from('document_sections')
      .select('id, document_id, section_number, content')
      .order('document_id', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar sections: ${error.message}`);
    }

    console.log(`📊 Total de sections: ${sections?.length || 0}`);

    const corruptedSections: any[] = [];
    const documentsToReprocess = new Set<string>();

    // 2. Identificar sections corrompidas
    for (const section of sections || []) {
      if (isCorruptedContent(section.content)) {
        corruptedSections.push(section);
        documentsToReprocess.add(section.document_id);
      }
    }

    console.log(`❌ Sections corrompidas: ${corruptedSections.length}`);
    console.log(`📄 Documentos afetados: ${documentsToReprocess.size}`);

    // 3. Limpar sections corrompidas
    if (corruptedSections.length > 0) {
      console.log('🗑️ Deletando sections corrompidas...');

      for (const section of corruptedSections) {
        const { error: deleteError } = await supabase
          .from('document_sections')
          .delete()
          .eq('id', section.id);

        if (deleteError) {
          console.error(`Erro ao deletar section ${section.id}:`, deleteError);
        }
      }

      console.log('✅ Sections corrompidas removidas!');
    }

    // 4. Marcar documentos para reprocessamento
    if (documentsToReprocess.size > 0) {
      console.log('📝 Marcando documentos para reprocessamento...');

      for (const docId of documentsToReprocess) {
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            extraction_method: 'pending_reprocess',
            extraction_quality: 0,
            metadata: {
              needs_reprocess: true,
              corrupted_sections_removed: true,
              cleanup_date: new Date().toISOString()
            }
          })
          .eq('id', docId);

        if (updateError) {
          console.error(`Erro ao atualizar documento ${docId}:`, updateError);
        }
      }

      console.log('✅ Documentos marcados para reprocessamento!');
    }

    const result: CleanupResult = {
      success: true,
      sectionsRemoved: corruptedSections.length,
      documentsMarked: documentsToReprocess.size
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na limpeza:', error);
    
    const result: CleanupResult = {
      success: false,
      sectionsRemoved: 0,
      documentsMarked: 0,
      error: error.message
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function isCorruptedContent(content: string): boolean {
  if (!content) return true;

  // Padrões que indicam metadados/corrupção
  const corruptionIndicators = [
    'Type FontDescriptor',
    'PDF-',
    'BaseFont',
    'MediaBox',
    'Filter FlateDecode',
    'FontName',
    'CIDFont',
    'Registry (Adobe)',
    'obj endobj'
  ];

  // Verificar se contém indicadores de corrupção
  const hasCorruption = corruptionIndicators.some(indicator => 
    content.includes(indicator)
  );

  // Verificar proporção de texto válido
  const validChars = (content.match(/[a-zA-ZÀ-ÿ\s]/g) || []).length;
  const totalChars = content.length;
  const validRatio = validChars / totalChars;

  // Se tem metadados ou menos de 60% de caracteres válidos, está corrompido
  return hasCorruption || validRatio < 0.6;
}
