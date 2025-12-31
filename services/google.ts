import { GoogleGenAI } from '@google/genai';
import type { AIService, ChatMessage } from '../types';

const google = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function toGeminiContents(messages: ChatMessage[]) {
  return messages.map(m => ({
    role: m.role, // "user" | "assistant" | "system"
    parts: [{ text: m.content }],
  }));
}

export const googleService: AIService = {
  name: 'Google',
  async chat(messages: ChatMessage[]) {
    const chatCompletion = await google.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: toGeminiContents(messages),
    });

    return (async function* () {
      for await (const chunk of chatCompletion) {
        yield chunk.text || '';
      }
    })();
  }
};
