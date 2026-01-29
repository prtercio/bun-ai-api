import OpenAI from 'openai';
import type { AIService, ChatMessage } from '../types';

const openai = new OpenAI({
	baseURL: "https://router.huggingface.co/v1",
	apiKey: process.env.HF_TOKEN,
});

export const huggingfaceZeService: AIService = {
    name: 'HuggingFaceZe',
    async chat(messages: ChatMessage[]) {
        const stream = await openai.chat.completions.create({
            messages: messages as any,
            model: 'meta-llama/Llama-3.1-8B-Instruct:scaleway',
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