// Public config for the AI-answering browser demo. Served at /api/config.
// Ported from "Sagan passport Domain/api/config.js". Returns empty strings if
// the env vars are missing so the client renders a friendly "not configured"
// state. Needs VAPI_PUBLIC_KEY / VAPI_ASSISTANT_ID in the deploy env.
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      vapiPublicKey: process.env.VAPI_PUBLIC_KEY || import.meta.env.VAPI_PUBLIC_KEY || '',
      assistantId: process.env.VAPI_ASSISTANT_ID || import.meta.env.VAPI_ASSISTANT_ID || '',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
  );
