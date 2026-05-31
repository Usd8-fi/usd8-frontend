import { H1, PageBreak } from '../components/PagePrimitives.jsx';

export default function ProtectedSavingsPage() {
  return (
    <>
      <H1 id="protected-savings">Protected Savings <span className="coming-soon-pill">Building</span></H1>
      <PageBreak count={2} />
      <img src="/assets/savingsVault.png" width="350" alt="" />
      <PageBreak count={2} />

      <p>
        USD8 Protected Savings is a yield vault designed for passive DeFi users who want simple, deposit-and-forget yield
        with built-in protection.
      </p>
      <p>
        Managed by USD8, this vault is covered by the Cover Pool for up to 80% of its value, subject to the pool’s limit.
      </p>
      <p>
        Depositors receive yield-bearing sUSD8, which can be used to claim coverage from the Cover Pool,
        permissionlessly, at any time, up to 80% of the sUSD8 value, capped by the Cover Pool balance.
      </p>
    </>
  );
}
