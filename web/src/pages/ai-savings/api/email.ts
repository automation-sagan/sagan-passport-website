// POST /ai-savings/api/email
// Thin proxy to Resend's send-email endpoint. The browser posts the full Resend
// request body (from, to, reply_to, subject, html, text) and we forward it
// verbatim with the server-held API key attached.
// Ported VERBATIM from "AI savings scan/api/email.ts" (a Vercel Edge function)
// and adapted to Astro's APIRoute shape + CORS style of send-guide.ts.
import type { APIRoute } from 'astro';

export const prerender = false;

const RESEND_API_KEY =
  process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: CORS });

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_API_KEY) {
    return new Response('Missing RESEND_API_KEY', { status: 500, headers: CORS });
  }

  const upstream = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
};
