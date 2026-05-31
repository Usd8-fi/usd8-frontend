import BoosterChecker from '../components/BoosterChecker.jsx';
import { H1, PageBreak, PageLink } from '../components/PagePrimitives.jsx';

export default function BoostersPage({ onNavigate }) {
  return (
    <>
      <img className="floating-logo" src="/assets/booster.png" width="500" alt="" />
      <PageBreak count={1} />

      <H1 id="boosters">Boosters <span className="live-pill">Live</span></H1>
      <p>
        Boosters are NFTs that can be burned when filing a claim to add a 1% boost to your total USD8 History Score,
        meaning more insurance coverage for your funds in Defi protocols. Boosters are
      </p>
      <ul>
        <li>usable after USD8 is launched and the Cover Pool is in operation</li>
        <li>stackable, 2 Boosters give you 2%. No limits</li>
        <li>freely transferrable</li>
      </ul>
      <p>
        Booter contract Eth mainnet{' '}
        <a href="https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d">
          0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d
        </a>
      </p>
      <PageBreak />

      <H1 id="collect-boosters">Collect Boosters</H1>
      <p>Boosters are not for sale. They are distributed only to users who help USD8 grow. To get Boosters, you can</p>
      <ul>
        <li>post on social media about USD8 (do not spam)</li>
        <li>
          follow our <a href="https://x.com/usd8_fi">X</a> and{' '}
          <a href="https://t.me/+e84i2oYk1ao1MTk1">Telegram</a> and engage in meaningful discussions
        </li>
        <li>
          contribute to any of the{' '}
          <PageLink to="help-needed.html#open-challenges" onNavigate={onNavigate}>Open Challenges</PageLink>
        </li>
      </ul>
      <p>
        Our team monitors social channels will reach out to offer Boosters. If your posts has lots of impact, you will
        get multiple Boosters.
      </p>
      <p>
        You can also send links to your posts in our{' '}
        <a href="https://t.me/+e84i2oYk1ao1MTk1">Telegram group</a> or ping{' '}
        <a href="https://x.com/usd8_fi">USD8 on X.com</a> to request Boosters if we missed any.
      </p>
      <p>Happy collecting.</p>
      <PageBreak />

      <H1 id="check-your-boosters">Check Your Boosters</H1>
      <p>Enter an Ethereum address to check Boosters</p>
      <BoosterChecker />
      <PageBreak />
    </>
  );
}
