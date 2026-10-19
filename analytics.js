(function () {
  var gaMeasurementId = 'G-XZ3M0DQJ6M';
  var consentKey = 'usd8.analyticsConsent';
  var bannerId = 'usd8-analytics-consent';
  var analyticsScriptId = 'usd8-google-analytics';
  var returnFocusTo = null;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  function readConsent() {
    try {
      var value = window.localStorage.getItem(consentKey);
      return value === 'accepted' || value === 'rejected' ? value : '';
    } catch (_) {
      return '';
    }
  }

  function writeConsent(value) {
    try { window.localStorage.setItem(consentKey, value); } catch (_) { /* Storage may be blocked. */ }
  }

  function removeBanner() {
    document.getElementById(bannerId)?.remove();
  }

  function privacyUrl() {
    return window.location.pathname.includes('/docs/')
      ? 'legal.html#privacy'
      : './docs/legal.html#privacy';
  }

  function loadAnalytics() {
    window['ga-disable-' + gaMeasurementId] = false;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    if (document.getElementById(analyticsScriptId)) return;

    var script = document.createElement('script');
    script.id = analyticsScriptId;
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaMeasurementId;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', gaMeasurementId);
  }

  function clearAnalyticsCookies() {
    var hostname = window.location.hostname;
    var domains = [''];
    if (hostname && hostname !== 'localhost') {
      domains.push(hostname, '.' + hostname);
      var labels = hostname.split('.');
      if (labels.length > 1) domains.push('.' + labels.slice(-2).join('.'));
    }
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';

    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      domains.forEach(function (domain) {
        var domainAttribute = domain ? '; domain=' + domain : '';
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/' + domainAttribute + secure;
      });
    });
  }

  function disableAnalytics() {
    window['ga-disable-' + gaMeasurementId] = true;
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
    clearAnalyticsCookies();
  }

  function choose(value) {
    var focusTarget = returnFocusTo;
    returnFocusTo = null;
    writeConsent(value);
    if (value === 'accepted') loadAnalytics();
    else disableAnalytics();
    removeBanner();
    if (focusTarget?.isConnected) focusTarget.focus();
  }

  function openPreferences(trigger) {
    if (!document.body) return;
    var existingBanner = document.getElementById(bannerId);
    if (existingBanner) {
      if (trigger?.isConnected) returnFocusTo = trigger;
      existingBanner.querySelector('[data-analytics-reject]')?.focus();
      return;
    }
    returnFocusTo = trigger?.isConnected ? trigger : null;

    var banner = document.createElement('aside');
    banner.id = bannerId;
    banner.className = 'analytics-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie and analytics preferences');
    banner.setAttribute('aria-live', 'polite');

    var copy = document.createElement('div');
    copy.className = 'analytics-consent-copy';
    var title = document.createElement('strong');
    title.textContent = 'Cookie & Analytics Preferences';
    var message = document.createElement('p');
    message.textContent = 'USD8 uses optional Google Analytics cookies to understand aggregate site usage. We only load analytics after you accept. Rejecting does not affect the app.';
    var privacy = document.createElement('a');
    privacy.href = privacyUrl();
    privacy.textContent = 'Privacy details';
    copy.append(title, message, privacy);

    var actions = document.createElement('div');
    actions.className = 'analytics-consent-actions';
    var reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'analytics-consent-button';
    reject.dataset.analyticsReject = '';
    reject.textContent = 'Reject Analytics Cookies';
    reject.addEventListener('click', function () { choose('rejected'); });
    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'analytics-consent-button';
    accept.dataset.analyticsAccept = '';
    accept.textContent = 'Accept Analytics Cookies';
    accept.addEventListener('click', function () { choose('accepted'); });
    actions.append(reject, accept);
    banner.append(copy, actions);
    document.body.appendChild(banner);
    reject.focus();
  }

  window.USD8AnalyticsConsent = {
    open: openPreferences,
    status: readConsent,
  };

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest?.('[data-analytics-settings]');
    if (!trigger) return;
    event.preventDefault();
    openPreferences(trigger);
  });

  var consent = readConsent();
  if (consent === 'accepted') loadAnalytics();
  else disableAnalytics();

  function initialize() {
    if (!consent) openPreferences();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
