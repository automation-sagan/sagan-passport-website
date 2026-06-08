// /agent/ai-answering — Vapi Web SDK wiring for the live AI answering demo.
// Loads the Vapi SDK via esm.sh, pulls public config from /api/config, wires
// call controls, streams transcript to the left panel, animates tool calls on
// the right, and renders the post-call QA + CRM artifacts.

const $ = (id) => document.getElementById(id);

const state = {
  vapi: null,
  inCall: false,
  callStartAt: null,
  timerInterval: null,
  toolCalls: new Map(),
  config: null,
  bookedAppointment: null,
  collected: {},
  callerId: null,
};

function generateCallerId() {
  const area = [213, 310, 323, 424, 818, 747][Math.floor(Math.random() * 6)]; // LA area codes
  const mid = Math.floor(Math.random() * 900) + 100;
  const last = Math.floor(Math.random() * 9000) + 1000;
  return `+1 (${area}) ${mid}-${last}`;
}

async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('config ' + res.status);
    state.config = await res.json();
    return state.config;
  } catch (err) {
    console.error('Failed to load config', err);
    return null;
  }
}

function showConfigError(msg) {
  const btn = $('demoToggle');
  $('demoLabel').textContent = msg || 'Demo unavailable — config missing';
  btn.style.opacity = '0.6';
  btn.style.cursor = 'not-allowed';
  btn.disabled = true;
}

async function boot() {
  const cfg = await loadConfig();
  if (!cfg || !cfg.vapiPublicKey || !cfg.assistantId) {
    showConfigError('Demo not configured yet — add VAPI_PUBLIC_KEY + VAPI_ASSISTANT_ID');
    return;
  }
  let Vapi;
  try {
    const mod = await import('https://esm.sh/@vapi-ai/web@2.5.2');
    Vapi = mod.default || mod.Vapi || mod;
  } catch (err) {
    console.error('Failed to load Vapi SDK', err);
    showConfigError('Demo SDK failed to load');
    return;
  }
  try {
    state.vapi = new Vapi(cfg.vapiPublicKey);
  } catch (err) {
    console.error('Vapi init failed', err);
    showConfigError('Vapi init failed');
    return;
  }
  wireEvents();
  $('demoToggle').addEventListener('click', onDemoToggle);
}

function wireEvents() {
  const v = state.vapi;
  v.on('call-start', handleCallStart);
  v.on('call-end', handleCallEnd);
  v.on('speech-start', () => setStatus('agent-speaking'));
  v.on('speech-end', () => setStatus('listening'));
  v.on('volume-level', handleVolumeLevel);
  v.on('message', handleMessage);
  v.on('error', (err) => {
    console.error('Vapi error', err);
    setStatus('error');
    surfaceError(err);
  });
}

function surfaceError(err) {
  try {
    const msg = extractErrorMessage(err);
    // Anchor to the demo section so the hint shows up regardless of surrounding DOM shape
    const anchor = document.getElementById('demoToggle')?.closest('section') || document.body;
    let errEl = document.getElementById('errorHint');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.id = 'errorHint';
      errEl.style.cssText = 'margin:16px 24px 0;padding:14px 18px;background:rgba(199,68,58,0.08);border:1px solid rgba(199,68,58,0.25);border-radius:12px;color:#C7443A;font-size:13px;line-height:1.5;max-width:72rem;';
      const btn = document.getElementById('demoToggle');
      if (btn && btn.parentElement) btn.parentElement.parentElement.insertAdjacentElement('afterend', errEl);
      else anchor.appendChild(errEl);
    }
    errEl.innerHTML = '<strong>Call could not start.</strong> ' + esc(msg) + ' <span style="opacity:0.65">(check Vercel env var <code style="font-family:Fragment Mono,monospace">VAPI_PUBLIC_KEY</code> — it must be the <em>public</em> key from the Vapi dashboard, not the private one.)</span>';
  } catch (e) {
    console.error('surfaceError failed', e);
  }
}

function extractErrorMessage(err) {
  if (!err) return 'Unknown error.';
  if (typeof err === 'string') return err;
  // Vapi error shape: {type, stage, error: {error: {error: "Unauthorized", message, statusCode}}}
  const inner = err?.error?.error?.error || err?.error?.error || err?.error;
  if (inner) {
    if (typeof inner === 'string') return inner;
    if (inner.message) return inner.message;
    if (inner.error) return typeof inner.error === 'string' ? inner.error : JSON.stringify(inner.error);
  }
  if (err.message) return err.message;
  try { return JSON.stringify(err); } catch { return String(err); }
}

function setStatus(status) {
  const labels = {
    idle: 'idle',
    connecting: 'connecting…',
    listening: 'listening',
    'agent-speaking': 'agent speaking',
    ended: 'call ended',
    error: 'error',
  };
  const colors = {
    idle: 'rgba(74,107,107,0.5)',
    connecting: '#F5B800',
    listening: '#2E8B57',
    'agent-speaking': '#2197FF',
    ended: '#4A6B6B',
    error: '#C7443A',
  };
  $('statusText').textContent = labels[status] || status;
  $('statusDot').style.background = colors[status] || colors.idle;
}

function handleCallStart() {
  state.inCall = true;
  state.callStartAt = Date.now();
  state.callerId = generateCallerId();
  setStatus('listening');
  clearTranscript();
  clearToolPanel();
  $('postCall').classList.add('hidden');
  startTimer();
  $('demoToggle').classList.add('live');
  setButtonLoading(false);
}

async function handleCallEnd() {
  const hadCall = state.inCall;
  state.inCall = false;
  stopTimer();
  setStatus('ended');
  $('demoToggle').classList.remove('live');
  setButtonLoading(false);
  if (!hadCall) return;
  showPostCall();
  // Paint skeleton loaders in every post-call panel immediately. Hold them up
  // until QA returns so the artifacts render ONCE with the LLM-normalized data
  // (accent-corrected address, properly-cased name, formatted phone) instead
  // of flashing raw transcript text first.
  paintSkeletons();
  // runQA applies normalized fields and calls renderArtifacts itself — both
  // on success and in the failure path — so skeletons are guaranteed to clear.
  await runQA();
}

// Max bar height stays under the levelBars container's fixed 22px so the
// titlebar height never changes as volume moves.
const LEVEL_BAR_MAX = 20;
function handleVolumeLevel(vol) {
  const bars = $('levelBars')?.querySelectorAll('.level-bar') || [];
  const v = Math.min(1, Math.max(0, Number(vol) || 0));
  const bases = [8, 14, 10, 18, 12];
  bars.forEach((bar, i) => {
    const base = bases[i] || 10;
    const raw = Math.max(base * 0.4, base * (0.4 + v * 1.4));
    bar.style.height = Math.min(LEVEL_BAR_MAX, raw) + 'px';
  });
}

const DEBUG = /[?&]debug=1/.test(location.search);

function handleMessage(msg) {
  if (!msg || !msg.type) return;
  if (DEBUG) console.log('[vapi msg]', msg.type, msg);

  if (msg.type === 'transcript') {
    appendTranscript(msg);
    return;
  }

  if (msg.type === 'tool-calls') {
    // v2 shape
    const calls = msg.toolCalls || msg.toolCallList || [];
    for (const call of calls) {
      const fn = call.function || {};
      recordToolCall(call.id || fn.name + '-' + Date.now(), fn.name, parseArgs(fn.arguments));
    }
    return;
  }

  if (msg.type === 'tool-calls-result') {
    const results = msg.toolCallResults || msg.toolCallList || [];
    for (const r of results) {
      const id = r.toolCallId || r.id || r.name;
      finalizeToolCall(id, r.result ?? r.response ?? r);
    }
    return;
  }

  if (msg.type === 'function-call') {
    const fn = msg.functionCall || {};
    recordToolCall(fn.name + '-' + Date.now(), fn.name, parseArgs(fn.parameters || fn.arguments));
    return;
  }

  if (msg.type === 'function-call-result') {
    // legacy shape; we cannot correlate to a specific call id, so finalize last pending by name
    const name = msg.functionCallResult?.name || msg.name;
    const result = msg.functionCallResult?.result ?? msg.result;
    finalizeLastByName(name, result);
    return;
  }
}

function parseArgs(a) {
  if (a == null) return null;
  if (typeof a === 'string') {
    try { return JSON.parse(a); } catch { return a; }
  }
  return a;
}

function clearTranscript() {
  $('transcript').innerHTML = '';
}

function appendTranscript(msg) {
  const role = msg.role;
  const text = msg.transcript;
  const isFinal = msg.transcriptType === 'final';
  if (!text || !role) return;
  const container = $('transcript');
  const placeholder = container.querySelector('.italic');
  if (placeholder) placeholder.remove();

  // Capture whether we were pinned to the bottom BEFORE the DOM mutation, so we
  // only auto-scroll if the user hadn't scrolled up to re-read earlier lines.
  const wasPinned = container.scrollHeight - container.scrollTop - container.clientHeight < 120;

  const lastPartial = container.querySelector(`.tr-partial[data-role="${role}"]`);
  if (lastPartial) {
    lastPartial.querySelector('.tr-text').textContent = text;
    if (isFinal) lastPartial.classList.remove('tr-partial');
  } else {
    container.appendChild(makeLine(role, text, isFinal));
  }

  // Only force scroll on final messages (not on every partial char). And only
  // if the user was pinned to the bottom already. This kills the micro-jumps
  // that come from re-scrolling on every keystroke-level partial update.
  if (wasPinned && (isFinal || !lastPartial)) {
    // use rAF so the write lands aligned with the browser paint cycle
    requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
  }
}

function makeLine(role, text, isFinal) {
  const el = document.createElement('div');
  el.className = 'transcript-line' + (isFinal ? '' : ' tr-partial');
  el.dataset.role = role;
  const speaker = role === 'user' ? 'caller' : 'agent';
  const color = role === 'user' ? '#F5F2ED' : '#F5B800';
  const textColor = role === 'user' ? 'rgba(245,242,237,0.92)' : 'rgba(245,242,237,0.86)';
  el.innerHTML =
    `<span class="mono text-xs uppercase tracking-widest mr-3" style="color:${color}">${speaker}</span>` +
    `<span class="tr-text" style="color:${textColor}">${esc(text)}</span>`;
  return el;
}

function clearToolPanel() {
  $('toolPanel').innerHTML = '';
  state.toolCalls.clear();
  state.bookedAppointment = null;
  state.collected = {};
}

function recordToolCall(id, name, args) {
  if (!name) return;
  if (state.toolCalls.has(id)) return; // dedupe
  const entry = { id, name, args, status: 'pending', result: null, fallbackTimer: null };
  state.toolCalls.set(id, entry);
  captureCollected(args);
  renderToolEntry(id, name, args);

  // Vapi does not always relay tool-call-results to the browser when tools use
  // server.url (our /api/vapi/tool). Auto-resolve the card after 4s so the UI
  // doesn't spin forever. The backend has already returned a result by then
  // (typical latency <1s). A real result event, if it arrives, will overwrite.
  entry.fallbackTimer = setTimeout(() => {
    const current = state.toolCalls.get(id);
    if (!current || current.status !== 'pending') return;
    finalizeToolCall(id, { ok: true, note: 'auto-resolved' });
  }, 4000);
}

function finalizeToolCall(id, result) {
  const call = state.toolCalls.get(id);
  if (!call) return;
  if (call.fallbackTimer) { clearTimeout(call.fallbackTimer); call.fallbackTimer = null; }
  call.status = 'success';
  call.result = result;
  if (call.name === 'book_appointment' && !hasError(result)) {
    state.bookedAppointment = { ...(call.args || {}), ...(typeof result === 'object' && result ? result : {}) };
  }
  updateToolEntry(id, 'success', result);
}

function finalizeLastByName(name, result) {
  // Legacy: find the most recent pending call with matching name
  let target = null;
  for (const call of state.toolCalls.values()) {
    if (call.name === name && call.status === 'pending') target = call;
  }
  if (!target) return;
  finalizeToolCall(target.id, result);
}

function captureCollected(args) {
  if (!args || typeof args !== 'object') return;
  const keys = ['customer_name', 'customer_phone', 'customer_email', 'address', 'zip', 'city', 'appointment_type', 'start_iso', 'notes'];
  for (const k of keys) {
    if (args[k]) state.collected[k] = args[k];
  }
}

function hasError(r) {
  if (!r) return false;
  if (typeof r === 'object') return Boolean(r.error);
  if (typeof r === 'string') return /error|fail/i.test(r);
  return false;
}

function renderToolEntry(id, name, args) {
  const panel = $('toolPanel');
  const placeholder = panel.querySelector('.italic');
  if (placeholder) placeholder.remove();
  const el = document.createElement('div');
  el.className = 'tool-entry fired';
  el.id = 't-' + cssId(id);
  el.innerHTML =
    '<div class="flex items-center justify-between">' +
      `<span class="font-medium" style="color:#F5B800">${esc(name)}</span>` +
      '<span class="status-pill" style="background:rgba(245,184,0,0.12); color:#F5B800"><span class="spinner"></span> running</span>' +
    '</div>' +
    `<pre class="mt-2 text-[12px] leading-5" style="color:rgba(245,242,237,0.75); white-space:pre-wrap; word-break:break-word">${esc(fmtArgs(args))}</pre>` +
    '<div class="t-result mt-2 text-[12px]" style="color:rgba(245,242,237,0.6);"></div>';
  panel.appendChild(el);
  panel.scrollTop = panel.scrollHeight;
}

function updateToolEntry(id, status, result) {
  const el = document.getElementById('t-' + cssId(id));
  if (!el) return;
  el.classList.remove('fired');
  el.classList.add(status === 'success' ? 'success' : 'failure');
  const pill = el.querySelector('.status-pill');
  if (pill) {
    if (status === 'success') {
      pill.style.background = 'rgba(78,195,123,0.12)';
      pill.style.color = '#4EC37B';
      pill.innerHTML = '✓ done';
    } else {
      pill.style.background = 'rgba(255,107,107,0.12)';
      pill.style.color = '#FF6B6B';
      pill.innerHTML = '✗ failed';
    }
  }
  const resEl = el.querySelector('.t-result');
  if (resEl) {
    resEl.style.color = 'rgba(245,242,237,0.85)';
    resEl.textContent = fmtResult(result);
  }
}

function cssId(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function fmtArgs(a) {
  if (a == null) return '';
  if (typeof a === 'string') return a;
  try { return JSON.stringify(a, null, 2); } catch { return String(a); }
}

function fmtResult(r) {
  if (r == null) return '';
  if (typeof r === 'string') return '→ ' + r;
  try { return '→ ' + JSON.stringify(r, null, 2); } catch { return String(r); }
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function startTimer() {
  state.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.callStartAt) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    $('callTimer').textContent = m + ':' + s;
  }, 250);
}

function stopTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function showPostCall() {
  const panel = $('postCall');
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Skeleton placeholder palette — Tailwind's animate-pulse on muted cream blocks.
const SKELETON_BG = 'background:rgba(9,58,62,0.08)';

function skelBar(width, height) {
  return `<div class="animate-pulse rounded" style="${SKELETON_BG};width:${width};height:${height}"></div>`;
}

function paintSkeletons() {
  // QA checks — 5 rows each with a round tick + two text bars
  const qa = $('qaChecks');
  if (qa) {
    qa.innerHTML = Array.from({ length: 5 }).map(() => `
      <div class="check-row">
        <div class="animate-pulse rounded-full" style="${SKELETON_BG};width:22px;height:22px;flex-shrink:0;margin-top:2px"></div>
        <div style="flex:1">
          ${skelBar('55%', '12px')}
          <div style="height:8px"></div>
          ${skelBar('82%', '10px')}
        </div>
      </div>
    `).join('');
  }

  // SMS to customer — sender line + two bubble-sized blocks
  const sms = $('smsCustomer');
  if (sms) {
    sms.innerHTML = `
      ${skelBar('180px', '10px')}
      <div style="height:10px"></div>
      <div class="animate-pulse" style="${SKELETON_BG};height:56px;border-radius:18px;max-width:260px"></div>
      <div class="animate-pulse" style="${SKELETON_BG};height:40px;border-radius:18px;max-width:220px;margin-top:8px"></div>
    `;
  }

  // Owner alert — avatar + lines
  const owner = $('ownerAlert');
  if (owner) {
    owner.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="animate-pulse" style="${SKELETON_BG};width:36px;height:36px;border-radius:8px;flex-shrink:0"></div>
        <div style="flex:1">
          ${skelBar('140px', '12px')}
          <div style="height:8px"></div>
          ${skelBar('88%', '14px')}
          <div style="height:6px"></div>
          ${skelBar('60%', '10px')}
        </div>
      </div>
    `;
  }

  // Calendar — top bar + a few lines
  const cal = $('calendarCard');
  if (cal) {
    cal.innerHTML = `
      <div class="animate-pulse" style="${SKELETON_BG};height:4px"></div>
      <div style="padding:20px">
        ${skelBar('100px', '10px')}
        <div style="height:10px"></div>
        ${skelBar('70%', '18px')}
        <div style="height:8px"></div>
        ${skelBar('50%', '12px')}
        <div style="height:14px"></div>
        ${skelBar('80%', '12px')}
      </div>
    `;
  }
}

async function runQA() {
  // Build transcript string from the DOM (one line per final transcript)
  const transcript = Array.from($('transcript').children)
    .filter((line) => !line.classList.contains('tr-partial'))
    .map((line) => {
      const role = line.dataset.role === 'user' ? 'caller' : 'agent';
      const text = line.querySelector('.tr-text')?.textContent || '';
      return role + ': ' + text;
    })
    .join('\n');
  const toolTrace = Array.from(state.toolCalls.values()).map((c) => ({
    name: c.name, args: c.args, result: c.result,
  }));

  // Skeletons already painted by paintSkeletons(); leave them up until the
  // real QA payload lands or we fall back to an error row.

  try {
    const res = await fetch('/api/vapi/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, toolTrace, collected: state.collected, booking: state.bookedAppointment }),
    });
    const data = await res.json();
    renderQA(data.checks || []);
    // The LLM normalizes the caller's details (accent-corrected address,
    // properly-cased name, formatted phone). Merge those into state before the
    // artifacts render for the first time.
    if (data.normalized && typeof data.normalized === 'object') {
      applyNormalized(data.normalized);
    }
    renderArtifacts();
  } catch (err) {
    console.error('QA failed', err);
    renderQA([{ label: 'QA unavailable', detail: 'Could not reach the QA service.', status: 'warn' }]);
    // Still render artifacts with whatever raw data we have, so skeletons
    // don't stay up forever when the QA backend is down.
    renderArtifacts();
  }
}

function applyNormalized(n) {
  // Overwrite the raw tool-collected values with the LLM-cleaned versions
  // only when a cleaned value is present; fall back to what we already had.
  const mapping = {
    name: 'customer_name',
    phone: 'customer_phone',
    address: 'address',
    zip: 'zip',
    appointment_type: 'appointment_type',
  };
  for (const [normKey, stateKey] of Object.entries(mapping)) {
    if (n[normKey]) state.collected[stateKey] = n[normKey];
  }
  // If a booking was made, update its stored copy too so the calendar card
  // picks up the cleaned address on re-render.
  if (state.bookedAppointment) {
    if (n.address) state.bookedAppointment.address = n.address;
    if (n.name) state.bookedAppointment.customer_name = n.name;
  }
}

function renderQA(checks) {
  const panel = $('qaChecks');
  panel.innerHTML = '';
  if (!checks.length) {
    panel.innerHTML = '<div class="text-muted text-sm">No checks ran. Transcript too short.</div>';
    return;
  }
  for (const c of checks) {
    const row = document.createElement('div');
    row.className = 'check-row';
    const status = c.status || 'pending';
    const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : status === 'warn' ? '!' : '…';
    row.innerHTML =
      `<div class="tick ${status}">${icon}</div>` +
      '<div>' +
        `<div class="font-medium text-glacier">${esc(c.label || '')}</div>` +
        (c.detail ? `<div class="text-sm text-muted">${esc(c.detail)}</div>` : '') +
      '</div>';
    panel.appendChild(row);
  }
}

function renderArtifacts() {
  const booking = state.bookedAppointment;
  const info = state.collected;
  const callback = Array.from(state.toolCalls.values()).find((c) => c.name === 'log_callback_request');
  const callerId = state.callerId || generateCallerId();
  // Fallback: if no tool call carried the phone/name, try to pull them out of
  // the transcript so artifacts match what the QA panel already shows.
  const fromTranscript = extractFromTranscript();
  const phoneFromTool = info.customer_phone || callback?.args?.customer_phone || null;
  const phone = phoneFromTool || fromTranscript.phone || callerId;
  const phoneIsVerified = Boolean(phoneFromTool || fromTranscript.phone);
  const name = info.customer_name || callback?.args?.customer_name || fromTranscript.name || null;
  const serviceTypeGuessed = inferServiceType();
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── SMS to customer ──────────────────────────────────────────────────────
  // Render a follow-up SMS whenever we have any indication of a phone number,
  // whether it came through a tool call or was just mentioned in the transcript.
  const smsEl = $('smsCustomer');
  const smsHeader = `<div class="text-[11px] text-muted mono mb-2">+1 (555) 012-0173 · Splendid Tile Roofing</div>`;
  const first = (name || 'there').split(' ')[0];
  if (booking && phoneIsVerified) {
    const time = formatApptTime(booking.start_iso || info.start_iso);
    const addr = info.address || booking.address || 'your address';
    smsEl.innerHTML = smsHeader +
      `<div class="sms-bubble inbound">Hi ${esc(first)} — confirming your free roof inspection at ${esc(addr)} on ${esc(time)}. Reply R to reschedule.</div>` +
      `<div class="sms-bubble inbound mt-2">We'll text you 30 min before arrival. Both homeowners present if possible.</div>`;
  } else if (callback && phoneIsVerified) {
    smsEl.innerHTML = smsHeader +
      `<div class="sms-bubble inbound">Hi ${esc(first)} — thanks for calling Splendid Tile Roofing. Someone from our team will reach out shortly.</div>`;
  } else if (phoneIsVerified) {
    // Caller shared a phone but call ended before booking / callback
    smsEl.innerHTML = smsHeader +
      `<div class="sms-bubble inbound">Hi ${esc(first)} — thanks for calling Splendid Tile Roofing. We have your details and a team member will follow up to finish scheduling your free inspection.</div>`;
  } else {
    smsEl.innerHTML = `<div class="text-[11px] text-muted mono">No phone number captured on this call — no customer SMS sent.</div>`;
  }

  // ── Owner alert ── always renders something so the CRM never has a blank row
  const ownerEl = $('ownerAlert');
  let title, body, badge;
  if (booking) {
    const time = formatApptTime(booking.start_iso || info.start_iso);
    const service = info.appointment_type || serviceTypeGuessed || 'inspection';
    const apptId = pickApptId(booking);
    title = '📞 <b>New lead booked</b>';
    body = `<div class="mt-1 text-glacier/90">${esc(name || 'Homeowner')} · ${esc(service)} · ${esc(time)}</div>`;
    badge = `APT-${apptId}`;
  } else if (callback) {
    title = '⚠️ <b>Callback requested</b>';
    body =
      `<div class="mt-1 text-glacier/90">${esc(name || 'Homeowner')} · ${esc(callback.args?.reason || 'unspecified')}</div>` +
      (callback.args?.notes ? `<div class="mt-1 text-muted text-[12px]">${esc(callback.args.notes)}</div>` : '');
    badge = 'CALLBACK';
  } else {
    // No booking, no callback — always log the inbound with whatever we can infer.
    title = '📞 <b>Inbound call — unresolved</b>';
    const reason = name
      ? `${esc(name)} called but didn't book or request a callback.`
      : `Caller did not leave a name or say why they called.`;
    const serviceNote = serviceTypeGuessed
      ? `Likely topic: ${esc(serviceTypeGuessed)}.`
      : `Topic not captured.`;
    body =
      `<div class="mt-1 text-glacier/90">${reason}</div>` +
      `<div class="mt-1 text-glacier/90">${serviceNote}</div>`;
    badge = 'REVIEW';
  }

  ownerEl.innerHTML =
    '<div class="flex items-start gap-3">' +
      '<div class="slack-avatar">S</div>' +
      '<div class="flex-1">' +
        '<div class="flex items-center gap-2">' +
          '<span class="font-semibold text-glacier">Sagan Agent</span>' +
          `<span class="mono text-[11px] text-muted">APP · ${nowTime}</span>` +
        '</div>' +
        `<div class="mt-1 text-glacier">${title}</div>` +
        body +
        `<div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-deep text-[11px] mono">${esc(badge)}</div>` +
      '</div>' +
    '</div>';

  // ── Calendar card ── only for confirmed bookings
  const calEl = $('calendarCard');
  if (booking) {
    const time = formatApptTime(booking.start_iso || info.start_iso);
    const calName = name || 'Homeowner';
    const addr = info.address || 'address on file';
    const apptId = pickApptId(booking);
    calEl.innerHTML =
      '<div class="cal-bar"></div>' +
      '<div class="p-5 text-sm">' +
        '<div class="mono text-[11px] text-muted mb-1">ROOFING · INSPECTION</div>' +
        `<div class="display text-lg text-glacier mb-1">${esc(calName)} · free inspection</div>` +
        `<div class="text-muted">${esc(time)}</div>` +
        `<div class="mt-3 text-sm text-glacier/80">📍 ${esc(addr)}</div>` +
        `<div class="mt-3 text-[11px] mono text-muted">APT-${apptId}</div>` +
      '</div>';
  } else {
    calEl.innerHTML =
      '<div class="cal-bar" style="background: rgba(9,58,62,0.1)"></div>' +
      '<div class="p-5 text-sm text-muted">No appointment booked on this call.</div>';
  }
}

function extractFromTranscript() {
  const lines = Array.from(document.querySelectorAll('#transcript .transcript-line'));
  const full = lines.map(l => l.querySelector('.tr-text')?.textContent || '').join(' ');
  const callerLines = lines.filter(l => l.dataset.role === 'user')
    .map(l => l.querySelector('.tr-text')?.textContent || '');

  // Phone: try canonical US patterns first, then fall back to any long digit run
  let phone = null;
  const canonical = full.match(/(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
  if (canonical) {
    phone = `+1 (${canonical[1]}) ${canonical[2]}-${canonical[3]}`;
  } else {
    // Loose: 7 or more digits, optionally separated — Deepgram sometimes runs them together
    const loose = full.match(/\b\d[\d\s-]{5,18}\d\b/);
    if (loose) {
      const digits = loose[0].replace(/\D/g, '');
      if (digits.length >= 7) phone = digits;
    }
  }

  // Name: heuristic — only the explicit "my name is X" / "this is X" patterns
  // because "I'm X" / "it's X" produces noise ("I'm trying to...", "it's fine"
  // etc.). Case-sensitive so the capital-letter requirement actually works.
  let name = null;
  const NAME_NOISE = /^(trying|going|looking|calling|just|only|really|actually|fine|good|great|here|there|that|this|the|a|an)$/i;
  for (const line of callerLines) {
    const m = line.match(/\b(?:[Mm]y name is|[Tt]his is)\s+([A-Z][a-zA-Z'-]{1,20}(?:\s+[A-Z][a-zA-Z'-]{1,20})?)/);
    if (m) {
      const candidate = m[1].replace(/\s+/g, ' ').trim();
      const firstWord = candidate.split(' ')[0];
      if (!NAME_NOISE.test(firstWord)) { name = candidate; break; }
    }
  }
  return { phone, name };
}

function inferServiceType() {
  // Look at tool args and transcript text for hints at what the caller wanted.
  const explicit = state.collected.appointment_type;
  if (explicit) return explicit;
  const transcriptLower = Array.from(document.querySelectorAll('#transcript .tr-text'))
    .map(el => (el.textContent || '').toLowerCase()).join(' ');
  const checks = [
    ['roof replacement', /\breplace(ment)?\b|\bnew roof\b/],
    ['roof repair', /\brepair\b|\bleak\b|\bleaking\b/],
    ['roof inspection', /\binspect/],
    ['storm damage', /\bstorm\b|\bhail\b|\bwind\b/],
    ['gutter work', /\bgutter/],
    ['siding', /\bsiding\b/],
    ['moss removal', /\bmoss\b/],
  ];
  for (const [label, re] of checks) {
    if (re.test(transcriptLower)) return label;
  }
  return null;
}

function pickApptId(booking) {
  const raw = booking?.appointment_id || booking?.id || booking?.confirmation_id;
  if (raw) return String(raw).slice(-4).padStart(4, '0');
  return String(Math.floor(1000 + Math.random() * 9000));
}

function formatApptTime(iso) {
  if (!iso) return 'a time we confirm';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return day + ' at ' + time;
  } catch { return iso; }
}

function setButtonLoading(loading) {
  const btn = $('demoToggle');
  const label = $('demoLabel');
  if (!btn || !label) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.loading = '1';
    btn.style.opacity = '0.75';
    btn.style.cursor = 'wait';
    label.innerHTML = '<span style="display:inline-flex;align-items:center;gap:10px"><span class="spinner" style="width:14px;height:14px;border-width:2px"></span>Connecting…</span>';
  } else {
    btn.disabled = false;
    delete btn.dataset.loading;
    btn.style.opacity = '';
    btn.style.cursor = '';
    label.textContent = state.inCall ? 'End call' : 'Start demo call';
  }
}

async function onDemoToggle() {
  if (!state.vapi) return;
  const btn = $('demoToggle');
  if (btn?.dataset?.loading === '1') return; // guard against double-click while connecting
  if (state.inCall) {
    setButtonLoading(true);
    try { await state.vapi.stop(); } catch (err) { console.error('stop failed', err); }
    return;
  }
  setButtonLoading(true);
  try {
    setStatus('connecting');
    await state.vapi.start(state.config.assistantId);
  } catch (err) {
    console.error('Failed to start call', err);
    setStatus('error');
    setButtonLoading(false);
    surfaceError(err);
  }
}

boot();
