import { H1, H2, PageBreak, PageLink } from '../components/PagePrimitives.jsx';

export default function WhiteHatEconomyPage({ onNavigate }) {
  return (
    <>
      <img className="floating-logo" src="/assets/whiteHat.png" width="350" alt="" />
      <PageBreak count={2} />

      <H1 id="white-hat-economy">White Hat Economy <span className="coming-soon-pill">Building</span></H1>

      <p>
        The White Hat economy is the enforcement layer of USD8. It plays a critical role in recovering lost assets and
        deterring future malicious activities in Defi.
        <br />
      </p>

      <p>
        After a successful claim, the forfeited LP tokens become the property of the USD8 protocol, providing the
        financial engine to power the White Hat economy. We plan to explore multiple mechanisms depending on the size of
        the hack:
      </p>

      <H2 id="tokenized-distressed-debt-market"><span className="emoji">📈</span> Tokenized Distressed Debt Market</H2>
      <p>
        Deploy on-chain primitives such as AMMs and bonding curves to facilitate tokenized distressed debt markets,
        unlocking a brand new primitive for Defi. Using this as a mechanism to fund early-stage recovery.
      </p>

      <H2 id="permanent-bounties--anonymous-tips"><span className="emoji">🎯</span> Permanent Bounties &amp; Anonymous Tips</H2>
      <p>
        Bounties up to a million dollars without an expiry date, paid in USD8 from the recovered funds. A hacker who
        launders successfully today still has a price on their address ten years from now.
      </p>
      <p>
        Allow anyone to submit tips anonymously — wallet clusters, exchange deposits, off-ramp paths — tied to a
        specific incident. Submissions are timestamped and attributable; all submissions that help recover the lost funds
        will share a portion of the final bounty.
      </p>

      <H2 id="white-hat-guild--open-education"><span className="emoji">🕵️</span> White Hat Guild &amp; Open Education</H2>
      <p>
        Direct sponsorship of white hat groups, independent investigators, forensic firms, and ex-law-enforcement
        specialists. Alongside this, free curriculum, workshops, and tooling that lower the barrier for new investigators
        to participate. The more people who can read a transaction graph, the less defensible black-hat behavior becomes.
      </p>

      <H2 id="legal-action--law-enforcement"><span className="emoji">⚖️</span> Legal Action &amp; Law Enforcement</H2>
      <p>
        Direct fund civil suits, asset freezes, and cross-border legal coordination. A standing point of contact with
        relevant agencies in major jurisdictions, packaged with the evidence formats they actually use.
      </p>

      <PageBreak />
      <H1 id="why-this-matters">Why This Matters</H1>
      <p>
        Insurance alone is reactive. The <PageLink to="cover-pool.html" onNavigate={onNavigate}>Cover Pool</PageLink>{' '}
        makes users whole after a hack, but it does not change the incentives that produced the hack in the first place.
      </p>
      <p>
        The White Hat Economy is the second half of USD8&apos;s thesis — turning the proceeds of every claim into pressure
        on the attacker, and turning every member of the public into a potential adversary for bad actors. Combined with
        the Cover Pool, this is what closes the loop: victims get covered, recoveries fund more coverage, and the cost of
        attacking DeFi rises every time the system is used.
      </p>
      <p>
        This is also how USD8 addresses the deeper problem laid out in our{' '}
        <PageLink to="philosophy.html" onNavigate={onNavigate}>Philosophical Roots</PageLink> — the missing alignment and
        enforcement layer that has let malicious activity flourish in crypto. By rewarding good actors and imposing
        permanent, compounding risk on bad ones, the White Hat Economy realigns the industry&apos;s incentives and, over
        time, deters the next hack from being committed in the first place.
      </p>
      <PageBreak />
    </>
  );
}
