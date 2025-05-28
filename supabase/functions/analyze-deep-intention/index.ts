
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, context, userId } = await req.json();
    
    if (!input) {
      return new Response(
        JSON.stringify({ error: 'input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing deep intention for user: ${userId}`);
    console.log(`Input: ${input.substring(0, 200)}...`);

    const analysisPrompt = `Analyze the following user input deeply and extract multiple layers of meaning:

INPUT: "${input}"
CONTEXT: ${JSON.stringify(context)}

Please analyze and return a JSON object with:
1. explicitIntent: What the user explicitly asked for
2. implicitNeeds: Underlying needs that weren't explicitly mentioned
3. emotionalContext: Emotional tone (happy, frustrated, urgent, curious, etc.)
4. urgencyLevel: high, medium, or low
5. complexity: Number between 0-1 representing task complexity
6. suggestedAgents: Array of agent types needed (analytical-agent, creative-agent, technical-agent, integration-agent)
7. anticipatedNeeds: What the user might need next based on this request

Respond only with valid JSON.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an advanced intention analysis system. Analyze user inputs to understand multiple layers of meaning and intent.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let analysis;
    
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing analysis JSON:', parseError);
      // Fallback analysis
      analysis = {
        explicitIntent: input,
        implicitNeeds: [],
        emotionalContext: 'neutral',
        urgencyLevel: 'medium',
        complexity: 0.5,
        suggestedAgents: ['analytical-agent'],
        anticipatedNeeds: []
      };
    }

    console.log('Deep intention analysis completed:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-deep-intention function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
