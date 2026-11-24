/* Keep the same campaign on signup and analytics, including a same-tab visit to the demo. */
(() => {
  'use strict';
  const fields = [
    ['utm_source', 'campaign_source', 'direct'],
    ['utm_medium', 'campaign_medium', 'none'],
    ['utm_campaign', 'campaign_name', 'm5_validation_2'],
    ['utm_content', 'campaign_content', 'default']
  ];
  const valid = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,50}$/.test(value);
  const query = new URLSearchParams(location.search);
  const tagged = valid(query.get('utm_source'));
  const key = 'logiq_m5_campaign_v2';
  let stored = {};
  if (!tagged) {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const previous = JSON.parse(cached);
        if (previous && valid(previous.campaign_source)) stored = previous;
      } else {
        for (const [parameter, property] of fields) {
          stored[property] = sessionStorage.getItem('logiq_' + parameter);
        }
        if (!valid(stored.campaign_source)) stored = {};
      }
    } catch (_) { /* No trustworthy prior visit is available. */ }
  }
  const campaign = {};
  for (const [parameter, property, fallback] of fields) {
    const value = tagged ? query.get(parameter) : stored[property];
    campaign[property] = valid(value) ? value : fallback;
  }
  if (tagged) {
    try { sessionStorage.setItem(key, JSON.stringify(campaign)); }
    catch (_) { /* The incoming tags still apply on this page. */ }
  }
  window.logiqM5Campaign = Object.freeze(campaign);
  // Preserve the tagged demo round trip even when the browser disallows storage.
  if (campaign.campaign_source !== 'direct') {
    for (const link of document.querySelectorAll('a[data-m5-track]')) {
      const target = new URL(link.href);
      if (target.origin !== location.origin || target.pathname === location.pathname) continue;
      if (!/\/(?:news|landing)\.html$/.test(target.pathname)) continue;
      for (const [parameter, property] of fields) target.searchParams.set(parameter, campaign[property]);
      link.href = target.href;
    }
  }
})();
