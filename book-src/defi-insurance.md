# DeFi Insurance

- USD8 & sUSD8 holders get insurance score every block
- insurance score can be used to file claims for a range of insured Defi tokens, including USD8 and sUSD8
- the more score, the more payout. Up to 80% value, capped by Cover Pool limit
- score is non transferrable and never expire
- payout funds come from the [Cover Pools](./cover-pools.md)

<div class="example-box">
<p>E.g. assume Aave aUSDC is an insured token with 80% max coverage</p>
<ol>
<li>aUSDC to USDC drops from 1 to 0.3</li>
<li>user with insurance score get up to 0.8 USDC in value from the Cover Pool asset, in exchange for their aUSDC</li>
</ol>
</div>

## Claim Process

Claim is a 3-step process combine both onchain and offchain(TEE) process, it takes around 9-12 days during beta and 6-9 days after beta. It is important to not miss any deadlines. 


### 1 File a Claim

Anyone can file a claim if
1. an insured token's adjacent 24hr TWAP prices dropped >20% in the past 1-6 days.
2. claimer has insurance score available to spend (min 7 days old)
3. claimer held the insured token for min 7 days before the price drop

There is also a 10 USD8 bond, fully refunded if condition 2 and 3 are satisfied. First claimer needs to provide a rough time when the price drop happened, our TEE will ping down the exact block.


Important - claim window closes 3 days after the first valid claim, after that no claims can be filed for this insured token.


### 2 Settle Claims
Anyone can settle a claim by submitting an attestation from the TEE which uses open-sourced algorithm to compute every claimers insurance score and payout. Results are fully verifiable. 

Individual payout amount is calculated based on

1. claimer's insurance score vs total score from all claimers
2. Cover Pool limit
3. max coverage of the insured token

<div class="example-box">
<p>E.g. 2 claimers, A has 100 score and B has 200 score, and they both escrowed $500 worth of insured tokens with a max coverage of 80%. Current Cover Pool has $2250 worth of assets.</p>
<ol>
<li>the Cover Pool limit is current set to 50%, so total $1125 can be used. 80% of which is the budget to cover claims which is $900. A has half score as B, A can claim up to $300 and B $600</li>
<li>Both A and B escrowed $500 worth of insured tokens, at max coverage of 80%, their claims are capped at $400 for their loss.</li>
<li>A will get $300 payout, B gets $400</li>
</ol>
</div>

Settlement window opens for max 3 days, as soon as its settled user can finalize their payouts. If not settled, claimers can withdraw their escrowed tokens, no insurance scores will be spent.

During beta - admin has an extra 3 days after settlement to verify and dispute with a TEE signed new settlement. This is a safety measure to ensure no malicious settlement bugs exist.


### 3 Finalize Payouts
During this process claimers has 3 days to accept the payout, if they choose to accept, they will

1. forfeits their escrowed insured token and insurance score
2. receives Cover Pool asset(s) with total USD value matching the entitled payout

If claimers choose to not accept the payout, they can withdraw escrowed tokens and keep their insurance score.

No matter claimers choose to finalize or not, bond will be returned as long as bond conditions are met.

Important - payout window is 3 days, after that all pending claims are considered not accepted, claimers can withdraw their escrowed tokens.

## TEE
USD8 uses an amazon secure enclave running open sourced algorithm offchain to compute and sign payouts. Anyone can trigger the TEE and submit the result onchain which will verify the TEE's signature before accepting the final result. Since the algorithm is open sourced, the result is publically verifiable by anyone. 

We plan to shift to a zk-coprocessor network like [Brevis](https://brevis.network/) in the future to pass the [walkaway test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).


## Boosters
<img src="../assets/booster.png" width="300px" /><br/><br/>
[Boosters](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) are NFTs that can be burnt when filing a claim to add a 1% boost to your total insurance score. You can stack multiple Boosters. Boosters are not for sale, they are only minted to early stage users who help USD8 grow. Follow our [X](https://x.com/usd8_fi) and [Telegram](https://t.me/+e84i2oYk1ao1MTk1).

Enter an Ethereum address to check Boosters

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Check</button>
<div id="booster-result" class="booster-result"></div>
</div>


