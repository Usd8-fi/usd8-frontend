import { H1, H2, PageBreak } from '../components/PagePrimitives.jsx';

export default function CoverPoolPage() {
  return (
    <>
      <H1 id="cover-pool">Cover Pool <span className="coming-soon-pill">Building</span></H1>

      <br />
      <img className="floating-logo" src="/assets/coverPool.png" width="700" alt="" />
      <PageBreak count={2} />

      <p>
        The Cover Pool is a high yield vault consists of multiple assets, the yield comes from protocol revenue. Anyone
        can deposit into the pool at any time; withdrawals are subject to a 2-day cooldown period if there are no
        unresolved hacking events, longer (till claims finalised) if there are. Assets still accrue yield during cool
        down period.
      </p>
      <p>
        Assets in the Cover Pool are not protected by USD8 and might be deployed to cover losses from protected Defi
        protocols. Depositors should be aware of the risk associated before depositing.
      </p>
      <PageBreak />

      <H1 id="covered-defi-protocols">Covered DeFi Protocols<br /></H1>
      <p>
        USD8, together with our security partners, independently vets and selects DeFi protocols that demonstrate the
        strongest security practices. Coverage is offered on a per-LP-token basis, depending on our security assessment,
        and is limited to a percentage of potential losses, capped by the Cover Pool balance.
      </p>
      <PageBreak />
      <img src="/assets/coveredProtocols.png" width="700" alt="" />
      <PageBreak count={2} />

      <p>
        Once coverage is offered, the Cover Pool will accept the specified LP token for claims at any time,
        permissionlessly. Claimants receive a proportional mix of assets matching the Cover Pool’s composition.
      </p>
      <PageBreak />

      <p>Planned coverage (Eth mainnet)</p>

      <table className="cover-table">
        <tbody>
          <tr>
            <td>Brand</td>
            <td>Token Accepted</td>
            <td>Address</td>
            <td>Reimbursement(upto)</td>
          </tr>
          <tr>
            <td><img src="assets/usd8Logo.svg" width="40" alt="" /></td>
            <td>USD8</td>
            <td>TBD</td>
            <td>0.8 USDC</td>
          </tr>
          <tr>
            <td><img src="assets/usd8Logo.svg" width="40" alt="" /></td>
            <td>USD8 Protected Savings sUSD8 </td>
            <td>TBD</td>
            <td>0.8 USD8</td>
          </tr>
          <tr>
            <td><img src="assets/aavelogo.svg" width="40" alt="" /></td>
            <td>Aave Savings Gho sGHO</td>
            <td>0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d<br /> impl 0x50f9d4e28309303f0cdcac8af0b569e8b75ab857</td>
            <td>0.8 GHO</td>
          </tr>
          <tr>
            <td><img src="https://cdn.jsdelivr.net/gh/curvefi/curve-assets/branding/logo.png" width="40" alt="" /></td>
            <td>Curve Savings scrvUSD</td>
            <td>0x0655977feb2f289a4ab78af67bab0d17aab84367<br /> impl 0xd8063123bba3b480569244ae66bfe72b6c84b00d</td>
            <td>0.7 crvUSD</td>
          </tr>
          <tr>
            <td><img src="assets/lidoLogo.svg" width="40" alt="" /></td>
            <td>Lido stETH</td>
            <td>0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84<br /> impl 0x17144556fd3424edc8fc8a4c940b2d04936d17eb</td>
            <td>0.7 Eth</td>
          </tr>
          <tr>
            <td><img src="https://assets.coingecko.com/coins/images/39925/large/sky.jpg" width="40" alt="" /></td>
            <td>Sky Savings sUSDS</td>
            <td>0xa3931d71877c0e7a3148cb7eb4463524fec27fbd<br /> impl 0x4e7991e5c547ce825bdeb665ee14a3274f9f61e0</td>
            <td>0.7 USDS</td>
          </tr>
          <tr>
            <td>
              <img
                src="https://docs.yieldnest.finance/~gitbook/image?url=https%3A%2F%2F2873068466-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDyxbBTdzhJqQAdVgDB8k%252Fuploads%252FzN9OBqA2oJbHWzVrvxDD%252FLogomark%2520Gold%2520on%2520Dark.png%3Falt%3Dmedia%26token%3Dc4a4a84c-ca82-4cd2-8794-cf298a392d80&width=768&dpr=2&quality=100&sign=139c44cd&sv=2"
                width="40"
                alt=""
              />
            </td>
            <td>Yieldnest ynETHx</td>
            <td>0x657d9ABA1DBb59e53f9F3eCAA878447dCfC96dCb<br /> impl 0x9C1713BC42dCF621038F4016664fFAB096A05410</td>
            <td>0.6 Eth</td>
          </tr>
          <tr>
            <td><img src="assets/oethLogo.svg" width="40" alt="" /></td>
            <td>Origin OETH</td>
            <td>0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3<br /> impl 0xD86756dBb01e75A11AaDaCB75c8495759ED92033</td>
            <td>0.6 Eth</td>
          </tr>
        </tbody>
      </table>

      <PageBreak />
      <H1 id="claiming">Claiming</H1>
      <br />
      <img src="/assets/claiming.png" width="700" alt="" />
      <PageBreak count={2} />

      <ol>
        <li>
          To start a claim, user transfers the protected LP token to the Cover Pool. Our front end will also calculate
          user&apos;s USD8 History Scores based on historical USD8 usage during this process and submit it on chain.
        </li>
        <li>
          The claim enters a 10-day window where others can join. After 10 days, that LP token is removed from the
          covered list and no new claims are accepted.
        </li>
        <li>
          Claimants can withdraw their reimbursement. The amount is calculated from total claims, each claimant’s USD8
          History Score*, and the current Cover Pool balance. Payouts will match the Cover Pool’s asset mix.
        </li>
      </ol>

      <p>After a claim, the protected LP tokens forfeited by claimers becomes the property of USD8 protocol.</p>
      <PageBreak />

      <H1 id="usd8-history-score">USD8 History Score</H1>

      <p>
        USD8 History Score is calculated based on your USD8 holding history — how much you’ve held and for how long. More
        USD8 held for longer increases the score, this includes USD8 LSTs like USD8 savings and other LPs so you can
        still make yield.
      </p>

      <p>
        USD8 History Score is computed off-chain with an open sourced algorithm, signed by the USD8&apos;s front end, and
        verified on-chain during a claim. Anyone can recalculate and validate every user&apos;s score.
      </p>

      <p>USD8 History Scores reset after a successful claim.</p>

      <H2 id="algorithm-details">Algorithm Details</H2>

      <p>
        Your USD8 History Score is your share of the cover pool, computed as a{' '}
        <a href="https://en.wikipedia.org/wiki/Shapley_value">Shapley value</a>:
      </p>

      <div style={{ fontSize: '1.25em' }}>
        {'\\[ \\omega_i = \\sum_{\\text{token}} \\text{weight}_{\\text{token}} \\times \\int_0^T \\text{balance}_{\\text{token}}(t)\\, dt \\]'}
      </div>

      <div style={{ fontSize: '1.25em' }}>
        {'\\[ \\varphi_i = \\omega_i \\times \\frac{\\text{cover pool}}{\\sum_{j \\in \\text{claimants}} \\omega_j} \\]'}
      </div>

      <div style={{ fontSize: '1.25em' }}>
        {'\\[ \\rho_i = \\min\\left(\\varphi_i,\\ \\text{loss}_i \\times \\kappa_{\\text{protocol}}\\right) \\]'}
      </div>

      <p>Where:</p>
      <ul>
        <li>{'\\(\\omega_i\\)'} — claimant {'\\(i\\)'}&apos;s USD8 History Score (weight)</li>
        <li>{'\\(\\varphi_i\\)'} — claimant {'\\(i\\)'}&apos;s share of the cover pool before cap</li>
        <li>{'\\(\\rho_i\\)'} — claimant {'\\(i\\)'}&apos;s final reimbursement amount</li>
        <li>{'\\(\\kappa_{\\text{protocol}}\\)'} — coverage factor for the hacked protocol (e.g. 0.8 for USD8, 0.7 for Lido)</li>
        <li>{'\\(\\text{weight}_{\\text{token}}\\)'} — admin-configurable weight per qualifying token (raw USD8 highest, staked / LP lower)</li>
        <li>{'\\(\\text{balance}_{\\text{token}}(t)\\)'} — claimant&apos;s balance of that token at time {'\\(t\\)'}</li>
        <li>{'\\(T\\)'} — score period from the configured starting block to the current block</li>
        <li>{'\\(\\text{loss}_i\\)'} — claimant&apos;s loss value in the incident</li>
      </ul>

      <p>
        Each holder&apos;s weight {'\\(\\omega_i\\)'} is the sum across qualifying tokens of their balance integrated over
        time, scaled by an admin-configurable weight per token. Raw USD8 weighs heaviest; staked USD8 and LP positions
        weigh lower.
      </p>

      <p>
        Your share {'\\(\\varphi_i\\)'} is your weight divided by the total weight of all claimants on the same incident,
        times the cover pool. The actual reimbursement {'\\(\\rho_i\\)'} is capped at your loss times the covered
        protocol&apos;s coverage factor {'\\(\\kappa_{\\text{protocol}}\\)'} — so you can never claim more than your covered
        loss, no matter how large your {'\\(\\varphi_i\\)'} is.
      </p>

      <p>
        This is the unique fair allocation in{' '}
        <a href="https://en.wikipedia.org/wiki/Cooperative_game_theory">cooperative game theory</a> — the only rule that
        satisfies all four Shapley axioms simultaneously (efficiency, symmetry, null-player, additivity). Pro-rata,
        time-weighted, and tier-based alternatives each violate at least one.
      </p>

      <p>
        The algorithm is <a href="https://github.com/Usd8-fi/Usd8-fi-usd8-cover-score">open-source</a> and deterministic.
        Anyone can run it locally and reproduce any holder&apos;s score against the chain.
      </p>

      <PageBreak />
      <H1 id="cover-pool-size-projection">Cover Pool Size Projection</H1>

      <p>We’re modeling pool size as a function of</p>
      <ul>
        <li>supply growth</li>
        <li>reserve yield at est 6.5%</li>
        <li>budget locked at 2.1% of reserve yield</li>
      </ul>

      <table className="cover-table">
        <tbody>
          <tr>
            <td><b>Year</b></td>
            <td><b>Y1</b></td>
            <td><b>Y2</b></td>
            <td><b>Y3</b></td>
            <td><b>Y4</b></td>
            <td><b>Y5</b></td>
          </tr>
          <tr>
            <td>USD8 Supply</td>
            <td>$5M</td>
            <td>$50M</td>
            <td>$500M</td>
            <td>$5B</td>
            <td>$37B</td>
          </tr>
          <tr>
            <td>% of USDT supply</td>
            <td>0.003%</td>
            <td>0.027%</td>
            <td>0.27%</td>
            <td>2.67%</td>
            <td>19.79%</td>
          </tr>
          <tr>
            <td>Collateral Yield (est. 6.5%)</td>
            <td>$325K</td>
            <td>$3.25M</td>
            <td>$32.5M</td>
            <td>$325M</td>
            <td>$2.41B</td>
          </tr>
          <tr>
            <td>Cover Pool Yield Budget (2.1%)</td>
            <td>$105K</td>
            <td>$1.05M</td>
            <td>$10.5M</td>
            <td>$105M</td>
            <td>$777M</td>
          </tr>
          <tr style={{ color: '#16a34a' }}>
            <td>Cover Pool size @ 15% APY</td>
            <td>$700K</td>
            <td>$7M</td>
            <td>$70M</td>
            <td>$700M</td>
            <td>$5.18B</td>
          </tr>
          <tr style={{ color: '#16a34a' }}>
            <td>Cover Pool size @ 30% APY</td>
            <td>$350K</td>
            <td>$3.5M</td>
            <td>$35M</td>
            <td>$350M</td>
            <td>$2.59B</td>
          </tr>
        </tbody>
      </table>

      <p>
        As shown in the estimation at Y5 if we achieve 20% Tether supply, we could unlock a cover pool size from 2.5-5
        Billion per year for Defi, which will be significant enough as an insurance primitive for the whote industry.
      </p>

      <PageBreak />
      <H1 id="passing-the-walkaway-test">Passing the Walkaway Test</H1>

      <p>
        Computing USD8 History Scores is critical for USD8. While relying on our front end works, that is not good enough,
        we are crypto natives, and we want to pass the{' '}
        <a href="https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html">Walkaway Test</a>.
      </p>

      <p>
        We are partnering with Brevis and using their ZK Coprocessor to independently compute USD8 History Scores. Users
        will be able to use Brevis&apos;s ProverNet to generate a cryptographic proof of their USD8 History Score based on
        their USD8 history. This proof can then be submitted directly to the USD8 payout contract onchain, which verifies
        it and processes the claim automatically.
      </p>

      <p>Now, even if our team disappears, USD8 payouts will still function independently and trustlessly.</p>

      <br />
      <img src="/assets/brevis_logo.png" width="200" alt="" />
      <PageBreak count={2} />
      <PageBreak />
    </>
  );
}
