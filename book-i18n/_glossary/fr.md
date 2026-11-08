# French (fr) glossary — USD8 docs + app UI

Style: « vous » throughout; natural product French, translated by meaning (clauses reordered, sentences merged or split where French reads better; facts, numbers, conditions and risk caveats unchanged). Sentence case in titles, labels and buttons (« Votre score d’assurance », « Pools de couverture »). Use the same term in the app, the docs and the docs widgets.

Typography: no-break space (U+00A0) before « : ; ? ! % » and inside « … »; typographic apostrophe ’. Numbers come from code and keep English formatting (0.3, 7,200) — never localised. Amounts in prose: « 500 $ ». Ranges: « 9 à 12 jours » in prose, « 1 à 2 jours » in small labels. Elision before USD8 (« d’USD8 », « l’USDC », « qu’USD8 »).

Keep in English/Latin: USD8, sUSD8, token symbols (USDC, wstETH, aUSDC, sGHO…), Aave, Morpho, Sky, Chainlink, Brevis, OpenZeppelin, Github, Telegram, X, TEE, TWAP, LP, NFT, RPC, onchain/offchain, open source, trustless, smart contract, contract/function names (Registry, Treasury, DefiInsurance, endBetaMode), Addresses-table labels (« wstETH Cover Pool », « USD8 Price Oracle » — read by timelock-queue.js), addresses, URLs.

## Key decisions

- **APY → « APY »** (masc.: « l’APY », « un APY élevé »). French crypto apps (Binance, Coinbase, Ledger Live, Kraken, Aave) all label the rate « APY »; the legal banking terms do not fit (« TAEG » is a loan cost rate, « TAE/TAP » are rare outside banking) and « rendement annuel » is too long for a metric label. In prose the yield itself is « rendement ».
- **7D / 30D → « 7J » / « 30J »** — the compact form of French chart toggles (1J, 5J, 1M, 1A). Toggle row reads « 7J 30J APY »; single label « APY 30J »; long form in aria labels: « APY sur 30 jours ».
- **Connect Wallet → « Connecter le portefeuille »** (25 chars): checked against CSS — desktop button is a fixed 218 px, nowrap, 14 px monospace (8.4 px/char → 210 px, fits); on phones (≤760 px) the button sits on its own row with auto width, so it fits at 390 px.
- **TVL → « TVL »** — standard in French DeFi media; « valeur totale verrouillée » is too long for a stat label.
- **Cover Pool → « pool de couverture »** (masc.; title « Pools de couverture »; named pools « Pool de couverture wstETH »). « Pool » is the usual French DeFi word (« pool de liquidité »); « fonds de couverture » would mean hedge fund.
- **Claim → « demande d’indemnisation »**, short « demande ». « File a claim » → « Déposer une demande »; section title « Demander une indemnisation ». « Déclarer un sinistre » was considered but « sinistre » reads as a car/home insurance event, and here the event is the incident while each user files a request.
- **Payout → « indemnisation »** (the insurer’s payment); **reimbursement → « remboursement »** (simulator estimate).
- **Settle / settlement → « régler / règlement »** — the exact French insurance term (« règlement d’un sinistre »).
- **Escrow → « sous séquestre »** (« Tokens assurés sous séquestre », « Boosters à placer sous séquestre ») — the French legal term for funds held by a third party pending an outcome.
- **Cooldown → « période d’attente »** (« Lancer la période d’attente », « en période d’attente », « Période d’attente de 7 jours »). « Période de refroidissement » is a calque; « préavis » would suggest a bank notice period.
- **Mint / Redeem → « Émettre » / « Racheter »** (« émission », « rachat », « prix de rachat » = redemption quote) — the vocabulary used for stablecoin/fund issuance and redemption in French finance. Reviewed: Circle’s own French page uses exactly « Émettez et rachetez de l’USDC » with the holder as subject, so « Racheter » is the established stablecoin term; the dialog (USD8 → USDC) removes the « buy again » reading. MiCA’s « remboursement » was rejected because « Rembourser » is the Repay button in French lending apps (Aave).
- **Yield illustration (SVG, fixed 84 px box) → target « pool »**, « via la trésorerie », « petit, plafonné »: the full « pool de couverture » / « petit pool plafonné » were wider than the box/viewBox in the 14 px monospace font and got clipped. The card title already says « Pools de couverture ».
- **Insurance Score → « score d’assurance »** (short « score »; units « 1 point de score par jour »; « un score de 100 »).
- **White Hat Economy, Booster(s), Timelock stay English**: proper program, NFT and contract names. Generic prose: « économie white hat ».
- **Wallet → « portefeuille »** — what MetaMask, Ledger and Coinbase use in French.

## Terms

| English | Français |
| --- | --- |
| Cover Pool / Cover Pools | pool de couverture / pools de couverture |
| Cover Pool LP | LP des pools de couverture |
| Cover Pool limit | plafond du pool de couverture |
| Insurance Score | score d’assurance (short: score) |
| Score to spend | score d’assurance à utiliser (form) / engagé (status) |
| Available score | score disponible |
| Score Rate | taux de score (« {rate} par {unit} et par jour ») |
| Claim (noun) | demande d’indemnisation / demande |
| File a claim | déposer une demande |
| Claimer / claimant | demandeur |
| Claim window | période de dépôt (des demandes) |
| Claim bond | caution (anti-spam) |
| Settle / Settlement | régler / règlement (settlement root: racine de règlement) |
| Settlement window | période de règlement |
| Dispute / dispute window | contester / période de contestation |
| Payout / Payout window | indemnisation / période d’indemnisation |
| Accept / decline payout | accepter / refuser l’indemnisation |
| Finalize payout | finaliser l’indemnisation |
| Return tokens (escrow back to claimer) | récupérer les tokens |
| Payout limit | plafond d’indemnisation |
| Loss cap (simulator) | plafond de remboursement (max coverage % × loss value) |
| Reimbursement | remboursement |
| Insured token | token assuré |
| Max coverage | couverture maximale (column: Couverture max.) |
| Bond | caution |
| Escrow / escrowed | placer sous séquestre / sous séquestre |
| Forfeit | céder (tokens); bond: « est perdue » |
| Incident | incident |
| Holding requirement / window | condition / période de détention |
| Booster / Boosters | Booster / Boosters |
| White Hat Economy | White Hat Economy |
| Timelock / Timelock Queues | Timelock (le) / Files d’attente du Timelock |
| Queued (timelock) | Programmée |
| Admin | administrateur |
| Beta / private beta | bêta / bêta privée |
| Exit / exit queue | sortie / file de sortie |
| Withdraw / withdrawal | retirer / retrait |
| Cooldown | période d’attente |
| Deposit / deposit cap | déposer, dépôt / plafond de dépôts |
| Pool filled | Remplissage |
| Shares | parts |
| Earnings / rewards | gains |
| Balance | solde |
| Approve (ERC-20) | approuver / approbation |
| Mint / Redeem | émettre / racheter |
| Redemption quote | prix de rachat |
| Treasury (generic) | trésorerie (contract name: Treasury) |
| Yield | rendement |
| APY / TVL | APY / TVL |
| 7D / 30D | 7J / 30J |
| Vault | vault |
| Stablecoin | stablecoin (masc.) |
| Hack | piratage |
| DeFi Insurance | assurance DeFi (title: Assurance DeFi) |
| Philosophical Roots | Racines philosophiques |
| Transparency | Transparence |
| System Stats | Statistiques du système |
| FAQs | FAQ |
| Legal | Mentions légales |
| Docs | Documentation |
| About X (tooltip aria-label) | À propos de X |
| Check (booster button) | Vérifier |
| Retry Data | Recharger les données |
