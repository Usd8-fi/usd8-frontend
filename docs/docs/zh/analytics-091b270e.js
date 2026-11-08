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

  // Consent banner text in the visitor's language: the docs language from the
  // /docs/<lang>/ path, else the app's saved choice, else the browser language.
  var CONSENT_TEXT = {
    en: { label: 'Cookie and analytics preferences', title: 'Cookie & Analytics Preferences', message: 'USD8 uses optional Google Analytics cookies to understand aggregate site usage. We only load analytics after you accept. Rejecting does not affect the app.', privacy: 'Privacy details', reject: 'Reject Analytics Cookies', accept: 'Accept Analytics Cookies' },
    zh: { label: "Cookie与分析偏好设置", title: "Cookie与分析偏好设置", message: "USD8使用可选的Google Analytics Cookie来了解网站的整体使用情况。只有在你同意后，我们才会加载分析功能；拒绝不会影响应用的正常使用。", privacy: "隐私说明", reject: "拒绝分析Cookie", accept: "接受分析Cookie" },
    "zh-TW": { label: "Cookie與分析偏好設定", title: "Cookie與分析偏好設定", message: "USD8使用選用性的Google Analytics Cookie，來了解網站的整體使用狀況。我們只會在你同意後載入分析功能；拒絕也不會影響應用程式的正常使用。", privacy: "隱私權聲明", reject: "拒絕分析Cookie", accept: "接受分析Cookie" },
    ko: { label: "쿠키 및 분석 설정", title: "쿠키 및 분석 설정", message: "USD8은 사이트 이용 현황을 집계해 파악하기 위해 선택 사항인 Google Analytics 쿠키를 사용합니다. 분석 도구는 동의하신 경우에만 불러오며, 거부해도 앱 이용에는 영향이 없습니다.", privacy: "개인정보 처리 안내", reject: "분석 쿠키 거부", accept: "분석 쿠키 허용" },
    ja: { label: "Cookieと分析の設定", title: "Cookieと分析の設定", message: "USD8では、サイト全体の利用状況を把握するために、任意のGoogle Analytics Cookieを使用しています。分析は同意いただいた場合にのみ読み込みます。拒否しても、アプリの利用には影響しません。", privacy: "プライバシーの詳細", reject: "分析Cookieを拒否", accept: "分析Cookieを許可" },
    de: { label: "Cookie- und Analyse-Einstellungen", title: "Cookie- und Analyse-Einstellungen", message: "USD8 nutzt optionale Google-Analytics-Cookies, um die Nutzung der Website in aggregierter Form auszuwerten. Google Analytics laden wir erst, wenn Sie zustimmen. Eine Ablehnung schränkt die App nicht ein.", privacy: "Datenschutzhinweise", reject: "Analyse-Cookies ablehnen", accept: "Analyse-Cookies akzeptieren" },
    es: { label: "Preferencias de cookies y analítica", title: "Cookies y analítica", message: "USD8 usa cookies opcionales de Google Analytics para conocer, de forma agregada, cómo se usa el sitio. Solo cargamos la analítica si la aceptas, y rechazarla no afecta al funcionamiento de la app.", privacy: "Detalles de privacidad", reject: "Rechazar cookies analíticas", accept: "Aceptar cookies analíticas" },
    it: { label: "Preferenze su cookie e analisi", title: "Preferenze su cookie e analisi", message: "USD8 usa cookie facoltativi di Google Analytics per capire, in forma aggregata, come viene usato il sito. Attiviamo gli strumenti di analisi solo dopo il tuo consenso. Se rifiuti, l’app funziona normalmente.", privacy: "Dettagli sulla privacy", reject: "Rifiuta cookie di analisi", accept: "Accetta cookie di analisi" },
    ru: { label: "Настройки cookie и аналитики", title: "Настройки cookie и аналитики", message: "USD8 использует необязательные cookie Google Analytics, чтобы видеть общую статистику посещений сайта. Аналитика включается только с вашего согласия, а отказ никак не влияет на работу приложения.", privacy: "Подробнее о конфиденциальности", reject: "Отклонить аналитику", accept: "Принять аналитику" },
    pt: { label: "Preferências de cookies e análise", title: "Cookies e análise", message: "O USD8 usa cookies opcionais do Google Analytics para entender, de forma agregada, como o site é usado. Só carregamos as ferramentas de análise depois que você aceita, e recusar não afeta o funcionamento do app.", privacy: "Detalhes de privacidade", reject: "Recusar cookies de análise", accept: "Aceitar cookies de análise" },
    fr: { label: "Préférences de cookies et de mesure d’audience", title: "Cookies et mesure d’audience", message: "USD8 utilise des cookies Google Analytics facultatifs pour mesurer l’audience du site de façon agrégée. Ces outils ne sont chargés qu’après votre accord, et les refuser n’a aucun effet sur l’application.", privacy: "Détails sur la confidentialité", reject: "Refuser les cookies d’analyse", accept: "Accepter les cookies d’analyse" },
    tr: { label: "Çerez ve analiz tercihleri", title: "Çerez ve Analiz Tercihleri", message: "USD8, sitenin genel kullanımını anlamak için isteğe bağlı Google Analytics çerezleri kullanır. Analiz araçlarını yalnızca siz kabul ettikten sonra yükleriz. Reddetmeniz uygulamanın kullanımını etkilemez.", privacy: "Gizlilik ayrıntıları", reject: "Analiz Çerezlerini Reddet", accept: "Analiz Çerezlerini Kabul Et" },
    vi: { label: "Tùy chọn cookie và phân tích", title: "Tùy chọn cookie & phân tích", message: "USD8 dùng cookie Google Analytics (không bắt buộc) để nắm được số liệu tổng hợp về cách trang web được sử dụng. Chúng tôi chỉ bật công cụ phân tích khi bạn đồng ý, và việc từ chối không ảnh hưởng đến ứng dụng.", privacy: "Chi tiết về quyền riêng tư", reject: "Từ chối cookie phân tích", accept: "Chấp nhận cookie phân tích" },
    id: { label: "Preferensi cookie dan analitik", title: "Preferensi Cookie & Analitik", message: "USD8 menggunakan cookie Google Analytics opsional untuk memahami penggunaan situs secara agregat. Analitik baru dimuat setelah Anda menyetujuinya. Jika Anda menolak, aplikasi tetap berfungsi seperti biasa.", privacy: "Detail privasi", reject: "Tolak Cookie Analitik", accept: "Terima Cookie Analitik" },
    uk: { label: "Налаштування cookie та аналітики", title: "Cookie та аналітика", message: "USD8 використовує необов’язкові cookie Google Analytics, щоб бачити загальну статистику відвідувань сайту. Аналітику вмикаємо лише з вашої згоди, а відмова ніяк не впливає на роботу застосунку.", privacy: "Докладніше про конфіденційність", reject: "Відхилити аналітичні cookie", accept: "Прийняти аналітичні cookie" },
    th: { label: "การตั้งค่าคุกกี้และการวิเคราะห์", title: "การตั้งค่าคุกกี้และการวิเคราะห์", message: "USD8 ใช้คุกกี้ Google Analytics แบบไม่บังคับ เพื่อดูภาพรวมการใช้งานเว็บไซต์ เราจะโหลดเครื่องมือวิเคราะห์ก็ต่อเมื่อคุณยอมรับเท่านั้น และการปฏิเสธจะไม่กระทบการใช้งานแอป", privacy: "รายละเอียดความเป็นส่วนตัว", reject: "ปฏิเสธคุกกี้วิเคราะห์", accept: "ยอมรับคุกกี้วิเคราะห์" },
    ar: { label: "تفضيلات ملفات تعريف الارتباط والتحليلات", title: "ملفات تعريف الارتباط والتحليلات", message: "تستخدم USD8 ملفات تعريف ارتباط اختيارية من Google Analytics لفهم استخدام الموقع بصورة إجمالية. لا نحمّل أدوات التحليل إلا بعد موافقتك، ورفضها لا يؤثر في عمل التطبيق.", privacy: "تفاصيل الخصوصية", reject: "رفض التحليلات", accept: "قبول التحليلات" },
    fa: { label: "تنظیمات کوکی و تحلیل بازدید", title: "تنظیمات کوکی و تحلیل بازدید", message: "USD8 از کوکی‌های اختیاری Google Analytics استفاده می‌کند تا تصویری کلی از نحوه‌ی استفاده از سایت داشته باشد. ابزار تحلیل فقط پس از موافقت شما بارگذاری می‌شود و رد کردن آن هیچ اثری بر کارکرد اپلیکیشن ندارد.", privacy: "جزئیات حریم خصوصی", reject: "رد کوکی‌های تحلیلی", accept: "پذیرش کوکی‌های تحلیلی" }
  };
  function consentLanguage() {
    var match = window.location.pathname.match(/\/docs\/(zh-TW|zh|ko|ja|de|es|it|ru|pt|fr|tr|vi|id|uk|th|ar|fa)\//);
    if (match) return match[1];
    if (/\/docs\//.test(window.location.pathname)) return 'en';
    try {
      var saved = localStorage.getItem('usd8.language');
      if (saved && CONSENT_TEXT[saved]) return saved;
    } catch (_) {}
    var tags = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < tags.length; i += 1) {
      var lower = String(tags[i]).toLowerCase();
      if (/^zh-(tw|hk|mo|hant)/.test(lower)) return 'zh-TW';
      var base = lower.split('-')[0];
      if (CONSENT_TEXT[base]) return base;
    }
    return 'en';
  }
  function consentText(key) { return (CONSENT_TEXT[consentLanguage()] || CONSENT_TEXT.en)[key]; }

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
    banner.setAttribute('aria-label', consentText('label'));
    banner.setAttribute('aria-live', 'polite');

    var copy = document.createElement('div');
    copy.className = 'analytics-consent-copy';
    var title = document.createElement('strong');
    title.textContent = consentText('title');
    var message = document.createElement('p');
    message.textContent = consentText('message');
    var privacy = document.createElement('a');
    privacy.href = privacyUrl();
    privacy.textContent = consentText('privacy');
    copy.append(title, message, privacy);

    var actions = document.createElement('div');
    actions.className = 'analytics-consent-actions';
    var reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'analytics-consent-button';
    reject.dataset.analyticsReject = '';
    reject.textContent = consentText('reject');
    reject.addEventListener('click', function () { choose('rejected'); });
    var accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'analytics-consent-button';
    accept.dataset.analyticsAccept = '';
    accept.textContent = consentText('accept');
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
