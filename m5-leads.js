/* M5: static-site lead collection. No email data is sent to analytics. */
(() => {
  'use strict';
  const form = document.getElementById('m5-lead-form');
  if (!form) return;
  const email = document.getElementById('m5-email');
  const consent = document.getElementById('m5-email-consent');
  const submit = document.getElementById('m5-submit');
  const status = document.getElementById('m5-form-status');
  const settings = window.LOGIQ_M5_CONFIG || {};
  const endpoint = String(settings.formspreeEndpoint || '').trim();
  const configured = settings.liveSite && /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]{6,}$/.test(endpoint);
  let finished = false;
  let started = false;

  for (const [property, value] of Object.entries(window.logiqM5Campaign || {})) {
    const input = form.elements.namedItem(property);
    if (input) input.value = value;
  }
  function track(name, extra={}) {
    window.logiqM5Analytics?.track(name, extra);
  }
  function showStatus(message, error=false) {
    status.textContent = message;
    status.classList.toggle('is-error', error);
  }
  submit.disabled = !configured;
  if (!configured) {
    submit.setAttribute('aria-disabled', 'true');
    showStatus(settings.liveSite ? 'Signups are unavailable. Please try again later.' :
      'Preview only. Use the published LogiQ landing page to join the list.');
  }
  function noteStart() {
    if (!started) { started = true; track('lead_form_started'); }
  }
  email.addEventListener('focus', noteStart, {once:true});
  consent.addEventListener('change', noteStart, {once:true});
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!configured || finished || submit.disabled) return;
    if (!email.checkValidity()) {
      showStatus('Please enter a valid email address.', true); email.focus(); return;
    }
    if (!consent.checked) {
      showStatus('Please confirm that you want to receive LogiQ updates.', true); consent.focus(); return;
    }
    if (document.getElementById('m5-website').value) return; // honeypot
    track('lead_signup_attempt');
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    showStatus('Joining the list…');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: {Accept: 'application/json'}
      });
      if (!response.ok) throw new Error('Formspree rejected the submission');
      finished = true;
      track('lead_signup_success');
      form.reset();
      showStatus('You’re on the list. Thanks for joining us!');
      submit.textContent = 'Signed up ✓';
    } catch (_) {
      track('lead_signup_failed');
      showStatus('We couldn’t save your signup. Please try again in a moment.', true);
      submit.disabled = false;
    } finally {
      submit.removeAttribute('aria-busy');
    }
  });
})();
