/* M5: automatic PostHog website, product, and masked session-replay analytics. */
(() => {
  'use strict';
  const config = window.LOGIQ_M5_CONFIG || {};
  const host = String(config.posthogApiHost || '').trim();
  const token = String(config.posthogProjectToken || '').trim();
  const configured = config.liveSite && /^phc_[A-Za-z0-9_-]{8,}$/.test(token) &&
    /^https:\/\/(eu|us)\.i\.posthog\.com$/.test(host);
  const optOutKey = 'logiq_m5_tracking_disabled';
  // Keep the current page's choice even if storage becomes unavailable.
  let sessionOptOut = null;
  const control = document.getElementById('m5-tracking-toggle');
  const events = [];
  let initialized = false;
  let loading = false;
  const pageName = location.pathname.split('/').pop() || 'index.html';
  const pageType = (pageName === 'landing.html' || document.getElementById('m5-lead-form')) ? 'landing' :
    pageName === 'news.html' ? 'prototype' :
    pageName === 'm5-campaign.html' ? 'campaign' : 'fiki';

  const safeTag = (value, fallback) =>
    typeof value === 'string' && /^[a-zA-Z0-9_-]{1,50}$/.test(value) ? value : fallback;
  function preference() {
    if (sessionOptOut !== null) return sessionOptOut;
    let readable = false;
    for (const storage of ['localStorage', 'sessionStorage']) {
      try {
        const choice = window[storage].getItem(optOutKey);
        readable = true;
        if (choice === '1' || choice === '0') return choice === '1';
      } catch (_) { /* Try the other storage, else leave tracking off. */ }
    }
    return readable ? null : true;
  }
  const disabled = () => preference() === true;
  function updateControl() {
    if (!control) return;
    control.hidden = !configured;
    control.textContent = disabled() ? 'Enable analytics' : 'Disable analytics';
  }
  function capture(name, properties) {
    try { window.posthog.capture(name, properties); }
    catch (_) { console.warn('LogiQ: analytics event unavailable.'); }
  }
  function track(name, props = {}) {
    if (!configured || disabled()) return;
    const details = {...window.logiqM5Campaign, page_type: pageType, ...props};
    if (initialized && window.posthog?.capture) capture(name, details);
    else events.push([name, details]);
  }
  window.logiqM5Analytics = {track};

  function loadAnalytics() {
    if (!configured || disabled() || loading || initialized) return;
    loading = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
    script.onload = () => {
      if (!window.posthog?.init || disabled()) { loading = false; return; }
      window.posthog.init(token, {
        api_host: host,
        defaults: '2026-08-30',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        rageclick: true,
        disable_session_recording: false,
        persistence: 'localStorage+cookie',
        mask_all_element_attributes: true,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '.m5-signup-card',
          maskInputOptions: {password: true, email: true, text: true, textarea: true}
        }
      });
      initialized = true;
      loading = false;
      // The SDK can remember its own opt-out across reloads.
      if (sessionOptOut === false || (preference() === false && window.posthog.has_opted_out_capturing?.())) {
        window.posthog.opt_in_capturing?.();
      }
      track('logiq_page_viewed');
      if (pageType === 'landing') track('landing_page_viewed');
      if (pageType === 'prototype') track('prototype_page_viewed');
      for (const [name, properties] of events.splice(0)) capture(name, properties);
    };
    script.onerror = () => { loading = false; events.length = 0; };
    document.head.appendChild(script);
  }

  control?.addEventListener('click', () => {
    const shouldDisable = !disabled();
    sessionOptOut = shouldDisable;
    for (const storage of ['localStorage', 'sessionStorage']) {
      try { window[storage].setItem(optOutKey, shouldDisable ? '1' : '0'); }
      catch (_) { /* The current page's choice still applies. */ }
    }
    if (shouldDisable) {
      events.length = 0;
      if (initialized) {
        window.posthog.stopSessionRecording?.();
        window.posthog.opt_out_capturing?.();
      }
    } else if (initialized) {
      window.posthog.opt_in_capturing?.();
      window.posthog.startSessionRecording?.();
    } else loadAnalytics();
    updateControl();
  });
  updateControl();
  // Custom events supplement PostHog's automatic clicks, changes, and submissions.
  document.querySelectorAll('[data-m5-track]').forEach(link => link.addEventListener('click', () => {
    track(pageType === 'prototype' ? 'prototype_cta_clicked' : 'landing_cta_clicked', {destination: safeTag(link.dataset.m5Track, 'other')});
  }));
  const signup = document.getElementById('early-access');
  if (signup) {
    let viewed = false;
    let observer;
    const markViewed = () => {
      if (viewed || disabled()) return;
      viewed = true;
      track('lead_form_viewed');
      observer?.disconnect();
    };
    signup.addEventListener('focus', markViewed, true);
    signup.addEventListener('submit', markViewed, true);
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) markViewed();
      });
      observer.observe(signup);
    }
  }
  loadAnalytics();
})();
