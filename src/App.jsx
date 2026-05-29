import { useCallback, useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { MarkdownPage } from './components/MarkdownPage.jsx';
import { notFoundPage, pages, routeToPage } from './content/pages.js';

const GA_MEASUREMENT_ID = 'G-XZ3M0DQJ6M';

function currentRoute() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  return {
    file,
    hash: window.location.hash,
    key: `${window.location.pathname}${window.location.hash}`,
  };
}

function resolvePage(file) {
  if (file === '404.html') return notFoundPage;
  if (file === 'print.html') return null;
  return routeToPage.get(file) || notFoundPage;
}

function routeUrl(route) {
  return route === 'index.html' ? '/' : `/${route}`;
}

function useAnalytics(routeKey) {
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, { page_path: window.location.pathname });
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: window.location.pathname });
  }, [routeKey]);
}

function Sidebar({ activeId, onNavigate }) {
  return (
    <aside className="sidebar" aria-label="Table of contents">
      <a
        className="brand"
        href="/"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('index.html');
        }}
      >
        <img src="/assets/usd8Logo.svg" alt="" />
        <span>USD8</span>
      </a>

      <nav className="chapter-nav">
        {pages.map((page) => (
          <a
            key={page.id}
            href={page.route}
            className={page.id === activeId ? 'active' : ''}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(page.route);
            }}
          >
            <span>{page.navTitle}</span>
            {page.navPill ? <em>{page.navPill}</em> : null}
          </a>
        ))}
      </nav>

      <div className="sidebar-social" aria-label="Social links">
        <a href="https://t.me/+e84i2oYk1ao1MTk1" target="_blank" rel="noreferrer" aria-label="Join our Telegram">
          <Send size={22} strokeWidth={2} />
        </a>
        <a href="https://x.com/usd8_fi" target="_blank" rel="noreferrer" aria-label="Visit our X account">
          <span className="x-mark" aria-hidden="true" />
        </a>
        <a href="https://github.com/Usd8-fi" target="_blank" rel="noreferrer" aria-label="Visit our GitHub">
          <GitHubMark />
        </a>
      </div>
    </aside>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.11.79-.25.79-.56v-2.17c-3.22.7-3.9-1.38-3.9-1.38-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.04 1.76 2.72 1.25 3.38.96.11-.75.41-1.25.74-1.54-2.57-.29-5.27-1.29-5.27-5.73 0-1.27.45-2.3 1.2-3.11-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.19a10.98 10.98 0 0 1 5.8 0c2.2-1.5 3.18-1.19 3.18-1.19.63 1.6.23 2.78.11 3.07.75.81 1.2 1.84 1.2 3.11 0 4.45-2.71 5.43-5.29 5.72.42.36.79 1.07.79 2.16v3.19c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  );
}

function PrintPage({ onNavigate }) {
  return (
    <>
      <div className="print-title">
        <h1>USD8</h1>
      </div>
      {pages.map((page) => (
        <section className="print-section" key={page.id}>
          <MarkdownPage page={page} onNavigate={onNavigate} />
        </section>
      ))}
    </>
  );
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const isPrint = route.file === 'print.html';
  const page = useMemo(() => resolvePage(route.file), [route.file]);

  const navigate = useCallback((href) => {
    if (!href) return;

    const [pathPart, hashPart] = href.split('#');
    const targetPath = pathPart || route.file;
    const target = `${routeUrl(targetPath)}${hashPart ? `#${hashPart}` : ''}`;

    window.history.pushState({}, '', target);
    setRoute(currentRoute());
  }, [route.file]);

  useAnalytics(route.key);

  useEffect(() => {
    function onPopState() {
      setRoute(currentRoute());
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.title = `${isPrint ? 'Print' : page.title} - USD8`;

    const scrollTarget = route.hash ? document.getElementById(decodeURIComponent(route.hash.slice(1))) : null;
    const scrollWithOffset = () => {
      if (!scrollTarget) {
        window.scrollTo({ top: 0, left: 0 });
        return;
      }

      const top = scrollTarget.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(top, 0), left: 0 });
    };

    window.setTimeout(scrollWithOffset, 0);
    if (scrollTarget) window.setTimeout(scrollWithOffset, 350);

    window.MathJax?.typesetPromise?.();
  }, [isPrint, page, route.hash, route.key]);

  const activeId = isPrint ? '' : page.id;

  return (
    <div className="app-shell">
      <Sidebar activeId={activeId} onNavigate={navigate} />
      <main className="content-shell">
        <div className="content">
          {isPrint ? <PrintPage onNavigate={navigate} /> : <MarkdownPage page={page} onNavigate={navigate} />}
        </div>
      </main>
    </div>
  );
}
