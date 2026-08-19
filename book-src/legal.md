# Legal - Terms, Privacy and Risk Disclaimer

**Last updated: August 18, 2026**

Please read this page carefully before accessing usd8.fi, its documentation, interfaces, APIs, or any smart contracts, tokens, vaults, pools, claim mechanisms, settlement services, or other software associated with USD8.

## Terms

### 1. Acceptance of these terms

These terms govern your access to and use of:

- usd8.fi and its documentation;
- any USD8 web application or wallet interface;
- the USD8 Protocol smart contracts, including USD8, Treasury, sUSD8, Cover Pools, DeFi Insurance, Registry, and related adapters and strategies;
- insurance-score, pricing, settlement, TEE, RPC, and other hosted services made available in connection with USD8; and
- any other content, software, feature, or service that links to these terms.

Together, these are the **Services**. References to **USD8**, **we**, **us**, or **our** mean the person or entity operating the relevant website, interface, or hosted service, as applicable. Autonomous smart contracts and third-party services may operate independently from us.

By visiting, accessing, connecting a wallet to, or using any part of the Services, or by initiating any transaction through the Services, you confirm that you have read, understood, and agreed to these terms, the Privacy section, and the Risk Disclaimer. If you act for an organization, you confirm that you have authority to bind that organization. If you do not agree, do not access or use the Services.

We may update this page at any time. Changes become effective when posted with a revised “Last updated” date. Your continued use after an update constitutes acceptance of the updated terms.

### 2. Eligibility and compliance with law

You may use the Services only if:

- you are at least 18 years old and have legal capacity to enter into these terms;
- your access and activities are lawful in every jurisdiction applicable to you;
- you are not subject to sanctions or included on a restricted-person list maintained by the United Nations, United States, European Union, United Kingdom, or another applicable authority;
- you are not located, ordinarily resident, incorporated, or acting for a person in a jurisdiction where your use would be unlawful; and
- you are not using the Services to evade legal, regulatory, geographic, sanctions, or other restrictions.

Laws governing digital assets, stablecoins, lending, yield products, insurance-like arrangements, derivatives, securities, commodities, money transmission, sanctions, taxation, and consumer protection vary between jurisdictions and may change without notice. You are solely responsible for determining whether and how you may lawfully access and use the Services. If applicable law prohibits or restricts your use, you must not use the Services.

We may restrict, suspend, or terminate access to any hosted Service at any time, including based on location, legal requirements, sanctions risk, security concerns, misuse, or operational necessity. Such restrictions may not prevent direct interaction with independently deployed smart contracts.

### 3. Nature of USD8 and the Services

USD8 is a decentralized-finance protocol designed for mainnet use.

The protocol is designed around the following components:

- **USD8:** a token minted by depositing USDC through Treasury. In a healthy state, USD8 is intended to redeem for up to one USDC per USD8. If protocol reserves are insufficient, redemption may be pro rata and below one USDC per USD8.
- **Treasury:** holds idle USDC and may allocate reserves to strategies approved by the timelock. Strategy assets and idle USDC are counted toward reserves. Strategy returns may fund protocol revenue, sUSD8, Cover Pool rewards, or other configured receivers.
- **sUSD8:** an optional Morpho Vault V2 savings share token. Users deposit USD8 and receive vault shares. Under the current design, USD8 remains idle in the savings adapter, and returns depend on Treasury-funded revenue released subject to the vault's configured rate limit. Returns are variable and are not guaranteed.
- **Insurance Score:** a non-transferable accounting value derived from eligible USD8 and sUSD8 holdings. Score is computed from public blockchain history using off-chain services and may be subject to maturity, rate, availability, and spending rules.
- **DeFi Insurance mechanism:** an on-chain, rules-based mechanism through which eligible users may submit claims involving configured insured tokens. Claims depend on configured conditions, score, historical holdings, pricing data, deadlines, settlement, available Cover Pool capital, and claimant acceptance.
- **Cover Pools:** separate ERC-4626 vaults whose depositors retain exposure to a designated asset, may receive variable USD8 rewards, and intentionally place principal at risk to fund eligible claim payouts.

The current mechanics, parameters, supported assets, roles, contract addresses, and deployment status may change. The smart-contract code and on-chain state control in the event of any conflict with explanatory content on the website or in the documentation.

### 4. Non-custodial operation and blockchain transactions

The interface is designed to be non-custodial. We do not request or possess your private keys or seed phrase and cannot initiate transactions from your wallet without your authorization. Wallet software, RPC providers, blockchain networks, smart contracts, and other infrastructure are provided or operated by third parties or decentralized networks.

You are solely responsible for:

- securing your wallet, device, private keys, seed phrase, authentication methods, and backups;
- verifying the network, contract address, token, recipient, calldata, approvals, permissions, amounts, slippage, fees, and transaction details before signing;
- maintaining enough native tokens to pay network fees;
- revoking approvals you no longer want;
- protecting yourself from phishing, impersonation, malicious approvals, compromised frontends, and address poisoning; and
- all transactions submitted by your wallet, whether authorized by you or by someone who gained access to it.

Blockchain transactions may be irreversible. We generally cannot cancel, reverse, recover, or refund a transaction or restore lost credentials or assets.

### 5. No financial, legal, tax, insurance, or other advice

The Services are provided for informational and technical purposes. Nothing in the Services constitutes financial, investment, legal, tax, accounting, insurance, cybersecurity, or other professional advice; a recommendation; an offer or solicitation to buy or sell an asset; or a promise of any outcome.

Descriptions of yield, annual percentage yield, coverage, value, collateral, reserves, risk, historical performance, audits, or protocol behavior are estimates or explanations only. They are not guarantees. You must conduct your own investigation and consult appropriately qualified advisers before acting.

No communication, documentation, interface display, contribution, administrative action, or support response creates a fiduciary, advisory, brokerage, agency, partnership, trust, insurer-policyholder, or other special relationship between you and us.

### 6. The DeFi Insurance mechanism is not traditional insurance

The terms **insurance**, **insured**, **coverage**, and **claim** describe protocol mechanics. They do not mean that USD8, a contributor, a Cover Pool, or an interface operator is a licensed insurer, insurance intermediary, guarantor, surety, or underwriter. Using or holding USD8 or sUSD8 does not create an insurance policy or a contract requiring anyone to indemnify you.

The DeFi Insurance mechanism is an experimental on-chain primitive. Although aspects of its operation or economic outcome may resemble traditional insurance, it is inherently different: it is governed by smart-contract rules, configured parameters, limited Cover Pool capital, off-chain computation, and user actions rather than a conventional insurance policy, regulated insurer, underwriting process, or guaranteed contractual indemnity.

The protocol does not guarantee that:

- any token, protocol, position, incident, exploit, depeg, loss, or event will be covered;
- an incident will satisfy the configured price-drop, timing, holding, score, oracle, or settlement conditions;
- a claim will be valid, settled, finalized, accepted, or paid;
- settlement data, TEE output, signatures, Merkle proofs, price feeds, or historical blockchain data will be available or correct;
- you will meet every filing, cancellation, proof, settlement, or acceptance deadline;
- your Insurance Score will be available, sufficient, correctly displayed, or worth any particular amount;
- Cover Pools will contain enough assets or that configured payout limits will remain unchanged; or
- a payout will equal your loss, the value of escrowed assets, a displayed estimate, a maximum coverage percentage, or any other amount.

Claimant allocations may be reduced by score allocation, pool-level limits, token-level limits, insufficient pool capital, valuation methods, rounding, or other configured rules. The incident's gross Cover Pool budget includes a protocol share; once a claimant's Merkle-proven net payout is fixed, the current contract pays that amount to the claimant and debits the protocol share separately from Cover Pool capital. Coverage generally concerns loss in an insured token relative to its configured immediate underlying; loss in that underlying may not itself qualify. Eligible claimants who accept a payout surrender the eligible portion of escrowed insured tokens, spend Insurance Score, and consume Boosters; excess escrow is returned under the current design. Claimants who do not complete required actions before deadlines may lose the ability to receive a payout.

You must not rely on USD8 as a substitute for regulated insurance, diversification, due diligence, risk management, or maintaining sufficient assets to absorb a total loss.

### 7. Prohibited conduct

You must not use the Services to:

- violate any law, regulation, court order, sanctions program, or third-party right;
- launder money, finance terrorism, evade taxes or sanctions, or conceal proceeds of unlawful activity;
- defraud, deceive, manipulate, harass, threaten, or harm another person;
- submit a knowingly false, misleading, duplicated, manipulated, or abusive claim;
- manipulate prices, oracles, markets, governance, settlement inputs, blockchain history, or protocol accounting;
- exploit, attack, disrupt, overload, introduce malware into, or obtain unauthorized access to any website, API, server, TEE, wallet, smart contract, or third-party service;
- bypass access controls, rate limits, geographic restrictions, or security measures;
- infringe intellectual-property, privacy, publicity, or other rights; or
- use the Services in any manner that exposes us, contributors, service providers, or other users to legal or security risk.

Good-faith security research is permitted only when expressly authorized by, and conducted in accordance with, USD8's published security or bug-bounty policy. Do not exploit or retain user assets outside an expressly authorized security process.

### 8. Third-party services and content

The Services depend on or link to third parties, potentially including wallet providers, Ethereum and other blockchain networks, RPC and API providers, block explorers, USDC and its issuer, Morpho, ERC-4626 strategies, Chainlink and other oracle providers, Amazon Web Services and enclave infrastructure, GitHub, Google Analytics, bridges, decentralized exchanges, and other protocols.

We do not control and are not responsible for third-party code, assets, services, terms, privacy practices, uptime, solvency, security, accuracy, or conduct. A link, integration, token listing, strategy approval, audit reference, or mention is not an endorsement or warranty. Your use of a third party is governed by its own terms and is at your own risk.

### 9. Intellectual property and software licenses

Names, logos, visual assets, site content, and other materials may be protected by intellectual-property laws. Except where a separate license applies, you may use the Services only for lawful personal or internal purposes and may not misrepresent affiliation with or endorsement by USD8.

Source code is governed by the license contained in its repository. The USD8 Core repository currently uses the Business Source License 1.1, with the stated Change Date and Change License identified there. Source availability does not grant rights beyond the applicable license and does not constitute a warranty.

### 10. Taxes

You are solely responsible for determining, reporting, withholding, collecting, and paying all taxes, duties, levies, and other governmental charges arising from your access, holdings, transfers, rewards, yield, claims, payouts, disposals, or other activities. We do not provide tax advice or undertake tax reporting for you except where legally required.

### 11. Suspension, changes, and termination

Hosted Services may be changed, paused, restricted, discontinued, or unavailable at any time without notice. Protocol parameters, supported assets, strategies, scoring rates, coverage caps, pool limits, fees, roles, signers, oracles, and other settings may change through authorized administration or timelock processes.

During beta, specified contracts may be upgradeable, and authorized roles may correct or void settlement roots as described in [Transparency](./transparency.md). Ending beta removes specified upgrade and correction powers but does not remove every administrative or timelock power.

Terminating or restricting the hosted interface may not terminate independently deployed smart contracts. You are responsible for understanding whether and how you can interact directly with them.

### 12. Disclaimers of warranties

TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES ARE PROVIDED **“AS IS,” “AS AVAILABLE,” AND “WITH ALL FAULTS.”** WE DISCLAIM ALL EXPRESS, IMPLIED, AND STATUTORY WARRANTIES, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, SECURITY, AVAILABILITY, QUIET ENJOYMENT, AND THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.

WE DO NOT WARRANT THAT CODE HAS BEEN FULLY AUDITED; THAT ANY AUDIT, TEST, REVIEW, FORMAL-VERIFICATION RESULT, MONITORING PROCESS, OR SECURITY MEASURE IS COMPLETE; THAT DEFECTS WILL BE CORRECTED; OR THAT ANY ASSET, RESERVE, STRATEGY, VAULT, POOL, OR THIRD PARTY WILL REMAIN SOLVENT, LIQUID, AVAILABLE, OR AT ANY PARTICULAR VALUE.

Some jurisdictions do not allow certain warranty exclusions, so some exclusions may not apply to you.

### 13. Limitation of liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, USD8 CONTRIBUTORS, WEBSITE OR INTERFACE OPERATORS, DEVELOPERS, ADMINISTRATORS, SIGNERS, SERVICE PROVIDERS, AFFILIATES, OFFICERS, EMPLOYEES, CONTRACTORS, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; LOSS OF ASSETS, TOKENS, PRIVATE KEYS, DATA, REVENUE, PROFITS, BUSINESS, OPPORTUNITY, GOODWILL, OR EXPECTED SAVINGS; OR DAMAGES ARISING FROM SMART CONTRACTS, CLAIMS, COVER POOLS, STRATEGIES, ORACLES, TEES, GOVERNANCE, NETWORKS, THIRD PARTIES, SECURITY INCIDENTS, REGULATORY ACTION, OR YOUR INABILITY TO USE THE SERVICES.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AGGREGATE LIABILITY OF ALL SUCH PARTIES FOR ALL CLAIMS RELATING TO THE SERVICES WILL NOT EXCEED THE GREATER OF (A) USD 100 OR (B) THE AMOUNT YOU PAID DIRECTLY TO THE RELEVANT WEBSITE OR INTERFACE OPERATOR FOR THE SERVICES DURING THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO LIABILITY.

These limitations apply regardless of the legal theory and even if a party was advised that damages were possible. They do not exclude liability that cannot lawfully be excluded.

### 14. Indemnification

To the maximum extent permitted by law, you agree to defend, indemnify, and hold harmless the parties listed in Section 13 from claims, liabilities, damages, judgments, losses, costs, and reasonable legal fees arising from your use or misuse of the Services, violation of these terms or applicable law, infringement of another person's rights, or transactions initiated through your wallet. We may control the defense of an indemnified matter, and you agree to cooperate with that defense.

### 15. Disputes and time limit for claims

Before starting a formal proceeding concerning the Services, you agree to send a written description of the dispute and requested relief to [info@usd8.fi](mailto:info@usd8.fi) and allow 30 days for an informal resolution attempt, except where urgent injunctive relief is reasonably necessary.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, EACH PARTY MAY BRING CLAIMS ONLY IN ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN A CLASS, COLLECTIVE, CONSOLIDATED, OR REPRESENTATIVE ACTION. EACH PARTY WAIVES A JURY TRIAL TO THE MAXIMUM EXTENT THAT WAIVER IS LAWFUL.

To the maximum extent permitted by law, any claim concerning the Services must be filed within one year after the event giving rise to the claim; otherwise, the claim is permanently barred. Nothing in this section limits a non-waivable limitation period or procedural right.

### 16. General terms

These terms and any incorporated notices are the entire agreement concerning the Services. If a provision is held invalid or unenforceable, it will be enforced to the maximum lawful extent and the remaining provisions will continue. Failure to enforce a provision is not a waiver. You may not assign your rights or obligations without prior written consent; we may assign rights and obligations in connection with a reorganization, transfer, or operation of the Services. Sections intended by their nature to survive termination will survive.

Nothing in these terms limits non-waivable rights available under applicable law. Questions about these terms may be sent to [info@usd8.fi](mailto:info@usd8.fi).

## Privacy

### 1. Scope

This Privacy section explains the limited information USD8 currently collects when you visit its website, documentation, or interface. USD8 currently collects usage information only through Google Analytics. Public blockchains and independent third parties may process information under their own rules and privacy notices; their processing is not collection by USD8.

### 2. Information we may process

USD8 currently processes only **website analytics data** through Google Analytics. Depending on Google's operation and configuration, this may include IP address, approximate location derived from IP, browser and device type, operating system, language, referring page, pages viewed, access times, interactions, cookies, and similar identifiers.

USD8 does not currently maintain user accounts or intentionally collect or retain names, email addresses, wallet private keys, seed phrases, wallet balances, transaction histories, claim histories, or other protocol activity as user-profile data. Never send us a private key or seed phrase.

The interface may request public blockchain information or send a public wallet address or chain identifier to an RPC, wallet, blockchain, or other service needed to display protocol information. USD8 does not currently retain that information as a user profile. Those independent services may process it under their own privacy notices.

### 3. How information may be used

Google Analytics information is used to understand website and documentation usage, measure performance, identify errors, and improve the Services. Where applicable, this processing may be based on consent or legitimate interests in understanding and improving the Services. USD8 does not sell personal information for money.

### 4. Cookies, analytics, and choices

Google Analytics loads by default when application or documentation pages open. Loading begins without a prior choice in the current interface and may transmit the visitor's IP address, browser or device information, page URL, referrer, timestamps, interactions, and identifiers to Google. Google may place or read cookies or similar identifiers and process this data under its own [Privacy Policy](https://policies.google.com/privacy), including on servers outside your country.

You can limit cookies through your browser settings, use browser privacy controls, or use Google's [Analytics opt-out tools](https://tools.google.com/dlpage/gaoptout). Blocking cookies or browser storage may affect functionality. Wallet providers and other third parties may provide separate privacy settings.

### 5. How information may be shared

Analytics information is shared with Google as the analytics provider and may be disclosed when legally required. USD8 does not currently share a separate user-profile database because it does not maintain one.

Public blockchain information is independently public and can be viewed, copied, analyzed, and shared by anyone. We cannot control downstream use of public blockchain data.

### 6. Third-party processing

Google processes analytics information under its own privacy notice. Hosting providers, wallet providers, RPC providers, blockchain networks, block explorers, and linked sites or protocols may also independently process information when you use their services. Their processing is governed by their own privacy notices and is not controlled by USD8.

### 7. International transfers and retention

Google may process analytics information in countries other than where you live, which may provide different levels of data protection. Analytics information is retained according to the applicable Google Analytics settings and Google's policies. USD8 does not currently maintain a separate database of visitor personal information. Public blockchain records are generally permanent and cannot be altered or deleted by us.

### 8. Security

We may use reasonable safeguards, but no website, analytics service, or transmission method is completely secure. We cannot guarantee that analytics information will never be lost, accessed, altered, disclosed, or destroyed without authorization.

### 9. Your choices and rights

Depending on your location, you may have rights concerning analytics information, including access, deletion, restriction, objection, or withdrawal of consent where processing relies on consent. Because USD8 does not maintain user accounts or a separate visitor database, we may have limited ability to identify analytics information as belonging to a particular person.

Requests may be sent to [info@usd8.fi](mailto:info@usd8.fi). You may also use Google's analytics controls or complain to the data-protection authority applicable to you. We will never ask for a private key, seed phrase, or wallet transaction to process a privacy request.

### 10. Children and changes

The Services are not intended for anyone under 18, and we do not knowingly collect personal information from children. If you believe a child provided information, contact us.

We may update this Privacy section as the Services, providers, or laws change. The revised version becomes effective when posted with an updated date.

## Risk Disclaimer

Using USD8 involves substantial risk and can result in partial or total loss. The following list is not exhaustive. You should use only assets you can afford to lose completely.

### USD8 and Treasury risks

- **Reserve loss:** Treasury may deploy USDC into approved yield strategies. A strategy can lose principal through borrower default, bad debt, liquidation, market dislocation, faulty accounting, governance action, operational failure, or smart-contract exploit.
- **Below-par redemption:** Minting may occur at a 1:1 USDC-to-USD8 value, but one USD8 is not guaranteed always to redeem for one USDC or to trade at one dollar. If reserves fall below USD8 supply, redemption may become pro rata below par.
- **USDC risk:** USD8 depends on USDC. USDC may depeg, be frozen, become unavailable, lose issuer or banking support, face redemption restrictions, or be affected by legal, operational, custody, or reserve events.
- **Liquidity risk:** Treasury or strategies may be unable to return sufficient USDC when requested. Transactions may be delayed, limited, reverted, or processed at an unfavorable value.
- **Strategy risk:** Approval by the timelock—and subsequent allocation or withdrawal decisions by an administrator or the timelock—is not a guarantee that a strategy is safe. Strategy tokens, integrations, withdrawal queues, fees, caps, and valuations may behave unexpectedly.
- **Yield risk:** Treasury yield may be lower than displayed or expected, stop entirely, become negative after losses or costs, or be diverted among configured receivers. Historical or estimated yield does not predict future results.

### sUSD8 risks

- sUSD8 is a Morpho Vault V2 share token, not a bank deposit or savings account.
- Its exchange rate, liquidity, and returns depend on USD8, Morpho Vault V2, the idle-liquidity savings adapter, Treasury revenue, configured rate limits, accounting, and authorized vault configuration.
- Under the current design, deposited USD8 is not deployed by the savings adapter into an external lending market. Nevertheless, USD8 impairment, incorrect accounting, adapter or vault defects, allocation or rate changes, and governance actions can reduce value or delay withdrawals.
- Rewards and APY are variable and may be zero or negative after losses. Principal and profit are not guaranteed.
- Loss or impairment of USD8 also affects sUSD8.

### DeFi Insurance and claim risks

- The DeFi Insurance mechanism is not a traditional insurance policy and does not guarantee compensation.
- Token eligibility, score rates, maturity periods, claim bonds, price-drop thresholds, holding requirements, coverage percentages, pool limits, fees, oracles, phase durations, and other parameters may change.
- A real economic loss may not satisfy the protocol's technical incident definition. In particular, loss in an underlying asset may not qualify as loss in a wrapper relative to that underlying.
- Claims depend on public historical data, finalized blocks, price samples, oracles, off-chain computation, TEE signatures, Merkle roots, proofs, relayers, and on-chain verification. Missing, incomplete, inconsistent, delayed, reorganized, or manipulated data may prevent or alter a claim.
- During beta, authorized parties may correct or void settlement roots. A compromised, unavailable, misconfigured, or malicious administrator, timelock, signer, or TEE may cause delay, incorrect settlement, or loss.
- Claim windows and acceptance windows are time-limited. Congestion, unavailable infrastructure, insufficient gas, user error, or late action may prevent participation or payout.
- Payouts compete for limited Cover Pool capital and may be materially less than losses or displayed maximums. No claimant is entitled to a minimum payout.
- Accepting a payout may irreversibly transfer or forfeit the eligible portion of escrowed insured assets, spend Insurance Score, and consume Boosters. Excess escrow is returned under the current design. Declining or failing to accept may result in no payout.
- Bonds may be forfeited under configured conditions. Transaction fees and other costs may not be recoverable even when a claim fails or is declined.

### Cover Pool risks

- **Cover Pool deposits are high-risk loss-absorbing capital.** They are designed to be used to pay claims. A depositor may lose a substantial portion of principal in a single incident and may lose all principal through one or more incidents, market losses, asset failure, or technical failure.
- A per-incident payout limit does not cap cumulative losses across multiple incidents and may be changed by an authorized role.
- Pool shares are exposed to the deposited asset's price, liquidity, custody or wrapper mechanics, slashing, depeg, protocol, and smart-contract risks. USD8 rewards do not protect principal or offset losses.
- Deposit caps, rewards, APY, payout limits, and insured-token configurations are changeable and are not promises.
- Exit requests are not immediate. Under the current design, requested shares are escrowed, cannot be cancelled, stop earning rewards, and remain exposed to claims until the relevant exit epoch is settled.
- Incidents can freeze deposits or delay settlement of exits. Network congestion, missing settlement calls, parameter changes, or contract failure can further delay withdrawal.
- A settled withdrawal claim may still be exposed to token-transfer, liquidity, smart-contract, or blockchain risk before completion.

### Smart-contract and software risks

- Smart contracts, websites, APIs, scripts, and cryptographic systems may contain known or unknown bugs, design defects, faulty assumptions, integration errors, upgrade errors, or vulnerabilities.
- Audits, tests, formal verification, code review, bug bounties, and open-source availability reduce some risks but cannot prove the absence of defects or guarantee safety.
- Upgradeable contracts or beacons may be changed, intentionally or accidentally, while upgrade authority remains. Even immutable code may depend on mutable configuration and external contracts.
- Frontend displays, simulations, estimates, balances, APYs, scores, transaction status, and documentation may be stale, rounded, incomplete, incorrect, or inconsistent with on-chain state.
- Malicious websites, compromised DNS, dependencies, build systems, browser extensions, wallets, devices, or supply chains may cause users to sign harmful transactions or disclose information.

### Oracle, TEE, infrastructure, and third-party risks

- Incorrect, stale, delayed, unavailable, or manipulated price feeds may affect incidents, valuations, redemptions, strategies, claims, and payouts.
- TEE hardware, attestation, signer keys, runtime code, deployment configuration, cloud infrastructure, or settlement algorithms may fail, be compromised, or produce unavailable or disputed results.
- RPC providers, indexers, score services, relayers, APIs, hosting providers, AWS, Morpho, Chainlink, USDC, wallets, bridges, exchanges, and other dependencies may fail or change their services or terms.
- Public networks may experience congestion, high fees, reorganizations, forks, validator attacks, censorship, downtime, or changes in consensus rules.
- Transactions may be subject to front-running, sandwich attacks, maximal extractable value, slippage, failed execution, or unexpected ordering.

### Governance and operational risks

- Timelock and administrator roles are trusted by design and can exercise the powers described in [Transparency](./transparency.md). Compromise, collusion, negligence, key loss, operational error, or malicious action can cause loss.
- The contracts do not prevent every unsafe or malicious configuration by a trusted role.
- Pauses and emergency actions may protect some functions while preventing access, minting, redemption, deposits, claims, settlement, or withdrawals.
- Ending beta mode does not remove all privileged roles or external dependencies. Cover Pool implementation ownership must be addressed separately.
- Development plans, decentralization goals, launch timelines, supported assets, and migration plans may change or never be completed.

### Market, regulatory, and tax risks

- USD8, sUSD8, Cover Pool shares, Boosters, claim rights, or related activities may be characterized differently across jurisdictions, including as stablecoins, securities, commodities, derivatives, collective investments, lending products, insurance, or regulated financial services.
- Laws or enforcement actions may restrict access, require registration or licensing, impose reporting or identity checks, freeze assets, affect counterparties, or make a feature unavailable.
- Markets may be volatile or illiquid. USD8, sUSD8, pool shares, insured tokens, collateral, or reward assets may lose some or all value.
- You may incur tax liabilities from minting, redemption, rebasing or vault yield, rewards, claims, payouts, transfers, or disposals, even if you later lose the assets.

### No guarantee or bailout

No contributor, administrator, operator, Cover Pool depositor, service provider, or other person promises to reimburse you, restore a peg, make reserves whole, process a claim manually, reverse a transaction, maintain liquidity, continue rewards, or rescue the protocol. There is no deposit insurance, government guarantee, traditional insurance guarantee, or lender of last resort.

By using the Services, you acknowledge these risks, accept full responsibility for your decisions and transactions, and assume the risk of partial or total loss.