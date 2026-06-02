export function PageLink({ to, href, onNavigate, children, ...props }) {
  const target = to || href;
  const isRoute = target && /^[^/#?]+\.html(#.*)?$/.test(target);

  return (
    <a
      {...props}
      href={target}
      onClick={(event) => {
        if (!isRoute || !onNavigate) return;
        event.preventDefault();
        onNavigate(target);
      }}
    >
      {children}
    </a>
  );
}

export function H1({ id, children }) {
  return (
    <h1 id={id}>
      {id ? <a className="header" href={`#${id}`}>{children}</a> : children}
    </h1>
  );
}

export function H2({ id, children }) {
  return (
    <h2 id={id}>
      {id ? <a className="header" href={`#${id}`}>{children}</a> : children}
    </h2>
  );
}

export function BuildingPill() {
  return <span className="coming-soon-pill">Building</span>;
}

export function PageBreak({ count = 4 }) {
  return Array.from({ length: count }, (_, index) => <br key={index} />);
}
