import { H1, H2, PageBreak, PageLink } from '../components/PagePrimitives.jsx';

export default function HelpNeededPage({ onNavigate }) {
  return (
    <>
      <H1 id="help-needed">Help Needed <span className="live-pill">Live</span></H1>

      <p>
        USD8 is a brand new primitive for DeFi — a usage-based free insurance layer combined with a white-hat-funded
        enforcement layer. Nothing quite like this has been built before, so there are real unsolved challenges in the
        design and we don&apos;t pretend to have all the answers.
      </p>
      <p>
        We are asking the broader crypto community — researchers, security professionals, mechanism designers, lawyers,
        white hats — to help us pressure-test the model and close the gaps.
      </p>
      <p>
        Please post contributions in our{' '}
        <a href="https://github.com/orgs/Usd8-fi/discussions">GitHub Discussions</a> — that is the canonical place for
        proposals, critiques, and design ideas. You can also reach us on{' '}
        <a href="https://t.me/+e84i2oYk1ao1MTk1">Telegram</a> or <a href="https://x.com/usd8_fi">X</a>.
      </p>
      <PageBreak />

      <H1 id="open-challenges">Open Challenges</H1>

      <H2 id="1-hacker-double-dipping">1. Hacker double dipping <span className="tag-pill tag-pill--purple">mechanism design</span></H2>
      <p>
        Currently hackers can claim insurance payouts on own positions they exploited. Although we believe the likelihood
        is low as it requires significant extra capital from hackers to be worthwhile, we would like to find a neat
        solution doesn&apos;t cause too much system overheads.
      </p>

      <H2 id="2-universal-coverage-for-all-eth-users">2. Universal Coverage for all Eth Users <span className="tag-pill tag-pill--blue">partnerships</span></H2>
      <p>
        Today, USD8 coverage is tied to a user&apos;s USD8 usage history. We would love to extend this into a universal
        coverage layer for every Ethereum address — similar in spirit to the FDIC.
      </p>
      <p>
        Doing so requires a meaningful capital commitment from a major ecosystem actor such as the Ethereum Foundation,
        held either as USD8 or deposited into the Cover Pool as an LP. With that backing in place, we could offer a base
        level of insurance to every Ethereum address up to a fixed amount, regardless of USD8 usage history, with the cap
        scaled to the size of the commitment.
      </p>
      <p>We would like some help in getting in touch with potential ecosystem actors.</p>

      <H2 id="3-white-hat-economy-design">3. White Hat Economy Design <span className="tag-pill tag-pill--purple">mechanism design</span></H2>
      <p>
        We would love some help in exploring how existing DeFi primitives — such as prediction markets — could be used to
        facilitate the <PageLink to="white-hat-economy.html" onNavigate={onNavigate}>White Hat Economy</PageLink>.
      </p>

      <H2 id="4-theory-awareness">4. Theory awareness <span className="tag-pill tag-pill--orange">marketing</span></H2>
      <p>
        USD8 is grounded in Anarcho-Capitalism theory — the idea that a decentralized society like crypto still needs an
        enforcement layer to align incentives correctly, just one built on incentive design and game theory rather than
        centralized power. More on the reasoning is in our{' '}
        <PageLink to="philosophy.html" onNavigate={onNavigate}>Philosophical Roots</PageLink>.
      </p>
      <p>
        Getting this idea in front of the right people has been very challenging so far. We would love help getting the
        word out to crypto KOLs, researchers, and industry stakeholders who care about the long-term future of the space
        — anyone worries about Defi security and the future of the Ethereum ecosystem.
      </p>
      <PageBreak />

      <H1 id="what-we-can-offer-in-return">What We Can Offer In Return</H1>
      <p>USD8 is just starting and our resources are limited, but we want to recognize people who help us build this.</p>
      <ul>
        <li><PageLink to="boosters.html" onNavigate={onNavigate}>Boosters</PageLink></li>
        <li>Permanent attribution — public acknowledgement of the contribution on the USD8 website or in the associated smart contracts. Recognition does not expire</li>
        <li>Priority on work and collaboration — early contributors are first in line for paid work, audits, and partnerships as USD8 grows</li>
        <li>Financial incentives where budget allows — as revenue grows we expect to set aside budget for direct compensation on specific problems.</li>
      </ul>
      <PageBreak />
    </>
  );
}
