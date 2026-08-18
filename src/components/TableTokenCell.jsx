export default function TableTokenCell({ iconSrc, children }) {
  return (
    <span className="table-token-cell">
      <img className="table-token-icon" src={iconSrc} alt="" />
      <span className="table-token-name">{children}</span>
    </span>
  );
}
