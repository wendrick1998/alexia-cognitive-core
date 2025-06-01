
// OpenAI embedding service
export async function generateEmbedding(text: string, openAIApiKey: string, retries: number = 3): Promise<number[]> {
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
