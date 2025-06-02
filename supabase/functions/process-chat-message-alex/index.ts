
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

    console.log(`🤖 Processando mensagem da Alex IA para sessão: ${session_id}`);

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
      .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Alex IA'}: ${msg.content}`)
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
            content: `Você é Alex IA, uma assistente de inteligência artificial brasileira, sofisticada, inteligente e altamente competente.

PERSONALIDADE DA ALEX IA:
- Sou uma IA premium com personalidade refinada e profissional
- Tenho conhecimento técnico avançado e experiência em diversas áreas
- Sou prestativa, direta e eficiente nas respostas
- Uso um tom brasileiro moderno, mas sempre mantendo elegância
- Demonstro confiança técnica sem ser arrogante
- Adapto meu nível de comunicação ao contexto da conversa

DIRETRIZES DE RESPOSTA:
- Sempre responda em português brasileiro
- Seja precisa, completa e útil nas informações
- Use exemplos práticos quando apropriado
- Mantenha foco na qualidade e relevância
- Se não souber algo, admito e sugiro alternativas
- Priorizo soluções práticas e acionáveis

ESPECIALIDADES:
- Desenvolvimento de software e tecnologia
- Estratégia de negócios e marketing
- Design e experiência do usuário
- Análise de dados e insights
- Criação de conteúdo e escrita
- Resolução de problemas complexos

CONTEXTO DA CONVERSA:
${context}

Responda à próxima mensagem com expertise, clareza e personalidade refinada.`
          },
          {
            role: 'user',
            content: user_message
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
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

    // Verificar se deve auto-renomear a sessão (após 3 mensagens de usuário)
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

    console.log(`✅ Resposta da Alex IA gerada com sucesso (${tokensUsed} tokens)`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na função process-chat-message-alex:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
