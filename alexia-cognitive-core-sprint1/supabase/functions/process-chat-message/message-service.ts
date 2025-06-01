
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function saveMessages(
  conversationId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  if (!conversationId) return;

  // Save user message
  const { error: userMessageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
    });

  if (userMessageError) {
    console.error('Error saving user message:', userMessageError);
  }

  // Save AI response
  const { error: aiMessageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse,
      llm_used: 'gpt-4o-mini'
    });

  if (aiMessageError) {
    console.error('Error saving AI message:', aiMessageError);
  }
}
