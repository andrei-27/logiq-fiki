/* Public, client-side configuration. These values are publishable, not private API secrets. */
window.LOGIQ_M5_CONFIG = Object.freeze({
  liveSite: location.origin === 'https://andrei-27.github.io' && location.pathname.startsWith('/logiq-fiki/'),
  // Formspree's public submission endpoint for the LogiQ early-access form.
  formspreeEndpoint: 'https://formspree.io/f/mqpqwgvp',
  // PostHog's public, client-side project token (NEVER use a personal API key).
  posthogProjectToken: 'phc_seKyUpFLkHxm9qXN9gK6ETWqMuqkKaXtFCVXJNTRmjVE',
  // The connected PostHog project is hosted in the EU region.
  posthogApiHost: 'https://eu.i.posthog.com'
});
