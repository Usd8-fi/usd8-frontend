import { BuildingPill, H1, H2, PageBreak, PageLink } from '../components/PagePrimitives.jsx';

export default function Usd8Page({ onNavigate }) {
  return (
    <>
      <img className="floating-logo" src="/assets/usd8Logo.svg" width="170" alt="" />
      <PageBreak count={2} />

      <H1 id="usd8">USD8 <BuildingPill /></H1>

      <p>USD8 is a stablecoin with two baked-in functions — free Defi Insurance and Order Enforcement.</p>

      <H2 id="free-defi-insurance">Free Defi Insurance</H2>
      <p>
        USD8 users get Defi Insurance covering{' '}
        <PageLink to="cover-pool.html#covered-defi-protocols" onNavigate={onNavigate}>multiple defi protocols</PageLink>
        , across any position, up to 80%, completely free. Claims are onchain and permissionless. Funds come from
        USD8&apos;s <PageLink to="cover-pool.html" onNavigate={onNavigate}>Cover Pool</PageLink>. The more you use USD8,
        the more you are covered.
      </p>

      <H2 id="order-enforcement">Order Enforcement</H2>
      <p>
        After claims, USD8 curates a{' '}
        <PageLink to="white-hat-economy.html" onNavigate={onNavigate}>White Hat Economy</PageLink>, chasing lost assets
        on an ongoing basis — enforcing orders for the Defi space and deterring future hacks.
      </p>
      <PageBreak />

      <H1 id="security">Security</H1>
      <p>
        Security is the core of USD8. For every covered DeFi protocol we work alongside our audit partners to enforce
        rigorous audits and ongoing reviews. We accept independent security audits from{' '}
        <a href="https://www.openzeppelin.com/">OpenZeppelin</a>. On top of that, we also accept{' '}
        <a href="https://frameworks.securityalliance.dev/certs/overview/">SEAL Certification from Security Alliance</a>{' '}
        when evaluating coverage for a protocol.
        <PageBreak count={3} />
      </p>

      <PageBreak />

      <H1 id="use-cases">Use cases</H1>
      <ol>
        <li>
          For passive DeFi users who want their savings protected - Swap your stablecoins for USD8 and deposit into our{' '}
          <PageLink to="usd8.html#protected-savings" onNavigate={onNavigate}>Protected Savings</PageLink> to earn yield(est.
          3-5%) while being protected. If this vault is hacked, you can claim upto 80% of your loss from the{' '}
          <PageLink to="cover-pool.html" onNavigate={onNavigate}>Cover Pool</PageLink>.
        </li>
        <li>
          For advanced DeFi users actively managing their own yield strategies - Hold USD8 (or USD8 LSTs with yield) and
          freely use any <PageLink to="cover-pool.html#covered-defi-protocols" onNavigate={onNavigate}>Covered DeFi Protocols</PageLink>,
          now all your positions are protected by the Cover Pool.
        </li>
        <li>
          For high-yield seekers with higher risk tolerance: deposit assets into our{' '}
          <PageLink to="cover-pool.html" onNavigate={onNavigate}>Cover Pool</PageLink> to share protocol revenue
          (estimated 15–30% returns). Be aware your assets might be used to offset losses from{' '}
          <PageLink to="cover-pool.html#covered-defi-protocols" onNavigate={onNavigate}>Covered DeFi Protocols</PageLink>,
          but our security team screens every covered protocol to reduce the chance of incidents.
        </li>
      </ol>
      <PageBreak />

      <H1 id="backed-by-usdc">Backed by USDC</H1>
      <PageBreak count={1} />
      <img src="/assets/multiCollateral.png" height="150" alt="" />
      <PageBreak count={3} />

      <p>
        USD8 can be minted 1:1 with USDC permissionlessly, these USDC collateral will be deployed to Defi platform for
        yield. Rest assured your USD8 is covered by the <PageLink to="cover-pool.html" onNavigate={onNavigate}>Cover Pool</PageLink>{' '}
        upto 80% incase anything goes wrong, you can redeem USD8 upto 80% value.
      </p>

      <p>
        Redeem USD8 back to USDC will be also be permissionless, while we expect this process to be instant there might
        be a delay for large redeems because some external defi protocol might have a delay in their redeeming process,
        which is out of our control. However there will be an AMM pool available for swaps at anytime.
      </p>
      <PageBreak />

      <H1 id="protected-savings">Protected Savings</H1>
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
      <PageBreak />

      <H1 id="we-are-crypto-native">We are Crypto Native</H1>
      <p>
        We are crypto native — we live and breathe the decentralized dream and are committed to building projects that
        adhere as closely as possible to the{' '}
        <a href="https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html">Trustless Manifesto</a>.
        <PageBreak count={2} />
        <a href="https://t.me/+e84i2oYk1ao1MTk1">Join us</a> if you share our vision.
      </p>
    </>
  );
}
