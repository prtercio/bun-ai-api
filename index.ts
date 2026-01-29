import { groqService } from './services/groq';
import { cerebrasService } from './services/cerebras';
import { cerebrasZeService } from './services/cerebrasZE';
import { openrouterService } from './services/openrouter';
import { openrouterZeService } from './services/openrouterZe';
import { groqZeService } from './services/groqZe';
import { cohereService } from './services/cohere';
import type { AIService, ChatMessage } from './types';
import { googleService } from './services/google';
import { huggingfaceZeService } from './services/huggingfaceZe';


const services: AIService[] = [
  huggingfaceZeService,
  googleService,
  groqService,
  groqZeService,
  cerebrasService,
  cerebrasZeService,
  openrouterService,
  openrouterZeService,
  // otro servicio incluso local
]
let currentServiceIndex = 0;

function getNextService() {
  const service = services[currentServiceIndex];
  currentServiceIndex = (currentServiceIndex + 1) % services.length;
  return service;
}

const server = Bun.serve({
  port: process.env.PORT ?? 3005,
  async fetch(req) {
    const { pathname } = new URL(req.url)

    if (req.method === 'POST' && pathname === '/chat') {
      console.log('Handling OPTIONS preflight request');
      const { messages } = await req.json() as { messages: ChatMessage[] };
      const service = getNextService();

      console.log(`Using ${service?.name} service`);
      const stream = await service?.chat(messages)

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
      });
    }

    return new Response("Not found", { status: 404 });
  }
})

console.log(`Server is running on ${server.url}`);