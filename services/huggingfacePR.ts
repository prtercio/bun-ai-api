import OpenAI from 'openai';
import type { AIService, ChatMessage } from '../types';

const openai = new OpenAI({
	baseURL: "https://router.huggingface.co/v1",
	apiKey: process.env.HF_TOKENPR,
});

/* Models available:
openai/gpt-oss-20b:groq
zai-org/GLM-4.7-Flash:novita
meta-llama/Llama-3.1-8B-Instruct:novita
*/

export const huggingfacePRService: AIService = {
    name: 'HuggingFacePR',
    async chat(messages: ChatMessage[]) {
        const stream = await openai.chat.completions.create({
            messages: messages as any,
            model: 'openai/gpt-oss-20b:groq',
            stream: true,
            max_tokens: 1024,
            temperature: 0.1,
            top_p: 0.95
        });

        return (async function* () {
            for await (const chunk of stream) {
                yield (chunk as any).choices[0]?.delta?.content || ''
            }
        })()
    }
}