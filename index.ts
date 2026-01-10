import { groqService } from './services/groq';
import { cerebrasService } from './services/cerebras';
import { cerebrasZeService } from './services/cerebrasZE';
import { openrouterService } from './services/openrouter';
import { openrouterZeService } from './services/openrouterZe';
import { groqZeService } from './services/groqZe';
import type { AIService, ChatMessage } from './types';
import { googleService } from './services/google';


const services: AIService[] = [
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

// Headers de CORS comunes
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://demo.avisus.com.br',  // Cambia a '*' para testing, pero usa el origen específico en prod
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = Bun.serve({
  port: process.env.PORT ?? 3005,
  async fetch(req) {
    const { pathname } = new URL(req.url)

    if (req.method === 'POST' && pathname === '/chat') {
      const { messages } = await req.json() as { messages: ChatMessage[] };
      const service = getNextService();

      console.log(`Using ${service?.name} service`);
      const stream = await service?.chat(messages)

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...corsHeaders,
        },
      });
    }

    return new Response("Not found", { status: 404 });
  }
})

console.log(`Server is running on ${server.url}`);