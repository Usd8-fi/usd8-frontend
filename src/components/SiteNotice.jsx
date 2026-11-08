import { useTranslation } from '../lib/i18n.js';

const TELEGRAM_GROUP = 'https://t.me/+e84i2oYk1ao1MTk1';

/// Private-beta announcement bar at the very top of the site.
export default function SiteNotice() {
  const { t, tRich } = useTranslation();
  return (
    <aside className="site-notice" aria-label={t('notices.site.ariaLabel')}>
      <div className="site-notice-inner">
        <svg className="site-notice-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path d="M4 9.5h3.5L12.5 5v14l-5-4.5H4z" fill="currentColor" />
          <path className="site-notice-wave site-notice-wave--near" d="M15.5 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path className="site-notice-wave site-notice-wave--far" d="M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <p>
          {tRich('notices.site.message', {
            strong: (text) => <strong>{text}</strong>,
            link: (text) => <a href={TELEGRAM_GROUP} target="_blank" rel="noreferrer">{text}</a>,
          })}
        </p>
      </div>
    </aside>
  );
}
