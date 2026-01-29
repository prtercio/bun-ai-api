import Cerebras from '@cerebras/cerebras_cloud_sdk';
import type { AIService, ChatMessage } from '../types';

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_ZE_API_KEY
});

export const cerebrasZeService: AIService = {
  name: 'CerebrasZe',
  async chat(messages: ChatMessage[]) {
    const stream = await cerebras.chat.completions.create({
      messages: messages as any,
      model: 'zai-glm-4.7',
      stream: true,
      max_completion_tokens: 40960,
      temperature: 0.6,
      top_p: 0.95
    });

    return (async function* () {
      for await (const chunk of stream) {
        yield (chunk as any).choices[0]?.delta?.content || ''
      }
    })()
  }
}