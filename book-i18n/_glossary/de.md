# German (de) glossary — USD8 docs + app UI

Style: formal "Sie"; natural product German, translated by meaning, not word for word (clauses may be reordered, sentences merged or split; facts, numbers, conditions and caveats stay identical). Keep USD8, sUSD8, token symbols (USDC, wstETH, aUSDC …), protocol/company names (Aave, Morpho, Chainlink, OpenZeppelin, Brevis, GitHub), TEE, contract/function names (Registry, Treasury, DefiInsurance, endBetaMode), addresses and code in English. Contract names in the Addresses table stay English (timelock-queue.js reads them).

Typography: numbers come from code and keep English decimal points (0.8, never 0,8) and no thousands separators. Percent with a no-break space (U+00A0): "20 %"; same inside "z. B." and "p. a.". Dashes: spaced en dash " – ". Quotes: „…“. Amounts in prose: "500 USD" (not "$500"). Ranges: "9–12 Tage".

## Key decisions

- **APY → "Rendite p. a."** in labels, **"Rendite"** in prose. Reason: it is the established German finance term (banks, brokers, Tagesgeld) and readable for every user; "p. a." keeps the annualisation explicit, so a 30-day figure is never misread as a 30-day return. "APY" is understood in crypto circles but reads as an untranslated leftover in German UI copy.
- **7D / 30D → "7T" / "30T"** in the small window toggle (the German chart-toggle convention: 1T, 1W, 1M, 1J). Single label: "Rendite p. a. (30T)"; long form in tooltips: "Basis 30 Tage".
- **TVL stays "TVL"**: universal DeFi metric, used as-is in German crypto media; no short native equivalent.
- **Claim → "Antrag"** (stellen, Antragsteller, Antragskaution, Antragsfrist). "Anspruch einreichen" was a calque; Germans "stellen einen Antrag" and "beantragen eine Erstattung". "Anspruch" is kept only where it means entitlement ("keinen Anspruch auf eine Auszahlung") and in "Anspruchsprüfung" (claim verification service — the check whether the claim is valid).
- **Cover Pool stays "Cover Pool"** (der, pl. Cover Pools; compounds "Cover-Pool-Limit"): product/contract name shown on-chain and in the Addresses table; German DeFi users know "Pool". "Deckungspool" would be a coined word nobody searches for.
- **White Hat Economy, Booster, Timelock stay English**: proper program/NFT/contract names; "Booster" and "Timelock" are common loanwords.
- **Private-beta boost: "300% boosted" / "x300%" = 3× the normal rate → "dreifache Versicherungsscore-Rate (300 %)", flag "3× in der Private Beta".** Never "Boost von 300 %" or "+300 %": German readers take that as rate + 300 % (= 4×). Reason: money-adjacent promise, must be unambiguous.
- **FAQs → "FAQ"** everywhere (footer, docs sidebar, docs page title). "FAQ" is already plural in German usage; "FAQs" reads as an English leftover.
- **Short day/hour abbreviations in buttons: "Tg." / "Std." / "Min."** ("noch 2 Tg. 5 Std."). A bare "T" is not a recognised German abbreviation outside chart toggles (7T/30T).
- **Pool names in sentences take the masculine article** (all names end in "Cover Pool"): "im {pool}", "für den {pool}", "aus dem {pool}"; never "von {pool}" without article.
- **Insurance Score → "Versicherungsscore"** (short "Score"): "Score" is an established German word (Schufa-Score); "Versicherungspunkte" sounds like a loyalty programme and undermines trust. Quantities: "einen Score von 100", "1 Score pro Tag".

| English | Deutsch |
| --- | --- |
| Cover Pool / Cover Pools | Cover Pool / Cover Pools (der Cover Pool) |
| Cover Pool limit | Cover-Pool-Limit |
| Cover Pool LP | Cover-Pool-LP (Pl. Cover-Pool-LPs) |
| Insurance Score | Versicherungsscore (short: Score) |
| Score to spend | Score-Einsatz |
| available / maturing score | verfügbarer Score / Score in Wartezeit |
| Score Rate | Score-Rate ("{rate} pro USD8 und Tag") |
| Booster / Boosters | Booster / Booster |
| Claim (noun) | Antrag (Pl. Anträge); the money: Erstattung |
| File a claim (button) | Antrag stellen |
| File insurance claims / File a claim (title) | Erstattung beantragen |
| Simulate claim | Erstattung simulieren |
| Cancel claim | Antrag zurückziehen |
| Claimer / claimant | Antragsteller |
| Claim window / deadline | Antragsfrist |
| Claim bond | Antragskaution |
| Claim verification (service) | Anspruchsprüfung (Dienst zur Anspruchsprüfung) |
| Settle / Settlement | abrechnen / Abrechnung (settlement root: Settlement-Root) |
| Settlement window | Abrechnungsfrist |
| Dispute (window) | anfechten / Anfechtungsfrist |
| Finalize payout | Auszahlung abschließen |
| Accept / decline payout | Auszahlung annehmen / ablehnen |
| Return tokens (to the claimer) | Token zurückholen (never "zurückgeben" – that reads as the user giving them away) |
| Payout | Auszahlung |
| Payout window | Auszahlungsfrist |
| Payout limit | Auszahlungslimit |
| Reimbursement | Erstattung |
| Loss cap | Deckungsgrenze |
| Insured Token | versicherter Token (Pl. versicherte Token) |
| Max coverage | maximale Deckung (column: Max. Deckung) |
| Bond | Kaution |
| Escrow / escrowed | Hinterlegung / hinterlegt |
| Forfeit | abgeben (bond: verfällt) |
| Incident | Vorfall |
| Holding requirement | Mindesthaltedauer |
| White Hat Economy | White Hat Economy (proper name, unchanged) |
| Timelock | Timelock (der Timelock) |
| Timelock Queues | Timelock-Warteschlangen |
| Queued (timelock) | Geplant |
| Admin | Admin |
| Beta / during beta | Beta / während der Beta |
| Exit queue | Exit-Warteschlange |
| Withdraw / withdrawal | abheben / Abhebung (withdrawable: abhebbar) |
| Cooldown | Wartezeit ("Wartezeit starten", "in der Wartezeit") |
| Exit settles | Abhebung ist abgewickelt |
| Deposit | einzahlen / Einzahlung |
| Deposit cap | Einzahlungsobergrenze |
| Pool filled | Pool-Füllstand |
| Shares | Anteile |
| Earnings / rewards | Erträge |
| Balance | Guthaben |
| Amount | Betrag |
| Approve (ERC-20) | freigeben / Freigabe |
| Mint / Redeem | minten / einlösen |
| Redemption quote | Einlösekurs |
| Treasury / treasury yield | Treasury / Treasury-Rendite |
| Yield | Rendite |
| APY (label) | Rendite p. a. |
| TVL | TVL |
| Vault | Vault |
| Stablecoin | Stablecoin |
| Onchain / Offchain / Open source | onchain / offchain / Open Source |
| Deployed (on network) | verfügbar ("USD8 ist auf {network} nicht verfügbar") |
| DeFi Insurance | DeFi-Versicherung |
| System Stats | Systemstatus |
| Legal | Rechtliches |
| FAQs (footer) | FAQ |
| About X (tooltip aria-label) | Info zu X |
| Check (booster button) | Prüfen |


## Update: private beta boost

The English source now says "3x for private beta" and "at 3x the normal rate … at the end of the beta". Current wording lives in `src/locales/de/landing.json` (`usd8.flag`) and `notices.json` (`site.message`); it supersedes any "300%"/"x300%" wording above.
