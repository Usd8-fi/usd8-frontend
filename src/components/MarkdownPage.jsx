import ReactMarkdown from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import BoosterChecker from './BoosterChecker.jsx';

const boosterPlaceholder = /<div class="booster-check">[\s\S]*?<\/div>/m;

function normalizeHref(href = '') {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|ipfs:|\/\/)/i.test(href)) return href;
  if (href.startsWith('#')) return href;

  const [pathPart, hashPart] = href.split('#');
  let path = pathPart.replace(/^\.\//, '');

  if (path.endsWith('.md')) path = `${path.slice(0, -3)}.html`;
  if (path === 'README.md') path = 'index.html';

  return hashPart ? `${path}#${hashPart}` : path;
}

export function MarkdownPage({ page, onNavigate }) {
  const source = page.id === 'boosters'
    ? page.source.replace(boosterPlaceholder, '<div class="booster-checker-placeholder"></div>')
    : page.source;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['header'] } }],
      ]}
      components={{
        a({ href, children, ...props }) {
          const normalized = normalizeHref(href);
          const isRoute = normalized && /^[^/#?]+\.html(#.*)?$/.test(normalized);

          return (
            <a
              {...props}
              href={normalized}
              onClick={(event) => {
                if (!isRoute) return;
                event.preventDefault();
                onNavigate(normalized);
              }}
            >
              {children}
            </a>
          );
        },
        img({ src = '', alt = '', ...props }) {
          return <img {...props} src={src} alt={alt} loading="lazy" />;
        },
        div({ className = '', children, ...props }) {
          if (className === 'booster-checker-placeholder') return <BoosterChecker />;
          return <div {...props} className={className}>{children}</div>;
        },
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
