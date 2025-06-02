
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  session_id: string;
  user_message: string;
  user_id: string;
}

interface ChatResponse {
  response: string;
  model_used: string;
  tokens_used?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, user_message, user_id }: ChatRequest = await req.json();
    
    if (!session_id || !user_message || !user_id) {
      return new Response(
        JSON.stringify({ error: 'session_id, user_message and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🤖 Processando mensagem da Yá para sessão: ${session_id}`);

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar histórico da conversa (últimas 10 mensagens)
    const { data: messageHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) {
      console.error('Erro ao buscar histórico:', historyError);
    }

    // Preparar contexto da conversa
    const conversationHistory = messageHistory || [];
    const context = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Yá'}: ${msg.content}`)
      .join('\n');

    // Chamar OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é Yá, uma assistente de IA brasileira, inteligente, prestativa e carismática. 

PERSONALIDADE:
- Seja natural, amigável e conversacional
- Use um tom brasileiro descontraído, mas profissional
- Seja concisa mas completa nas respostas
- Demonstre empatia e compreensão
- Use emojis quando apropriado, mas com moderação

DIRETRIZES:
- Sempre responda em português brasileiro
- Adapte seu nível de formalidade ao contexto
- Seja útil e prática nas suas sugestões
- Se não souber algo, admita e ofereça alternativas
- Mantenha o foco no que o usuário realmente precisa

CONTEXTO DA CONVERSA:
${context}

Responda de forma natural e útil à próxima mensagem do usuário.`
          },
          {
            role: 'user',
            content: user_message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('Erro da OpenAI:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
    const tokensUsed = openaiData.usage?.total_tokens || 0;

    // Salvar mensagem do usuário
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id,
        role: 'user',
        content: user_message,
      });

    if (userMessageError) {
      console.error('Erro ao salvar mensagem do usuário:', userMessageError);
    }

    // Salvar resposta da IA
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id,
        role: 'assistant',
        content: aiResponse,
        tokens_used: tokensUsed,
        llm_model: 'gpt-4o-mini',
      });

    if (aiMessageError) {
      console.error('Erro ao salvar resposta da IA:', aiMessageError);
    }

    // Verificar se deve auto-renomear a sessão
    const { data: userMessagesCount } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact' })
      .eq('session_id', session_id)
      .eq('role', 'user');

    if (userMessagesCount && userMessagesCount.count === 3) {
      // Chamar função de auto-renomeação
      const { data: newTitle, error: renameError } = await supabase
        .rpc('auto_rename_chat_session', { p_session_id: session_id });

      if (renameError) {
        console.error('Erro ao auto-renomear sessão:', renameError);
      } else if (newTitle) {
        console.log(`📝 Sessão auto-renomeada para: ${newTitle}`);
      }
    }

    const response: ChatResponse = {
      response: aiResponse,
      model_used: 'gpt-4o-mini',
      tokens_used: tokensUsed,
    };

    console.log(`✅ Resposta da Yá gerada com sucesso (${tokensUsed} tokens)`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na função process-chat-message-yaa:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
