import { Groq } from 'groq-sdk';
import type { AIService, ChatMessage } from '../types';

const groqZe = new Groq(
  {apiKey: process.env.GROQ_ZE_API_KEY}
);

export const groqZeService: AIService = {
  name: 'GroqZe',
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await groqZe.chat.completions.create({
      messages,
      model: "qwen/qwen3-32b",
      temperature: 0.1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null
    });
    
    return (async function* () {
      for await (const chunk of chatCompletion) {
        yield chunk.choices[0]?.delta?.content || ''
      }
    })()
  }
}

