# Cover Pool <span class="coming-soon-pill">Building</span>
<br/><img src="/assets/coverPool.png" width="700px" /><br/><br/>

The Cover Pool is a high yield vault consists of multiple assets, the yield comes from protocol revenue. Anyone can deposit into the pool at any time; however, withdrawals are subject to a 14-day cooldown period(while still accrue yield).

Assets in the Cover Pool are not protected by USD8 and might be deployed to cover losses from protected Defi protocols. 

Depositors should be aware of the risk associated before depositing.
<br/><br/><br/><br/>
# Covered DeFi Protocols<br/>

USD8, together with our security partners, independently vets and selects DeFi protocols that demonstrate the strongest security practices. Coverage is offered on a per-LP-token basis, depending on our security assessment, and is limited to a percentage of potential losses, capped by the Cover Pool balance.
<br/><br/><br/><br/><img src="/assets/coveredProtocols.png" width="700px" /><br/><br/>

Once coverage is offered, the Cover Pool will accept the specified LP token for claims at any time, permissionlessly. Claimants receive a proportional mix of assets matching the Cover Pool’s composition.
<br/><br/><br/><br/>

Planned coverage (Eth mainnet)

<style>
    .cover-table {
        font-size: 12px;
        border-collapse: collapse;
        width: 100%;
    }

    .cover-table td {
        padding: 8px 12px;
    }

    .cover-table tr:nth-child(odd) {
        background-color: #1A1A1A;
    }

    .cover-table tr:nth-child(even) {
        background-color: #1A1A1A;
    }
</style>

<table class="cover-table">
    <tr>
        <td>Brand</td>
        <td>Token Accepted</td>
        <td>Address</td>
        <td>Reimbursement(upto)</td>
    </tr>
    <tr>
        <td><img src="assets/usd8Logo.svg" width="40px" /></td>
        <td>Usd8</td>
        <td>TBD</td>
        <td>0.8 USDC</td>
    </tr>
    <tr>
        <td><img src="assets/usd8Logo.svg" width="40px" /></td>
        <td>Usd8 Protected Savings sUsd8 </td>
        <td>TBD</td>
        <td>0.8 Usd8</td>
    </tr>
    <tr>
        <td><img src="assets/aavelogo.svg" width="40px" /></td>
        <td>Aave Savings Gho sGHO</td>
        <td>0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d<br/> impl 0x50f9d4e28309303f0cdcac8af0b569e8b75ab857</td>
        <td>0.8 GHO</td>
    </tr>
    <tr>
        <td><img src="https://cdn.jsdelivr.net/gh/curvefi/curve-assets/branding/logo.png" width="40px" /></td>
        <td>Curve Savings scrvUSD</td>
        <td>0x0655977feb2f289a4ab78af67bab0d17aab84367<br/> impl 0xd8063123bba3b480569244ae66bfe72b6c84b00d</td>
        <td>0.7 crvUSD</td>
    </tr>
    <tr>
        <td><img src="assets/lidoLogo.svg" width="40px" /></td>
        <td>Lido stETH</td>
        <td>0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84<br/> impl 0x17144556fd3424edc8fc8a4c940b2d04936d17eb</td>
        <td>0.7 Eth</td>
    </tr>
    <tr>
        <td><img src="https://pbs.twimg.com/profile_images/1828469202753122304/i8YRkB4A_400x400.jpg" width="40px" /></td>
        <td>Sky Savings sUSDS</td>
        <td>0xa3931d71877c0e7a3148cb7eb4463524fec27fbd<br/> impl 0x4e7991e5c547ce825bdeb665ee14a3274f9f61e0</td>
        <td>0.7 USDS</td>
    </tr>
        <tr>
        <td><img src="https://docs.yieldnest.finance/~gitbook/image?url=https%3A%2F%2F2873068466-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FDyxbBTdzhJqQAdVgDB8k%252Fuploads%252FzN9OBqA2oJbHWzVrvxDD%252FLogomark%2520Gold%2520on%2520Dark.png%3Falt%3Dmedia%26token%3Dc4a4a84c-ca82-4cd2-8794-cf298a392d80&width=768&dpr=2&quality=100&sign=139c44cd&sv=2" width="40px" /></td>
        <td>Yieldnest ynETHx</td>
        <td>0x657d9ABA1DBb59e53f9F3eCAA878447dCfC96dCb<br/> impl 0x9C1713BC42dCF621038F4016664fFAB096A05410</td>
        <td>0.6 Eth</td>
    </tr>
    </tr>
        <tr>
        <td><img src="assets/oethLogo.svg" width="40px" /></td>
        <td>Origin OETH</td>
        <td>0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3<br/> impl 0xD86756dBb01e75A11AaDaCB75c8495759ED92033</td>
        <td>0.6 Eth</td>
    </tr>
 <!--  </tr>
        <tr>
        <td>Liquity sBOLD</td>
        <td>0x50Bd66D59911F5e086Ec87aE43C811e0D059DD11</td>
        <td>50%</td>
    </tr> -->
</table>

<br/><br/><br/><br/>
# Claiming
<br/><img src="/assets/claiming.png" width="700px" /><br/><br/>

1. To start a claim, user transfers the protected LP token to the Cover Pool. Our front end will also calculate user's cover scores based on historical USD8 usage during this process and submit it on chain.
2. The claim enters a 10-day window where others can join. After 10 days, that LP token is removed from the covered list and no new claims are accepted.
3. Claimants can withdraw their reimbursement. The amount is calculated from total claims, each claimant’s cover score*, and the current Cover Pool balance. Payouts will match the Cover Pool’s asset mix.

After a claim, the protected LP tokens forfeited by claimers becomes the property of Usd8 protocol.
<br/><br/><br/><br/>
# Cover Score 

Cover Score is calculated based on your USD8 usage history — how much you’ve held and for how long. More USD8 held for longer increases the score, this includes USD8 LSTs like USD8 savings.

Cover Socre is computed off-chain with an open sourced algorithm based on [Shapley value](https://en.wikipedia.org/wiki/Shapley_value), signed by the USD8's front end, and verified on-chain during a claim. Anyone can recalculate and validate every user's score. 

Cover scores reset after a successful claim. 

#### Cover Score Algorithm

```
ωᵢ = Σ_token weight_token × ∫₀ᵀ balance_token(t)
   
dtφᵢ = ωᵢ × pool_reserve / Σⱼ ωⱼ
```

Each holder's weight `ωᵢ` is the sum across qualifying tokens of their balance integrated over time, scaled by an admin-configurable weight per token. Raw USD8 weighs heaviest; staked USD8 and LP positions weigh lower. Your share `φᵢ` is proportional to your weighted total.

This is the unique fair allocation in [cooperative game theory](https://en.wikipedia.org/wiki/Cooperative_game_theory) — the only rule that satisfies all four Shapley axioms simultaneously (efficiency, symmetry, null-player, additivity). Pro-rata, time-weighted, and tier-based alternatives each violate at least one.

The algorithm is [open-source](https://github.com/Usd8-fi/Usd8-fi-usd8-cover-score) and deterministic. Anyone can run it locally and reproduce any holder's score against the chain.


<br/><br/><br/><br/>
# Passing the Walkaway Test

Computing Cover Scores is critical for Usd8. While relying on our front end works, that is not good enough, we are crypto natives, and we want to pass the [Walkaway Test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).

We are partnering with Brevis and using their ZK Coprocessor to independently compute Cover Scores. Users will be able to use Brevis's ProverNet to generate a cryptographic proof of their Cover Score based on their Usd8 history. This proof can then be submitted directly to the Usd8 payout contract onchain, which verifies it and processes the claim automatically.

Now, even if our team disappears, Usd8 payouts will still function independently and trustlessly.

<br/><img src="/assets/brevis_logo.png" width="200px" /><br/><br/>

<br/><br/><br/><br/>
