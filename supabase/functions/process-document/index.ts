import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface ChunkData {
  content: string;
  chunk_index: number;
  metadata: Record<string, any>;
}

// Função melhorada para extração de texto de PDF usando abordagem nativa
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO DE PDF ===`);
  console.log(`Tamanho do buffer: ${arrayBuffer.byteLength} bytes`);
  
  try {
    // Verificar se o buffer contém dados válidos
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Buffer do PDF está vazio');
    }

    // Verificar magic bytes do PDF
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfHeader = new TextDecoder().decode(uint8Array.slice(0, 8));
    console.log(`Header do arquivo: "${pdfHeader}"`);
    
    if (!pdfHeader.startsWith('%PDF-')) {
      throw new Error('Arquivo não é um PDF válido (header inválido)');
    }

    // Tentar extração usando biblioteca pdf2pic/pdf-parse atualizada
    console.log('Tentando extração com pdf-parse...');
    try {
      const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
      
      // Converter para Buffer compatível
      const buffer = new Uint8Array(arrayBuffer);
      
      const options = {
        max: 20, // Limitar a 20 páginas para evitar problemas de memória
        version: 'v1.10.100',
        normalizeWhitespace: true,
        disableCombineTextItems: false
      };
      
      console.log('Iniciando parsing do PDF...');
      const pdfData = await pdfParse.default(buffer, options);
      
      console.log(`PDF parseado - Páginas: ${pdfData.numpages}, Texto bruto: ${pdfData.text.length} chars`);
      console.log(`Amostra do texto bruto (primeiros 200 chars): "${pdfData.text.substring(0, 200)}"`);
      
      let extractedText = pdfData.text;
      
      // Validação e limpeza rigorosa do texto
      if (!extractedText || extractedText.length < 10) {
        throw new Error('Texto extraído muito curto ou vazio');
      }

      // Limpeza do texto extraído
      extractedText = extractedText
        .replace(/\x00/g, '') // Remover caracteres null
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remover caracteres de controle
        .replace(/\f/g, '\n') // Form feed para quebra de linha
        .replace(/\r\n/g, '\n') // Normalizar quebras de linha
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Reduzir múltiplas quebras de linha
        .trim();

      console.log(`Texto após limpeza: ${extractedText.length} chars`);
      console.log(`Amostra do texto limpo (primeiros 300 chars): "${extractedText.substring(0, 300)}"`);
      
      // Validação de qualidade do texto
      const printableChars = extractedText.match(/[a-zA-Z0-9À-ÿ\s\.\,\!\?\;\:\-\(\)\[\]]/g)?.length || 0;
      const qualityRatio = printableChars / extractedText.length;
      
      console.log(`Caracteres legíveis: ${printableChars}/${extractedText.length} (${(qualityRatio * 100).toFixed(2)}%)`);
      
      if (qualityRatio < 0.3) {
        console.warn(`Qualidade do texto baixa: ${qualityRatio}. Tentando método alternativo...`);
        throw new Error('Texto extraído parece corrompido (baixa qualidade)');
      }
      
      // Verificação adicional - procurar por padrões de texto válido
      const hasValidWords = /\b[a-zA-ZÀ-ÿ]{2,}\b/.test(extractedText);
      if (!hasValidWords) {
        throw new Error('Texto extraído não contém palavras válidas');
      }
      
      console.log('✅ Extração PDF bem-sucedida com pdf-parse');
      return extractedText;
      
    } catch (pdfParseError) {
      console.error('Erro com pdf-parse:', pdfParseError);
      console.log('Tentando método alternativo...');
      
      // Método alternativo usando regex simples para extrair texto
      return await extractTextWithSimpleMethod(arrayBuffer);
    }
    
  } catch (error) {
    console.error('Erro geral na extração de PDF:', error);
    throw new Error(`Falha na extração de texto do PDF: ${error.message}`);
  }
}

// Método alternativo simples para extração de texto
async function extractTextWithSimpleMethod(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log('=== USANDO MÉTODO ALTERNATIVO DE EXTRAÇÃO ===');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfContent = new TextDecoder('latin1').decode(uint8Array);
    
    // Buscar por streams de texto no PDF usando regex
    const textMatches = pdfContent.match(/stream\s*(.*?)\s*endstream/gs) || [];
    console.log(`Encontrados ${textMatches.length} streams no PDF`);
    
    let extractedTexts: string[] = [];
    
    for (let i = 0; i < textMatches.length; i++) {
      const stream = textMatches[i];
      
      // Tentar extrair texto do stream
      const textContent = stream
        .replace(/^stream\s*/, '')
        .replace(/\s*endstream$/, '')
        .replace(/BT\s+/, '') // Begin Text
        .replace(/\s+ET/, '') // End Text
        .replace(/\/\w+\s+\d+\s+Tf\s+/g, '') // Font commands
        .replace(/\d+\.?\d*\s+\d+\.?\d*\s+(m|l|c|v|y|h)\s+/g, '') // Path commands
        .replace(/\d+\.?\d*\s+(w|J|j|M|d)\s+/g, '') // Graphics state
        .replace(/q\s+|Q\s+/g, '') // Save/restore graphics state
        .replace(/\[\s*\]\s+d\s+/g, '') // Dash pattern
        .replace(/rg\s+|RG\s+/g, '') // Color commands
        .replace(/\d+\.?\d*\s+\d+\.?\d*\s+(TD|Td|Tm)\s+/g, '') // Text positioning
        .replace(/\(\s*(.*?)\s*\)\s*(Tj|TJ)/g, '$1 ') // Extract text from Tj commands
        .replace(/\<\s*(.*?)\s*\>\s*(Tj|TJ)/g, (match, hex) => {
          // Convert hex strings to text
          try {
            return String.fromCharCode(...hex.match(/.{2}/g)?.map((h: string) => parseInt(h, 16)) || []);
          } catch {
            return '';
          }
        });
      
      if (textContent && textContent.length > 5) {
        extractedTexts.push(textContent);
      }
    }
    
    // Se não encontrou texto nos streams, tentar busca mais ampla
    if (extractedTexts.length === 0) {
      console.log('Nenhum texto encontrado nos streams, tentando busca geral...');
      
      // Buscar padrões de texto mais gerais no PDF
      const generalTextMatches = pdfContent.match(/\((.*?)\)\s*Tj/g) || [];
      for (const match of generalTextMatches) {
        const text = match.replace(/^\(/, '').replace(/\)\s*Tj$/, '');
        if (text && text.length > 2) {
          extractedTexts.push(text);
        }
      }
    }
    
    console.log(`Textos extraídos pelo método alternativo: ${extractedTexts.length} fragmentos`);
    
    if (extractedTexts.length === 0) {
      throw new Error('Nenhum texto encontrado no PDF com método alternativo');
    }
    
    // Combinar e limpar textos extraídos
    let finalText = extractedTexts.join(' ')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`Texto final extraído: ${finalText.length} chars`);
    console.log(`Amostra do texto (primeiros 300 chars): "${finalText.substring(0, 300)}"`);
    
    if (finalText.length < 10) {
      throw new Error('Texto extraído muito curto pelo método alternativo');
    }
    
    // Validação final
    const hasValidContent = /[a-zA-ZÀ-ÿ]{2,}/.test(finalText);
    if (!hasValidContent) {
      throw new Error('Texto extraído não contém conteúdo válido');
    }
    
    console.log('✅ Extração alternativa bem-sucedida');
    return finalText;
    
  } catch (error) {
    console.error('Erro no método alternativo:', error);
    throw new Error(`Método alternativo falhou: ${error.message}`);
  }
}

async function extractTextFromFile(url: string, type: string): Promise<string> {
  console.log(`=== INICIANDO EXTRAÇÃO DE ARQUIVO ===`);
  console.log(`URL: ${url}`);
  console.log(`Tipo: ${type}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Alex-IA-Document-Processor/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar arquivo: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    console.log(`Arquivo baixado com sucesso, tamanho: ${contentLength || 'unknown'} bytes`);

    if (type === 'txt' || type === 'md') {
      const text = await response.text();
      console.log(`Texto extraído de ${type}: ${text.length} caracteres`);
      console.log(`Amostra: "${text.substring(0, 200)}"`);
      return text;
    } else if (type === 'pdf') {
      const arrayBuffer = await response.arrayBuffer();
      console.log(`PDF baixado: ${arrayBuffer.byteLength} bytes`);
      
      const text = await extractTextFromPDF(arrayBuffer);
      
      // Log final do resultado
      console.log(`=== RESULTADO FINAL DA EXTRAÇÃO PDF ===`);
      console.log(`Tamanho do texto extraído: ${text.length} caracteres`);
      console.log(`Primeiros 500 caracteres: "${text.substring(0, 500)}"`);
      console.log(`Últimos 200 caracteres: "${text.substring(Math.max(0, text.length - 200))}"`);
      
      return text;
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${type}`);
    }
  } catch (error) {
    console.error(`Erro na extração de ${type}:`, error);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout ao baixar arquivo: ${url}`);
    }
    throw error;
  }
}

// Memory-optimized chunking function
function* createChunksGenerator(text: string, chunkSize: number = 800, overlap: number = 150): Generator<ChunkData> {
  console.log(`=== CRIANDO CHUNKS ===`);
  console.log(`Texto de entrada: ${text.length} caracteres`);
  console.log(`Configuração: chunkSize=${chunkSize}, overlap=${overlap}`);
  
  if (text.length === 0) {
    throw new Error('Não é possível criar chunks de texto vazio');
  }
  
  let startIndex = 0;
  let chunkIndex = 0;
  const maxChunks = 100; // Limitar chunks por documento

  while (startIndex < text.length && chunkIndex < maxChunks) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const content = text.slice(startIndex, endIndex).trim();
    
    if (content.length > 10) {
      console.log(`Chunk ${chunkIndex}: ${content.length} chars - "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);
      
      yield {
        content,
        chunk_index: chunkIndex,
        metadata: {
          start_index: startIndex,
          end_index: endIndex,
          chunk_size: content.length,
          created_at: new Date().toISOString()
        }
      };
      chunkIndex++;
    }
    
    startIndex = endIndex - overlap;
    
    if (startIndex >= endIndex) {
      break;
    }
  }

  console.log(`Total de chunks criados: ${chunkIndex}`);
}

async function generateEmbedding(text: string, retries: number = 3): Promise<number[]> {
  const truncatedText = text.substring(0, 6000);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt}/${retries} for text length: ${truncatedText.length}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: truncatedText,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (attempt ${attempt}): ${response.status} ${response.statusText} - ${errorText}`);
        
        if (response.status === 401 || response.status === 429) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        if (attempt === retries) {
          throw new Error(`OpenAI API error after ${retries} attempts: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      const data = await response.json();
      console.log(`Successfully generated embedding with ${data.data[0].embedding.length} dimensions`);
      return data.data[0].embedding;
      
    } catch (error) {
      console.error(`Error generating embedding (attempt ${attempt}):`, error);
      
      if (error.name === 'AbortError') {
        console.error('OpenAI API request timed out');
      }
      
      if (attempt === retries) {
        throw new Error(`Failed to generate embedding after ${retries} attempts: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Unexpected error in embedding generation');
}

async function saveChunkWithEmbedding(documentId: string, chunk: ChunkData, embedding: number[]) {
  console.log(`Saving chunk ${chunk.chunk_index} for document ${documentId} (${chunk.content.length} chars)`);
  
  try {
    const { error } = await supabase
      .from('document_chunks')
      .insert({
        document_id: documentId,
        chunk_index: chunk.chunk_index,
        content: chunk.content,
        embedding: JSON.stringify(embedding),
        metadata: chunk.metadata
      });

    if (error) {
      console.error(`Database error saving chunk ${chunk.chunk_index}:`, error);
      throw error;
    }
    
    console.log(`Successfully saved chunk ${chunk.chunk_index}`);
  } catch (error) {
    console.error(`Error saving chunk ${chunk.chunk_index}:`, error);
    throw error;
  }
}

async function updateDocumentStatus(documentId: string, status: string, errorMessage?: string) {
  console.log(`Updating document ${documentId} status to: ${status}`);
  
  const updateData: any = { 
    status_processing: status,
    updated_at: new Date().toISOString()
  };
  
  if (errorMessage) {
    updateData.metadata = { error: errorMessage, error_timestamp: new Date().toISOString() };
  }

  try {
    const { error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId);

    if (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
    
    console.log(`Successfully updated document status to ${status}`);
  } catch (error) {
    console.error('Failed to update document status:', error);
  }
}

serve(async (req) => {
  const startTime = Date.now();
  console.log(`=== PROCESSAMENTO DE DOCUMENTO INICIADO EM ${new Date().toISOString()} ===`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  
  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const requestBody = await req.json();
    documentId = requestBody.documentId;
    
    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing document: ${documentId}`);
    await updateDocumentStatus(documentId, 'processing');

    console.log('Fetching document details from database...');
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      const errorMsg = `Document not found: ${docError?.message || 'Unknown error'}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log(`Found document: ${document.name} (${document.type}) - URL: ${document.url}`);

    if (!document.url) {
      throw new Error('Document URL is missing');
    }

    console.log('Starting text extraction...');
    const text = await extractTextFromFile(document.url, document.type);
    
    if (!text || text.length < 10) {
      throw new Error('No meaningful text extracted from document');
    }

    console.log(`Successfully extracted ${text.length} characters of text`);

    // Process chunks one by one to optimize memory usage
    console.log('Creating and processing chunks with memory optimization...');
    let processedChunks = 0;
    const chunkGenerator = createChunksGenerator(text);
    
    // Process chunks individually to minimize memory usage
    for (const chunk of chunkGenerator) {
      try {
        console.log(`Processing chunk ${chunk.chunk_index + 1} (${chunk.content.length} chars)`);
        
        const embedding = await generateEmbedding(chunk.content);
        await saveChunkWithEmbedding(documentId!, chunk, embedding);
        
        processedChunks++;
        console.log(`Progress: ${processedChunks} chunks processed`);
        
        // Small delay to prevent overwhelming the system
        if (processedChunks % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (chunkError) {
        console.error(`Error processing chunk ${chunk.chunk_index}:`, chunkError);
        throw chunkError;
      }
    }

    if (processedChunks === 0) {
      throw new Error('No chunks were created from the document text');
    }

    await updateDocumentStatus(documentId, 'completed');

    const processingTime = Date.now() - startTime;
    console.log(`=== Successfully processed document ${documentId} in ${processingTime}ms with ${processedChunks} chunks ===`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Document processed successfully with ${processedChunks} chunks`,
        chunksCreated: processedChunks,
        processingTimeMs: processingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`=== Error processing document after ${processingTime}ms ===`);
    console.error('Error details:', error);
    
    if (documentId) {
      try {
        await updateDocumentStatus(documentId, 'failed', error.message);
      } catch (statusError) {
        console.error('Error updating status to failed:', statusError);
      }
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
