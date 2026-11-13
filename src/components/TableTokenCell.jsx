export default function TableTokenCell({ iconSrc, subtitle = '', children }) {
  return (
    <span className="table-token-cell">
      <img className="table-token-icon" src={iconSrc} alt="" />
      <span className="table-token-name">
        <span className="table-token-symbol">{children}</span>
        {subtitle ? <span className="table-token-subtitle">{subtitle}</span> : null}
      </span>
    </span>
  );
}
