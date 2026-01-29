import { CohereClientV2 } from 'cohere-ai';
import type { AIService, ChatMessage } from '../types';

const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

export const cohereService: AIService = {
  name: 'Cohere',
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await cohere.chatStream({
      messages,
      temperature: 0.3,
      model: "command-a-03-2025",
    });

    return (async function* () {
      for await (const chunk of chatCompletion) {
        const content = (chunk as any)?.delta?.text || (chunk as any)?.text || '';
        yield content;
      }
    })()
  }
}

