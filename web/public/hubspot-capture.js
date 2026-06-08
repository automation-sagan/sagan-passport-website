/**
 * ═══════════════════════════════════════════════════════════════
 *  SAGAN PASSPORT — HubSpot Universal Form Capture Script
 *  Version: 2.0
 * ───────────────────────────────────────────────────────────────
 *  HOW TO USE:
 *  1. Add this ONE script tag to any page, just before </body>:
 *
 *     <script
 *       src="hubspot-capture.js"
 *       data-portal-id="50517161"
 *       data-form-guid="daac2804-e5c3-48e7-8ab7-a5b41c9e7c38"
 *       data-region="na1"
 *     ></script>
 *
 *  2. Optionally override field mappings per-page:
 *     data-field-map='{"my_field":"hubspot_internal_name"}'
 *
 *  3. That's it. Works on ANY page, ANY form structure.
 * ═══════════════════════════════════════════════════════════════
 */





(function () {
  'use strict';

  // ── 1. READ CONFIG FROM SCRIPT TAG ATTRIBUTES ─────────────────
  // Supports both inline config (window.HS_CAPTURE_CONFIG) and
  // data attributes on the <script> tag itself — whichever you prefer.
  var scriptEl = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  var PORTAL_ID = (scriptEl && scriptEl.getAttribute('data-portal-id')) ||
                  (window.HS_CAPTURE_CONFIG && window.HS_CAPTURE_CONFIG.portalId) ||
                  '50517161';

  var FORM_GUID = (scriptEl && scriptEl.getAttribute('data-form-guid')) ||
                  (window.HS_CAPTURE_CONFIG && window.HS_CAPTURE_CONFIG.formGuid) ||
                  'daac2804-e5c3-48e7-8ab7-a5b41c9e7c38';

  // Optional Make.com webhook — fires a parallel POST on every submission.
  // Body shape: { "submission": { submittedAt, pageUrl, pageTitle, ...fields } }
  // — all keys flat, only the fields the user actually filled in are included.
  // Override per page with data-make-webhook="https://hook.us2.make.com/...".
  // Set to '' (empty string) to disable.
  var MAKE_WEBHOOK_URL = (scriptEl && scriptEl.getAttribute('data-make-webhook')) ||
                         (window.HS_CAPTURE_CONFIG && window.HS_CAPTURE_CONFIG.makeWebhook) ||
                         'https://hook.us2.make.com/2ccpsjqsst3arigocljg0trvlx7reu1n';

  // Optional lead-magnet slug. When set, the form submission also POSTs to
  // /api/send-guide which emails the matching PDF via Resend. Set per page
  // with data-guide-slug="delegation" | "compensation" | "hiring".
  var GUIDE_SLUG = (scriptEl && scriptEl.getAttribute('data-guide-slug')) ||
                   (window.HS_CAPTURE_CONFIG && window.HS_CAPTURE_CONFIG.guideSlug) ||
                   '';
  var SEND_GUIDE_ENDPOINT = (scriptEl && scriptEl.getAttribute('data-send-guide-endpoint')) ||
                            '/api/send-guide';

  // Per-page field map overrides via data-field-map='{"key":"value"}'
  var extraMap  = {};
  try {
    var raw = scriptEl && scriptEl.getAttribute('data-field-map');
    if (raw) extraMap = JSON.parse(raw);
  } catch (e) {}


  // ── 2. FIELD MAP: input name/id → HubSpot contact property ───
  // Standard HubSpot contact properties (internal names)
  var FIELD_MAP = Object.assign({
    // Names
    'firstname':             'firstname',
    'first_name':            'firstname',
    'fname':                 'firstname',
    'lastname':              'lastname',
    'last_name':             'lastname',
    'lname':                 'lastname',
    'fullname':              'full_name',
    'full_name':             'full_name',
    'name':                  'full_name',

    // Contact
    'email':                 'email',
    'email_address':         'email',
    'phone':                 'phone',
    'phone_number':          'phone',
    'mobilephone':           'phone',
    'mobile':                'phone',
    'mobile_phone':          'phone',

    // Company
    'company':               'company',
    'company_name':          'company',
    'organization':          'company',
    'jobtitle':              'jobtitle',
    'job_title':             'jobtitle',
    'title':                 'jobtitle',
    'role':                  'jobtitle',
    'website':               'website',
    'company_size':          'numberofemployees',
    'employees':             'numberofemployees',
    'industry':              'industry',

    // Location
    'city':                  'city',
    'state':                 'state',
    'country':               'country',
    'zip':                   'zip',
    'postal_code':           'zip',

    // UTM parameters — each maps to its own HubSpot contact property
    'utm_source':            'utm_source',
    'utm_medium':            'utm_medium',
    'utm_campaign':          'utm_campaign',
    'utm_content':           'utm_content',
    'utm_term':              'utm_term',

    // Custom Sagan fields
    'how_did_you_hear':      'how_did_you_hear',
    'biggest_challenge':     'biggest_challenge__c',
    'message':               'message',
    'notes':                 'message',
  }, extraMap); // per-page overrides win


  // ── 3. UTM CAPTURE ────────────────────────────────────────────
  function captureUTMs() {
    var params = new URLSearchParams(window.location.search);
    var utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id'];
    var found = {};
    utmKeys.forEach(function (k) {
      var v = params.get(k);
      if (v) found[k] = v;
    });

    // Persist UTMs in sessionStorage — survives multi-page journeys
    // (e.g. user lands on /blog with UTMs, then fills form on /guides)
    if (Object.keys(found).length > 0) {
      try { sessionStorage.setItem('_sg_utms', JSON.stringify(found)); } catch (e) {}
    }

    // Always read back from storage (so we get them even on pages without UTMs)
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem('_sg_utms') || '{}'); } catch (e) {}

    // URL params take precedence over stored
    return Object.assign({}, stored, found);
  }

  // ── 4. HARVEST ALL FORM FIELDS ───────────────────────────────
  // Works on standard forms, multi-step forms, and custom UIs
  function harvestFields(root) {
    var raw = {};
    var els = (root || document).querySelectorAll('input, select, textarea');
    els.forEach(function (el) {
      var key = (el.name || el.id || '').trim().toLowerCase();
      if (!key) return;
      // Skip non-data inputs
      var skipTypes = ['submit','button','reset','image','file'];
      if (skipTypes.indexOf(el.type) !== -1) return;

      if (el.type === 'checkbox') {
        raw[key] = el.checked ? 'true' : 'false';
        return;
      }
      if (el.type === 'radio') {
        if (el.checked) raw[key] = el.value;
        return;
      }
      var val = String(el.value || '').trim();
      if (val) raw[key] = val;
    });
    return raw;
  }

  function buildHSFields(raw) {
    var out = [];
    var seen = {}; // avoid duplicate HubSpot field names
    Object.keys(raw).forEach(function (k) {
      var hsName = FIELD_MAP[k] || k; // unknown fields sent as-is
      if (seen[hsName]) return;
      seen[hsName] = true;
      out.push({ name: hsName, value: raw[k] });
    });
    return out;
  }


  // ── 5. SEND TO MAKE WEBHOOK + HUBSPOT FORMS API ──────────────
  // Per-page-load guard: once a form has fired sendToHubSpot successfully,
  // never fire again for the same form on this page load. Replaces the old
  // 1s time-based debounce, which was way too short — users with no UI
  // feedback would click 3-5 times over ~10s and every click went through,
  // producing duplicate Resend emails and Make webhook fires.
  var submittedForms = new WeakSet();
  // Fallback flag for MutationObserver path / hsCaptureNow(document) calls,
  // where there's no specific form element to track in the WeakSet.
  var globalSubmitted = false;

  function markFormSubmitted(form) {
    globalSubmitted = true;
    if (form && form.nodeType === 1 && form.tagName === 'FORM') {
      submittedForms.add(form);
      // Disable every submit control on the form so the user physically
      // cannot click again while the fetch is in flight.
      var submits = form.querySelectorAll(
        'button[type="submit"], input[type="submit"], button:not([type])'
      );
      submits.forEach(function (btn) {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
      });
      form.setAttribute('data-submitted', 'true');
    }
  }

  function alreadySubmitted(form) {
    if (form && form.nodeType === 1 && form.tagName === 'FORM') {
      return submittedForms.has(form) || form.getAttribute('data-submitted') === 'true';
    }
    return globalSubmitted;
  }

  // Roll back the submitted state so the user can retry after a failed send.
  // Called from the HubSpot fetch's error branches; we don't roll back on
  // network errors to Make/Resend because those are fire-and-forget anyway.
  function unmarkFormSubmitted(form) {
    globalSubmitted = false;
    if (form && form.nodeType === 1 && form.tagName === 'FORM') {
      submittedForms.delete(form);
      form.removeAttribute('data-submitted');
      var submits = form.querySelectorAll(
        'button[type="submit"], input[type="submit"], button:not([type])'
      );
      submits.forEach(function (btn) {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      });
    }
  }

  // Fire-and-forget POST to a Make.com scenario. The body is one flat
  // object under "submission":
  //   - submittedAt / pageUrl / pageTitle: page context (always present)
  //   - every form field the user filled in is spread in at the top level
  //     using its input name/id as the key (email, phone, company, ...).
  // The fields are dynamic per page — whatever the form on the current page
  // contains is what gets sent. No nesting, no empty placeholders.
  function sendToMake(raw) {
    if (!MAKE_WEBHOOK_URL) return;

    // Merge: page context first, then user-submitted fields on top.
    // raw = { email, phone, company, ... } — keyed by input name/id.
    var submission = Object.assign(
      {
        submittedAt: new Date().toISOString(),
        pageUrl: window.location.href,
        pageTitle: document.title
      },
      raw
    );

    var payload = { submission: submission };

    console.log('[Make Webhook] Sending to ' + MAKE_WEBHOOK_URL, payload);

    fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .then(function (res) {
      if (res.ok) {
        console.log('[Make Webhook] ✅ Success');
        document.dispatchEvent(new CustomEvent('makeWebhook:success', {
          detail: { payload: payload }
        }));
      } else {
        console.warn('[Make Webhook] ❌ Status ' + res.status);
        document.dispatchEvent(new CustomEvent('makeWebhook:error', {
          detail: { payload: payload, status: res.status }
        }));
      }
    })
    .catch(function (err) {
      console.warn('[Make Webhook] Network error:', err);
      document.dispatchEvent(new CustomEvent('makeWebhook:error', {
        detail: { payload: payload, error: err }
      }));
    });
  }

  // Mirror of EMAIL_RE in api/send-guide.js — keep the two regexes identical
  // so client and server agree on what "valid" means.
  var EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Fire-and-forget POST to /api/send-guide. The function reads the matching
  // PDF from api/_assets/ and sends it through Resend as an attachment.
  //
  // SAFETY: This is a strict no-op unless data-guide-slug is set on the
  // script tag. The only pages with that attribute are the 3 guide pages
  // (delegation, compensation, hiring). Every other page that loads
  // hubspot-capture.js (vs/*, agent/*, agency-referrals, events/*) bails
  // here on the first line and behaves exactly as before.
  function sendGuide(raw) {
    if (!GUIDE_SLUG) return;

    var email = (raw && raw.email ? String(raw.email) : '').trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      console.warn('[Send Guide] skipped — invalid email:', email);
      return;
    }

    var payload = { email: email, guide: GUIDE_SLUG };
    console.log('[Send Guide] →', SEND_GUIDE_ENDPOINT, payload);

    fetch(SEND_GUIDE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    })
    .then(function (r) {
      if (r.ok) {
        console.log('[Send Guide] ✅ queued', r.data);
        document.dispatchEvent(new CustomEvent('sendGuide:success', {
          detail: { payload: payload, data: r.data }
        }));
      } else {
        console.warn('[Send Guide] ❌ ' + r.status, r.data);
        document.dispatchEvent(new CustomEvent('sendGuide:error', {
          detail: { payload: payload, status: r.status, data: r.data }
        }));
      }
    })
    .catch(function (err) {
      console.warn('[Send Guide] Network error:', err);
      document.dispatchEvent(new CustomEvent('sendGuide:error', {
        detail: { payload: payload, error: err }
      }));
    });
  }

  function sendToHubSpot(form) {
    if (alreadySubmitted(form)) {
      console.log('[HubSpot Capture] ignoring duplicate submit — already sent for this form on this page load');
      return;
    }
    // Mark BEFORE the fetch so even a 2nd synchronous submit (e.g. fast
    // double-click before this function returns) is blocked.
    markFormSubmitted(form);

    var now = Date.now();

    // Harvest form fields
    var raw = harvestFields(form);

    // Inject UTMs into the payload — each UTM as its own HubSpot field
    var utms = captureUTMs();
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function (k) {
      if (utms[k] && !raw[k]) raw[k] = utms[k];
    });

    // Fire Make webhook in parallel — same submitted fields + UTMs + page context
    sendToMake(raw);

    // Fire Resend lead-magnet email in parallel (no-op if no guide slug set)
    sendGuide(raw);

    var fields = buildHSFields(raw);
    if (!fields.length) {
      console.warn('[HubSpot Capture] No fields found to send.');
      return;
    }

    var payload = {
      submittedAt: now.toString(),
      fields: fields,
      context: {
        pageUri:  window.location.href,
        pageName: document.title
      }
    };

    var endpoint = 'https://api.hsforms.com/submissions/v3/integration/submit/'
                   + PORTAL_ID + '/' + FORM_GUID;

    console.log('[HubSpot Capture] Sending to portal ' + PORTAL_ID, payload);

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    })
    .then(function (r) {
      if (r.ok) {
        console.log('[HubSpot Capture] ✅ Success!', r.data);
        document.dispatchEvent(new CustomEvent('hsCapture:success', {
          detail: { form: form, data: r.data }
        }));
      } else {
        console.error('[HubSpot Capture] ❌ Error ' + r.status + ':', r.data);
        if (r.status === 400) console.warn('→ Check that field internal names match HubSpot contact properties.');
        if (r.status === 404) console.warn('→ Check PORTAL_ID and FORM_GUID are correct.');
        unmarkFormSubmitted(form);
        document.dispatchEvent(new CustomEvent('hsCapture:error', {
          detail: { form: form, status: r.status, data: r.data }
        }));
      }
    })
    .catch(function (err) {
      console.error('[HubSpot Capture] Network error:', err);
      unmarkFormSubmitted(form);
      document.dispatchEvent(new CustomEvent('hsCapture:error', {
        detail: { form: form, error: err }
      }));
    });
  }


  // ── 6. INTERCEPT FORM SUBMISSIONS ────────────────────────────
  // Handles: standard <form> submits, custom JS-driven submit
  // handlers, and HubSpot embedded forms.

  // A) Standard form submit — preventDefault so the page doesn't
  //    navigate, validate natively, then post to HubSpot.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;

    // Native HTML5 validation (required, type=email, etc.)
    if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
      if (typeof form.reportValidity === 'function') form.reportValidity();
      return; // don't send invalid data
    }

    e.preventDefault();
    sendToHubSpot(form);
  }, true); // capture phase = fires before any stopPropagation

  // C) HubSpot embedded form (hbspt.forms.create) — fires its own
  //    onFormSubmit callback which we hook via a MutationObserver
  //    watching for the ".hs-form-iframe" thank-you state.
  var hsFormObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        // HubSpot renders a <div class="submitted-message"> on success
        if (node.classList && node.classList.contains('submitted-message')) {
          sendToHubSpot(node.closest('form') || document);
        }
      });
    });
  });
  hsFormObserver.observe(document.body, { childList: true, subtree: true });


  // ── 7. PRE-FILL UTMs INTO HIDDEN INPUTS (if they exist on page) ──
  // Pages can have <input type="hidden" name="utm_source"> etc.
  // We fill them automatically on load so they submit natively too.
  function prefillHiddenInputs() {
    var utms = captureUTMs();
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function (k) {
      if (!utms[k]) return;
      var el = document.querySelector('[name="' + k + '"], [id="' + k + '"]');
      if (el && !el.value) el.value = utms[k];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prefillHiddenInputs);
  } else {
    prefillHiddenInputs();
  }

  // Expose for manual use if needed: window.hsCaptureNow()
  window.hsCaptureNow = function (formEl) {
    sendToHubSpot(formEl || document);
  };

  console.log('[HubSpot Capture] Loaded — Portal: ' + PORTAL_ID + ' | Form: ' + FORM_GUID);

})();
