// Vapi tool webhook for the AI answering demo. Ported verbatim (logic) from
// "Sagan passport Domain/api/vapi/tool.js" — handles the four function tools
// (check_service_area, get_available_slots, book_appointment,
// log_callback_request). All data is simulated; this is a demo, not a real
// dispatch system. Vapi POSTs { message: { type, toolCallList: [...] } } and
// expects { results: [{ toolCallId, result }] }.
import type { APIRoute } from 'astro';

export const prerender = false;

const IN_AREA_PREFIXES = ['902', '903', '904', '900', '901', '905'];

function checkServiceArea({ zip, city }: any) {
  const z = String(zip || '').trim();
  const c = String(city || '').trim().toLowerCase();
  if (z) {
    const prefix = z.slice(0, 3);
    const inArea = IN_AREA_PREFIXES.includes(prefix);
    return {
      in_area: inArea,
      message: inArea
        ? `ZIP ${z} is in our service area. We can book an inspection.`
        : `ZIP ${z} is outside our current service area.`,
      coverage_note: inArea ? 'Same-day and next-day windows available.' : 'Consider logging a callback so we can notify them when we expand.',
    };
  }
  if (c) {
    const inAreaCities = ['beverly hills', 'west los angeles', 'santa monica', 'culver city', 'westwood', 'los angeles'];
    const inArea = inAreaCities.some((x) => c.includes(x));
    return {
      in_area: inArea,
      message: inArea ? `${city} is in our service area.` : `${city} is outside our current service area.`,
      coverage_note: inArea ? 'Same-day and next-day windows available.' : 'Consider logging a callback so we can notify them when we expand.',
    };
  }
  return { error: 'Missing zip or city.' };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function buildSlot(daysAhead: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00:00`;
  const label = d.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return { start_iso: iso, label, duration_minutes: 45 };
}

const BUSINESS_HOURS = [9, 10, 11, 13, 14, 15, 16, 18];
const ALWAYS_OPEN = new Set([18]);
const BUCKETS: Record<string, number[]> = {
  morning: [9, 10, 11],
  afternoon: [13, 14, 15, 16],
  evening: [18],
};

function isSlotOpen(date: Date, hour: number) {
  if (ALWAYS_OPEN.has(hour)) return true;
  const seed = date.getFullYear() * 1000 + (date.getMonth() + 1) * 32 + date.getDate();
  return ((seed * (hour + 1)) % 10) < 6;
}

function getAvailableSlots({ preferred_date, preferred_time_of_day, appointment_type }: any) {
  const wantBucket = (preferred_time_of_day || '').toLowerCase();
  const bucketHours = BUCKETS[wantBucket] || BUSINESS_HOURS;

  let startOffset = 1;
  if (preferred_date) {
    const pd = new Date(preferred_date);
    if (!isNaN(pd.getTime())) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const diff = Math.round((pd.getTime() - today.getTime()) / 86400000);
      if (diff >= 0) startOffset = Math.max(diff, 0);
    }
  }

  const slots = [];
  const MAX_SLOTS = wantBucket ? 4 : 5;
  for (let d = startOffset; d < startOffset + 7 && slots.length < MAX_SLOTS; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    for (const h of bucketHours) {
      if (!isSlotOpen(date, h)) continue;
      slots.push(buildSlot(d, h));
      if (slots.length >= MAX_SLOTS) break;
    }
  }

  return {
    slots,
    note: wantBucket
      ? `${slots.length} ${wantBucket} slots in the next 7 days. Appointment type: ${appointment_type || 'inspection'}. A 6 PM window is available every day if nothing earlier fits.`
      : `${slots.length} open windows across the next 7 days. Appointment type: ${appointment_type || 'inspection'}. A 6 PM window is available every day if nothing earlier fits.`,
  };
}

function bookAppointment(args: any) {
  const required = ['customer_name', 'customer_phone', 'address', 'start_iso'];
  for (const k of required) {
    if (!args[k]) return { error: `Missing required field: ${k}` };
  }
  const apptId = 'APT-' + Math.floor(1000 + Math.random() * 9000);
  return {
    success: true,
    appointment_id: apptId,
    confirmation_id: apptId,
    start_iso: args.start_iso,
    customer_name: args.customer_name,
    customer_phone: args.customer_phone,
    address: args.address,
    message: `Booked ${args.customer_name} for ${args.start_iso}. Confirmation ${apptId}. Customer will receive an SMS confirmation shortly.`,
  };
}

function logCallbackRequest(args: any) {
  if (!args.customer_phone || !args.reason) {
    return { error: 'Missing customer_phone or reason.' };
  }
  const ticketId = 'CB-' + Math.floor(1000 + Math.random() * 9000);
  return {
    success: true,
    callback_id: ticketId,
    reason: args.reason,
    customer_name: args.customer_name || null,
    customer_phone: args.customer_phone,
    message: `Callback logged (${ticketId}). Someone will reach out.`,
  };
}

function routeTool(name: string, args: any) {
  args = args || {};
  switch (name) {
    case 'check_service_area': return checkServiceArea(args);
    case 'get_available_slots': return getAvailableSlots(args);
    case 'book_appointment': return bookAppointment(args);
    case 'log_callback_request': return logCallbackRequest(args);
    default: return { error: `Unknown tool: ${name}` };
  }
}

function parseArgs(raw: any) {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

export const OPTIONS: APIRoute = () => new Response(null, { status: 204, headers: CORS });

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const message = body.message || body;
  const calls = message.toolCallList || message.toolCalls || [];

  // Legacy single-call shape
  if (!calls.length && (message.functionCall || message.function)) {
    const fc = message.functionCall || message.function;
    const name = fc.name;
    const args = parseArgs(fc.parameters || fc.arguments);
    const result = routeTool(name, args);
    return json({ result });
  }

  const results = calls.map((call: any) => {
    const fn = call.function || {};
    const name = fn.name;
    const args = parseArgs(fn.arguments);
    const result = routeTool(name, args);
    return { toolCallId: call.id, result };
  });

  return json({ results });
};
