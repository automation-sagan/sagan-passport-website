// Post-call QA endpoint for the AI-answering demo. Ported from
// "Sagan passport Domain/api/vapi/qa.js". Runs an LLM review of the transcript
// + tool trace against a fixed rubric and returns structured checks; falls back
// to deterministic rule-based checks when ANTHROPIC_API_KEY is not configured.
import type { APIRoute } from 'astro';

export const prerender = false;

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-5';

const RUBRIC = `You review a voice-agent call for a home services AI answering agent (Splendid Tile Roofing) AND normalize the caller's details for downstream CRM/SMS use. Return JSON only.

The agent is expected to:
1. Greet warmly and identify itself.
2. Ask for and confirm the caller's ZIP code before offering scheduling.
3. Call check_service_area with the ZIP before promising anything.
4. Never quote a price — always offer a free inspection instead.
5. If in service area: offer concrete slots, collect name + phone + address, then call book_appointment.
6. If out of area, decline politely and log a callback.
7. Confirm the appointment details back to the caller before ending the call.

Return exactly this JSON structure (no prose, no code fences):

{
  "checks": [
    { "label": "...", "detail": "...", "status": "pass" | "fail" | "warn" }
  ],
  "normalized": {
    "name":             "cleaned caller name with proper capitalization, or null",
    "phone":            "cleaned phone number in (XXX) XXX-XXXX format, or null",
    "address":          "cleaned street address with proper capitalization, correcting obvious transcription errors based on context (e.g. if the transcript says 'Bivley Hills' next to ZIP 90210, normalize to 'Beverly Hills'), or null",
    "zip":              "5-digit ZIP, or null",
    "appointment_type": "short label for what the caller wanted, e.g. 'roof inspection', 'leak repair', 'gutter repair', or null"
  }
}

Produce 4–7 checks covering:
- Script adherence (did the agent follow the flow above)
- Required data collected (name, phone, address, ZIP)
- Address ↔ ZIP plausibility (does the stated address look consistent with the ZIP they gave)
- Price/quoting discipline (did the agent avoid quoting over the phone)
- Outstanding or unanswered questions the caller asked that the agent did not fully address
- Booking outcome (booked successfully, callback logged, or nothing)

For the "normalized" object, use your judgment on transcription errors — the transcriber is phonetic and does not know proper nouns. Use ZIP code, city context, and consistency with other fields to correct obvious errors. If a field was never captured on the call, return null for it.

Each check detail should be one crisp sentence, readable by an ops lead scanning the page.`;

async function callAnthropic({ transcript, toolTrace, collected, booking }: any) {
  const apiKey = process.env.ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('missing ANTHROPIC_API_KEY');

  const userContent = [
    'TRANSCRIPT:',
    transcript || '(no transcript captured)',
    '',
    'TOOL TRACE:',
    JSON.stringify(toolTrace || [], null, 2),
    '',
    'COLLECTED FIELDS:',
    JSON.stringify(collected || {}, null, 2),
    '',
    'BOOKING RESULT:',
    JSON.stringify(booking || null, null, 2),
  ].join('\n');

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      system: RUBRIC,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = (data.content || []).map((b: any) => b.text || '').join('').trim();
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

function ruleBasedNormalized({ collected }: any) {
  return {
    name: collected?.customer_name || null,
    phone: collected?.customer_phone || null,
    address: collected?.address || null,
    zip: collected?.zip || null,
    appointment_type: collected?.appointment_type || null,
  };
}

function ruleBasedChecks({ transcript, toolTrace, collected, booking }: any) {
  const toolNames = (toolTrace || []).map((c: any) => c.name);
  const checks = [];

  const greeted = /mighty dog|layla|hector|assistant/i.test(transcript || '');
  const askedZip = /zip|zip code|where are you/i.test(transcript || '');
  checks.push({
    label: 'Script adherence',
    detail: greeted && askedZip ? 'Agent greeted, identified itself, and asked for ZIP.' : 'Agent may have skipped a required step.',
    status: greeted && askedZip ? 'pass' : 'warn',
  });

  const serviceAreaChecked = toolNames.includes('check_service_area');
  checks.push({
    label: 'Service area verified',
    detail: serviceAreaChecked ? 'check_service_area ran before any scheduling offer.' : 'Agent did not verify the service area.',
    status: serviceAreaChecked ? 'pass' : 'fail',
  });

  const have = ['customer_name', 'customer_phone', 'address'].filter((k) => collected && collected[k]);
  checks.push({
    label: 'Required data collected',
    detail: have.length === 3 ? 'Captured name, phone, and address.' : `Missing fields: ${['customer_name', 'customer_phone', 'address'].filter((k) => !collected || !collected[k]).join(', ')}.`,
    status: have.length === 3 ? 'pass' : have.length >= 1 ? 'warn' : 'fail',
  });

  const addr = (collected?.address || '').toLowerCase();
  const zip = collected?.zip;
  let zipPlausibility = 'warn';
  let zipDetail = 'Could not validate address against ZIP with available data.';
  if (zip && addr) {
    const zipInAddress = addr.includes(String(zip));
    zipPlausibility = zipInAddress ? 'pass' : 'warn';
    zipDetail = zipInAddress ? `Address contains the stated ZIP (${zip}).` : `Address does not mention ZIP ${zip} — ops should spot-check.`;
  }
  checks.push({ label: 'Address ↔ ZIP plausibility', detail: zipDetail, status: zipPlausibility });

  const quoted = /(\$[0-9]|dollars|cost you|price you|rate is)/i.test(transcript || '');
  checks.push({
    label: 'Pricing discipline',
    detail: quoted ? 'Possible price mentioned over the phone — review.' : 'Agent did not quote a price over the phone.',
    status: quoted ? 'warn' : 'pass',
  });

  const bookedOk = Boolean(booking) && !booking.error;
  const callbackLogged = toolNames.includes('log_callback_request');
  let outcomeLabel = 'No outcome recorded';
  let outcomeStatus = 'warn';
  if (bookedOk) { outcomeLabel = 'Appointment booked'; outcomeStatus = 'pass'; }
  else if (callbackLogged) { outcomeLabel = 'Callback request logged'; outcomeStatus = 'pass'; }
  checks.push({ label: 'Call outcome', detail: outcomeLabel + '.', status: outcomeStatus });

  return { checks };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: CORS });

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const input = {
    transcript: body.transcript || '',
    toolTrace: body.toolTrace || [],
    collected: body.collected || {},
    booking: body.booking || null,
  };

  try {
    const fromLLM = await callAnthropic(input);
    if (fromLLM && Array.isArray(fromLLM.checks)) {
      if (!fromLLM.normalized) fromLLM.normalized = ruleBasedNormalized(input);
      return json(fromLLM);
    }
  } catch (err: any) {
    console.error('LLM QA failed, falling back to rules:', err?.message);
  }

  const fallback: any = ruleBasedChecks(input);
  fallback.normalized = ruleBasedNormalized(input);
  return json(fallback);
};
