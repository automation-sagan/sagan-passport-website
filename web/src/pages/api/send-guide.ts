// POST /api/send-guide
// Body: { email: string, guide: 'delegation' | 'compensation' | 'hiring' }
// Resolves the matching `guide` document in Sanity, fetches its PDF asset
// server-side, and sends it via Resend as an attachment. The PDF URL is never
// exposed to the browser. Ported from "Sagan passport Domain/api/send-guide.js"
// — the lead magnet now reads its PDF + email copy from the CMS.
import type { APIRoute } from 'astro';
import { getGuideEmailRecord } from '../../lib/guides';

export const prerender = false;

const RESEND_API_KEY = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY || '';
const FROM = process.env.RESEND_FROM || import.meta.env.RESEND_FROM || 'Sagan <hello@globalandremote.com>';

// Mirror of EMAIL_RE in hubspot-capture.js so client + server agree.
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
    },
  });

function buildHtml(title: string, intro: string) {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111;line-height:1.55;max-width:560px;margin:0 auto;padding:24px;">
  <p style="font-size:16px;">Hey,</p>
  <p style="font-size:16px;">Here's your copy of <strong>${title}</strong> — attached as a PDF.</p>
  <p style="font-size:15px;color:#444;">${intro || ''}</p>
  <p style="font-size:15px;">If anything in here sparks a hire you want to make, just reply to this email — we'll help you figure out the role.</p>
  <p style="font-size:15px;margin-top:32px;">— The Sagan team</p>
  <p style="font-size:12px;color:#888;margin-top:32px;">saganpassport.com</p>
</body></html>`;
}

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} });

export const POST: APIRoute = async ({ request }) => {
  if (!RESEND_API_KEY) {
    console.error('[send-guide] RESEND_API_KEY not set');
    return json({ error: 'Email service not configured' }, 500);
  }

  let body: { email?: string; guide?: string } | null = null;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!body) return json({ error: 'Invalid JSON' }, 400);

  const email = String(body.email || '').trim().toLowerCase();
  const slug = String(body.guide || '').trim().toLowerCase();

  if (!EMAIL_RE.test(email)) return json({ error: 'Invalid email' }, 400);

  const guide = await getGuideEmailRecord(slug);
  if (!guide || !guide.pdfUrl) return json({ error: 'Unknown guide: ' + slug }, 400);

  // Fetch the PDF bytes from the Sanity CDN server-side.
  let pdfBase64: string;
  let filename = guide.pdfFilename || `${slug}.pdf`;
  try {
    const pdfRes = await fetch(guide.pdfUrl);
    if (!pdfRes.ok) throw new Error(`asset fetch ${pdfRes.status}`);
    pdfBase64 = Buffer.from(await pdfRes.arrayBuffer()).toString('base64');
  } catch (err) {
    console.error('[send-guide] Failed to fetch PDF', guide.pdfUrl, err);
    return json({ error: 'Guide file unavailable' }, 500);
  }

  const payload = {
    from: FROM,
    to: [email],
    reply_to: 'support@getsagan.com',
    subject: guide.emailSubject || 'Your guide from Sagan',
    html: buildHtml(guide.emailTitle || 'your guide', guide.emailIntro || ''),
    attachments: [{ filename, content: pdfBase64 }],
  };

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('[send-guide] Resend ' + r.status, data);
      return json({ error: 'Send failed', detail: data }, 502);
    }
    console.log('[send-guide] sent', { id: (data as any).id, slug, email });
    return json({ ok: true, id: (data as any).id });
  } catch (err) {
    console.error('[send-guide] Network error:', err);
    return json({ error: 'Send failed' }, 500);
  }
};
