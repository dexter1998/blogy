import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID =
  (typeof window !== 'undefined' && window.__BLOGY_ENV__?.NEXT_PUBLIC_GA_ID) ||
  process.env.REACT_APP_GA_ID ||
  process.env.NEXT_PUBLIC_GA_ID ||
  '';

const PAGE_TYPE_BY_PATH = [
  { match: /^\/startup-name-generator(?:\/|$)/, pageType: 'blog' },
  { match: /^\/startup-names(?:\/|$)/, pageType: 'blog' },
];

const routeEventState = {
  loaded: false,
  scriptLoading: false,
  pagehideAttached: false,
};

const onceEvents = new Set();

function getCurrentPath() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}`;
}

function getPageType(path = getCurrentPath()) {
  const pathname = path.split('?')[0];
  const matched = PAGE_TYPE_BY_PATH.find((item) => item.match.test(pathname));
  return matched ? matched.pageType : 'landing';
}

function getSource(explicitSource) {
  if (explicitSource) return explicitSource;
  if (typeof window === 'undefined') return undefined;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');

  if (utmSource) return utmSource;
  return undefined;
}

function isLocalhost() {
  if (typeof window === 'undefined') return true;
  const { hostname } = window.location;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function isDebugEnabled() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('analytics_debug') === '1') {
    window.localStorage.setItem('analytics_debug', '1');
    return true;
  }

  return window.localStorage.getItem('analytics_debug') === '1';
}

function canTrack() {
  return Boolean(GA_ID) && (!isLocalhost() || isDebugEnabled());
}

function ensureDataLayer() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
}

function loadAnalytics() {
  if (!canTrack() || typeof document === 'undefined') return false;

  ensureDataLayer();

  if (!routeEventState.loaded) {
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: false,
    });
    routeEventState.loaded = true;
  }

  if (document.querySelector(`script[data-ga-id="${GA_ID}"]`)) {
    return true;
  }

  if (!routeEventState.scriptLoading) {
    routeEventState.scriptLoading = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.dataset.gaId = GA_ID;
    script.onload = () => {
      routeEventState.scriptLoading = false;
    };
    script.onerror = () => {
      routeEventState.scriptLoading = false;
    };
    document.head.appendChild(script);
  }

  return true;
}

export function trackEvent(eventName, params = {}, options = {}) {
  if (!loadAnalytics()) return false;

  const pagePath = params.page_path || getCurrentPath();
  const source = getSource(params.source);
  const payload = {
    page_path: pagePath,
    page_type: params.page_type || getPageType(pagePath),
    ...params,
  };

  if (source) {
    payload.source = source;
  } else {
    delete payload.source;
  }

  const onceKey = options.onceKey;
  if (onceKey && onceEvents.has(onceKey)) return false;
  if (onceKey) onceEvents.add(onceKey);

  window.gtag('event', eventName, payload);
  return true;
}

export function trackPageView(path = getCurrentPath()) {
  const pagePath = typeof path === 'string' ? path : getCurrentPath();
  const pageType = getPageType(pagePath);

  trackEvent(
    'page_view',
    {
      page_path: pagePath,
      page_type: pageType,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    },
    { onceKey: `page_view:${pagePath}` }
  );

  if (pageType === 'blog') {
    trackEvent(
      'blog_view',
      {
        page_path: pagePath,
        page_type: pageType,
      },
      { onceKey: `blog_view:${pagePath}` }
    );
  }
}

function isInternalLink(anchor) {
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  if (href.startsWith('#') || href.startsWith('/')) return true;

  try {
    const url = new URL(anchor.href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function getLinkSource(anchor) {
  if (anchor.dataset.analyticsSource) return anchor.dataset.analyticsSource;

  const text = anchor.textContent?.trim().replace(/\s+/g, ' ');
  if (text) return text.toLowerCase().slice(0, 80);

  return undefined;
}

function attachGlobalListeners() {
  if (typeof document === 'undefined') return () => {};

  const handleClick = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const analyticsNode = target.closest('[data-analytics-event]');
    if (analyticsNode instanceof HTMLElement) {
      const eventNames = analyticsNode.dataset.analyticsEvent
        ?.split(',')
        .map((name) => name.trim())
        .filter(Boolean);

      if (eventNames?.length) {
        eventNames.forEach((eventName) => {
          trackEvent(eventName, {
            source: analyticsNode.dataset.analyticsSource,
          });
        });
      }
    }

    const anchor = target.closest('a');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (!isInternalLink(anchor)) return;
    if (analyticsNode) return;

    trackEvent('internal_link_click', {
      source: getLinkSource(anchor),
      destination_path: anchor.getAttribute('href') || anchor.pathname,
    });
  };

  const handleFormStart = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (!target.matches('input, textarea, select')) return;

    const source =
      target.getAttribute('name') ||
      target.getAttribute('id') ||
      target.getAttribute('placeholder') ||
      'form_field';

    trackEvent(
      'form_start',
      { source },
      { onceKey: `form_start:${getCurrentPath()}` }
    );
  };

  document.addEventListener('click', handleClick, true);
  document.addEventListener('focusin', handleFormStart, true);
  document.addEventListener('input', handleFormStart, true);

  return () => {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('focusin', handleFormStart, true);
    document.removeEventListener('input', handleFormStart, true);
  };
}

function attachPagehideListener() {
  if (routeEventState.pagehideAttached || typeof window === 'undefined') return;

  const emitExit = () => {
    trackEvent(
      'page_exit',
      { source: 'pagehide' },
      { onceKey: `page_exit:${getCurrentPath()}` }
    );
  };

  window.addEventListener('pagehide', emitExit);
  routeEventState.pagehideAttached = true;
}

export function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    loadAnalytics();
    attachPagehideListener();
    return attachGlobalListeners();
  }, []);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`;
    trackPageView(pagePath);

    let timeoutId = window.setTimeout(() => {
      trackEvent(
        'time_30s',
        { source: 'time_on_page' },
        { onceKey: `time_30s:${pagePath}` }
      );
    }, 30000);

    let scrollTicking = false;
    let saw50 = false;
    let saw75 = false;

    const handleScroll = () => {
      if (scrollTicking) return;
      scrollTicking = true;

      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight - viewportHeight;
        const progress = docHeight <= 0 ? 100 : (scrollTop / docHeight) * 100;

        if (!saw50 && progress >= 50) {
          saw50 = true;
          trackEvent(
            'scroll_50',
            { source: 'scroll_depth' },
            { onceKey: `scroll_50:${pagePath}` }
          );
        }

        if (!saw75 && progress >= 75) {
          saw75 = true;
          trackEvent(
            'scroll_75',
            { source: 'scroll_depth' },
            { onceKey: `scroll_75:${pagePath}` }
          );
        }

        scrollTicking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      trackEvent(
        'page_exit',
        { page_path: pagePath, source: 'route_change' },
        { onceKey: `page_exit:${pagePath}` }
      );
    };
  }, [location.pathname, location.search]);

  return null;
}

