declare global {
  interface Window {
    _paq?: any[];
  }
}

const MATOMO_URL = import.meta.env.VITE_MATOMO_URL;
const MATOMO_SITE_ID = import.meta.env.VITE_MATOMO_SITE_ID;
const MATOMO_ENABLED = import.meta.env.VITE_MATOMO_ENABLED === 'true';

export function initMatomo() {
  if (!MATOMO_ENABLED || !MATOMO_URL || !MATOMO_SITE_ID) return;
  if (window._paq) return;

  window._paq = window._paq || [];

  window._paq.push(['enableLinkTracking']);
  window._paq.push(['setTrackerUrl', `${MATOMO_URL}matomo.php`]);
  window._paq.push(['setSiteId', MATOMO_SITE_ID]);

  const script = document.createElement('script');
  script.async = true;
  script.src = `${MATOMO_URL}matomo.js`;
  document.head.appendChild(script);
}

export function trackPageView(path: string, title?: string) {
  if (!window._paq) return;

  window._paq.push(['setCustomUrl', path]);
  window._paq.push(['setDocumentTitle', title || document.title]);
  window._paq.push(['trackPageView']);
}

export function trackEvent(category: string, action: string, name?: string, value?: number) {
  if (!window._paq) return;

  window._paq.push(['trackEvent', category, action, name, value]);
}

export function setUserId(userId?: string | null) {
  if (!window._paq || !userId) return;

  window._paq.push(['setUserId', userId]);
}

export function resetUserId() {
  if (!window._paq) return;

  window._paq.push(['resetUserId']);
}
