// POST /ai-savings/api/generate-team
// Thin proxy to OpenRouter's chat-completions endpoint. The browser posts the
// full OpenRouter request body (model, messages, temperature, max_tokens) and
// we forward it verbatim with the server-held API key attached. The response is
// returned as JSON (the client reads res.json()).
// Ported VERBATIM from "AI savings scan/api/generate-team.ts" (a Vercel Edge
// function) and adapted to Astro's APIRoute shape + CORS style of send-guide.ts.
import type { APIRoute } from 'astro';

export const prerender = false;

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY || '';
const PUBLIC_SITE_URL =
  process.env.PUBLIC_SITE_URL ||
  import.meta.env.PUBLIC_SITE_URL ||
  'https://sagan-savings-scan.vercel.app';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: CORS });

export const POST: APIRoute = async ({ request }) => {
  if (!OPENROUTER_API_KEY) {
    return new Response('Missing OPENROUTER_API_KEY', { status: 500, headers: CORS });
  }

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': PUBLIC_SITE_URL,
      'X-Title': 'Sagan Roles-at-Risk Scanner',
    },
    body: await request.text(),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
};
