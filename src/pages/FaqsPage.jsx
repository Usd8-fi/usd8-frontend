import { H1, H2, PageBreak, PageLink } from '../components/PagePrimitives.jsx';

export default function FaqsPage({ onNavigate }) {
  return (
    <>
      <H1 id="faqs">FAQs</H1>

      <H2 id="can-i-just-buy-usd8-and-use-it-for-claiming-whenever-i-need-it"><span className="emoji">💭</span> Can I just buy USD8 and use it for claiming whenever I need it?</H2>
      <p>No. Cover amount depends on your USD8 usage history, without it you will not get much coverage. It&apos;s best to start using USD8 so you can build up your history.</p>
      <PageBreak count={2} />

      <H2 id="i-have-no-usd8-now-but-i-used-usd8-before-do-i-still-get-coverage"><span className="emoji">💭</span> I have no USD8 now, but I used USD8 before, do I still get coverage?</H2>
      <p>Yes. As long as you have used USD8 before, you will get some coverage.</p>
      <PageBreak count={2} />

      <H2 id="so-i-have-to-hold-usd8-to-build-a-usd8-history-score"><span className="emoji">💭</span> So I have to hold USD8 to build a USD8 History Score?</H2>
      <p>No. While holding USD8 certainly build your USD8 History Score, you can also deposit USD8 to a recognized yield vault; these will also count towards your USD8 History Score.</p>
      <PageBreak count={2} />

      <H2 id="how-safe-is-the-protected-savings-vault"><span className="emoji">💭</span> How safe is the Protected Savings vault?</H2>
      <p>It is one of the safest savings vaults because it comes with an 80% coverage. This means you can always claim up to 80% of your position value from the Cover Pool if something goes wrong.</p>
      <p>On top of that, you still earn competitive yield.</p>
      <PageBreak count={2} />

      <H2 id="how-safe-is-the-cover-pool"><span className="emoji">💭</span> How safe is the Cover Pool?</H2>
      <p>Assets deposited in the Cover Pool might be deployed to cover hacking losses from Covered Protocols. This makes it riskier than the Protected Savings vault, which is why it offers a higher APY.</p>
      <p>Our security experts independently vet and audit every protocol before offering coverage. Claims are not expected to occur often, but there is always a possibility.</p>
      <PageBreak count={2} />

      <H2 id="so-all-my-positions-in-covered-defi-protocols-are-protected"><span className="emoji">💭</span> So all my positions in Covered DeFi Protocols are protected?</H2>
      <p>Yes. As long as you use USD8, you are covered. The more USD8 and the longer you hold, the higher your USD8 History Score.</p>
      <PageBreak count={2} />

      <H2 id="do-i-forfeit-my-covered-lp-token-when-claiming-from-the-cover-pool"><span className="emoji">💭</span> Do I forfeit my covered LP token when claiming from the Cover Pool?</H2>
      <p>Yes. To claim from the Cover Pool, you must provide a covered LP token, which becomes the assets of USD8 protocol.</p>
      <PageBreak count={2} />

      <H2 id="will-i-always-get-80-of-my-money-back-for-a-defi-protocol-with-80-coverage"><span className="emoji">💭</span> Will I always get 80% of my money back for a defi protocol with 80% coverage?</H2>
      <p>Not necessarily. The actual reimbursed amount depends on:</p>
      <ul>
        <li>Your USD8 History Score based on your USD8 history</li>
        <li>How many other users are claiming and their USD8 History Scores</li>
        <li>The balance of the Cover Pool</li>
      </ul>
      <p>In practice, the more USD8 History Score you have, the higher your claim weight. The max reimbursement amount is 80% your LP value, but it is also possible you might get less than that.</p>
      <PageBreak count={2} />

      <H2 id="how-do-you-prevent-fraudulent-claims"><span className="emoji">💭</span> How do you prevent fraudulent claims?</H2>
      <p>USD8 only covers up to 80% of any position at max. Unless the LP token’s value drops below 80%, it is not financially rational to file a false claim.</p>
      <PageBreak count={2} />

      <H2 id="how-does-usd8-make-money"><span className="emoji">💭</span> How does USD8 make money?</H2>
      <p>
        Like most stablecoins, USD8 generates revenue from collateral yield. USD8 also earns from recovering losses
        through the <PageLink to="white-hat-economy.html" onNavigate={onNavigate}>White Hat Economy</PageLink>.
      </p>
      <PageBreak count={2} />

      <H2 id="how-can-i-contribute-or-help-with-usd8"><span className="emoji">💭</span> How can I contribute or help with USD8?</H2>
      <p>
        We are a brand new primitive with real unsolved challenges, and we welcome community contributions across
        mechanism design, partnerships, marketing, and more. See the{' '}
        <PageLink to="help-needed.html" onNavigate={onNavigate}>Help Needed</PageLink> page for the current list of open
        challenges. The best place to post proposals, critiques, and ideas is our{' '}
        <a href="https://github.com/orgs/Usd8-fi/discussions">GitHub Discussions</a>. Contributors can earn{' '}
        <PageLink to="boosters.html" onNavigate={onNavigate}>Boosters</PageLink>, permanent on-chain attribution, and
        priority on future paid work.
      </p>
      <PageBreak count={2} />

      <H2 id="who-is-behind-usd8"><span className="emoji">💭</span> Who is behind USD8?</H2>
      <p>USD8 was founded by an OpenZeppelin auditor and security researcher with over 5 years of experience, specializing in auditing DeFi protocols.</p>
      <p>We are passionate about DeFi security and dedicated to building solutions that make the on-chain environment safer.</p>
      <PageBreak count={2} />
    </>
  );
}
