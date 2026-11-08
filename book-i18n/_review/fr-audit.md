# French (fr) translation audit — independent review

## 1. Verdict

**READY WITH NOTES.** Confidence: **high** that a native French user will find it accurate and natural. No CRITICAL or MAJOR meaning errors found. Money and risk conditions (thresholds, caps, windows, bond rules, holding rules, escrow, disputes) match the English in every string and docs paragraph checked. Typography is clean (U+00A0 before : ; ? ! % and inside « », ’ apostrophe, sentence case). The fixes below are layout and minor wording fixes.

## 2. Counts

- App strings reviewed: 516 (15 namespaces) + 30 shared strings (docs UI, widgets, cookie consent). Docs: 8 pages + SUMMARY, compared paragraph by paragraph with `book-src/`.
- Strings changed: 9 (lib 3, landing 4, notices 1, fileClaim 1). Shared strings changed: 0.
- Docs paragraphs changed: 0. No dropped or added sentences, facts, numbers or examples; every heading/widget id is present.
- Glossary: 2 entries added (Mint/Redeem rationale, illustration short forms) + Connect Wallet length note.

## 3. Issues found and fixed

No CRITICAL issues. No MAJOR meaning issues. Issues fixed (MAJOR for layout, MINOR for the rest):

| Sev | Key | Old → New | Why |
| --- | --- | --- | --- |
| MAJOR (layout) | landing.pool.yieldTarget | « pool de couverture » → « pool » | Drawn in SVG text inside an 84 px box (viewBox 300, bold 11 px monospace ≈ 6.6 px/char). 18 chars ≈ 119 px, so it spilled out of the box and was clipped at the viewBox edge. The aria label still reads « …est reversé au pool », and the card title already says cover pools. |
| MAJOR (layout) | landing.yieldIllustration.smallPool | « petit pool plafonné » → « petit, plafonné » | 19 chars at 9.5 px, centred at x=256, ran past x=300 and got clipped. 15 chars fit. Back-translation: "small, capped". |
| MINOR (layout) | landing.yieldIllustration.viaTreasury | « via la trésorerie USD8 » → « via la trésorerie » | 22 chars overlapped the USDC box on the left. The sentence label names the USD8 treasury. |
| MINOR | lib.duration.hour_many, duration.adjective.hour_many, cooldown.readyIn.hour_many | « {count} de heures » → « {count} d’heures » | Missing elision (French `many` = 1,000,000…). |
| MINOR | fileClaim.action.settleAllClaims | « Régler les demandes » → « Régler toutes les demandes » | English says *All*. The action settles every claim in the incident, not only the user's. |
| MINOR | notices.site.message | « …3 Boosters à la fin. » → « …à la fin de la bêta. » | « à la fin » alone was vague. Back-translation now: "you will receive 3 Boosters at the end of the beta". |
| MINOR | landing.pool.filledHelp | « …tant que personne ne retire. » → « …jusqu’au prochain retrait. » | « personne ne retire » was a stiff calque of "until someone withdraws". |

## 4. Back-translation of the most money-critical strings

| Key | French | Literal back-translation | Match |
| --- | --- | --- | --- |
| fileClaim.requirement | {symbol} doit perdre plus de 20 % de sa valeur par rapport à son actif sous-jacent, mesurée entre son prix TWAP juste avant et juste après la baisse. | {symbol} must lose more than 20% of its value against its underlying asset, measured between its TWAP price just before and just after the drop. | yes |
| fileClaim.form.tokenAmountHelp (+holdingRequirement.blocks) | Les {symbol} doivent être en votre possession au plus tard 7,200 blocs avant l’incident. L’éligibilité repose sur votre solde le plus bas sur cette période : les tokens acquis ensuite ne comptent pas. Si ce solde est nul, vous n’êtes pas éligible et votre caution est perdue. | The {symbol} must be in your possession no later than 7,200 blocks before the incident. Eligibility is based on your lowest balance over that period: tokens acquired afterwards don't count. If that balance is zero you are not eligible and your bond is lost. | yes |
| fileClaim.form.claimBondHelp | Une caution anti-spam de 10 USD8 est exigée pour déposer une demande. Elle n’est pas rendue si vous n’êtes pas éligible. | A 10 USD8 anti-spam bond is required to file a claim. It is not returned if you are not eligible. | yes |
| fileClaim.form.scoreHelp | …Le règlement le plafonne à votre score disponible, et il n’est consommé que si vous acceptez une indemnisation éligible. | Settlement caps it at your available score, and it is only consumed if you accept an eligible payout. | yes |
| fileClaim.form.boostersHelp | Facultatif. …Seuls les Boosters éligibles augmentent le poids de votre indemnisation, et ils sont brûlés si vous l’acceptez. Les Boosters excédentaires vous sont rendus ; si vous refusez, ils vous sont tous rendus. | Optional. …Only eligible Boosters increase your payout weight, and they are burned if you accept it. Excess Boosters are returned; if you decline, all are returned. | yes |
| fileClaim.payout.ineligible | Vous n’êtes pas éligible à une indemnisation et votre caution de {bond} USD8 ne sera pas remboursée. Récupérez vos tokens pour clôturer la demande. | You are not eligible for a payout and your {bond} USD8 bond will not be refunded. Retrieve your tokens to close the claim. | yes |
| fileClaim.metric.bondNotRefunded | Ne sera pas remboursée : conditions non remplies | Will not be refunded: conditions not met | yes |
| fileClaim.statusDescription.settlementExpired | période de règlement close ; récupérez vos actifs sous séquestre. | settlement period closed; retrieve your escrowed assets. | yes |
| fileClaim.statusDescription.payoutOpen | période d’indemnisation ouverte ; finalisez au plus vite. | payout period open; finalise as soon as possible. | yes |
| fileClaim.noClaimInIncident | Vous n’avez aucune demande dans cet incident. Le dépôt des demandes est clos, mais le règlement est ouvert à tous : n’importe qui peut le déclencher. | You have no claim in this incident. Filing is closed, but settlement is open to all: anyone can trigger it. | yes |
| fileClaim.weight.summary | Poids d’indemnisation maximal : {weight}{boosters} — {share} du poids total provisoire sous séquestre ; le poids final dépend du respect de la condition de détention. | Maximum payout weight: … — {share} of the provisional total escrow weight; final weight depends on meeting the holding condition. | yes |
| landing.coverPools.help | …si l’un d’eux chute de 20 % ou plus et qu’un incident est ouvert, les actifs du pool paient les demandes valides, dans la limite d’une part plafonnée du pool par incident. Les retraits sont soumis à une période d’attente de 7 jours, et les actifs en attente de retrait continuent de couvrir les demandes. | …if one drops 20% or more and an incident is opened, pool assets pay valid claims, within a capped share of the pool per incident. Withdrawals have a 7-day waiting period, and assets waiting to withdraw keep covering claims. | yes |
| landing.coverPools.warning | …L’APY peut être élevé, mais attention : si un token assuré subit une perte, les dépôts du pool peuvent servir à payer les demandes. | APY can be high, but beware: if an insured token suffers a loss, pool deposits may be used to pay claims. | yes |
| landing.pool.earningsHelp | Les gains sont versés en USD8, et non en {asset}. Ils ne sont pas exposés aux demandes d’indemnisation et peuvent être retirés à tout moment. | Earnings are paid in USD8, not {asset}. They are not exposed to claims and can be withdrawn at any time. | yes |
| landing.claims.availableHelp | Le score devient utilisable au bout de {duration}, déduction faite du score déjà utilisé pour des demandes. | Score becomes usable after {duration}, minus score already used for claims. | yes |
| landing.asset.coverageHelp | La couverture dépend des montants disponibles dans les pools de couverture. | Coverage depends on the amounts available in the cover pools. | yes |
| coveredProtocols.columns.maxCoverageHelp | Remboursement maximal actuellement fixé onchain pour chaque token listé. L’indemnisation réelle dépend du score d’assurance de l’utilisateur et des plafonds des pools de couverture. | Maximum reimbursement currently set onchain for each listed token. The actual payout depends on the user's insurance score and the cover pool caps. | yes |
| app.pool.cooldownStarted | Période d’attente lancée. Ce montant ne génère plus de rendement et peut diminuer si le pool paie des demandes avant la finalisation de votre retrait. | Waiting period started. This amount no longer earns yield and may decrease if the pool pays claims before your withdrawal is finalised. | yes |
| transactions.pool.withdrawAvailability (+cooldownWithLength, 7 days) | Parts disponibles : {amount}. Période d’attente de 7 jours s’il n’y a aucune demande en cours ; sinon, une fois toutes les demandes clôturées. | Shares available: …. 7-day waiting period if there are no pending claims; otherwise, once all claims are closed. | yes |
| simulateClaim.intro | …Le règlement recalcule tout dans le TEE : l’indemnisation finale peut donc être différente. | Settlement recalculates everything in the TEE, so the final payout may differ. | yes |
| simulateClaim.lossValue.help | Valeur des tokens assurés pour lesquels vous faites la demande, au prix moyen sur 7 jours avant la baisse. Le plafond de remboursement est un pourcentage de cette valeur. | Value of the insured tokens you claim for, at the 7-day average price before the drop. The loss cap is a percentage of this value. | yes |
| lib.claimService.noQualifyingDrop | Aucune baisse de prix éligible (plus de 20 %) n’a été détectée. | No qualifying price drop (more than 20%) was detected. | yes |
| notices.site.message | …vos USD8 vous rapportent du score d’assurance à un taux boosté de 300 %, et vous recevrez 3 Boosters à la fin de la bêta. | …your USD8 earn insurance score at a 300% boosted rate, and you will receive 3 Boosters at the end of the beta. | yes |
| docs defi-insurance §1 (conditions 1–3 + bond) | …chuté de plus de 20 % entre deux TWAP sur 24 h consécutifs, au cours des 1 à 6 derniers jours ; …score non utilisé, gagné au moins 7 jours avant… ; …détenait le token assuré depuis au moins 7 jours avant… Caution de 10 USD8 … intégralement remboursée si les conditions 2 et 3 sont remplies. | Same conditions, numbers and bond rule. | yes |
| docs defi-insurance worked example | 2250 $ → plafond 50 % = 1125 $ → 80 % = 900 $; A 300 $, B 600 $; cap 400 $; A reçoit 300 $, B 400 $. | Identical numbers and logic. | yes |
| docs cover-pools / faqs (limits) | plafonné … actuellement à 50 % ; jusqu’à 50 % du solde de chaque pool ; retrait suspendu … 9 à 12 jours pendant la bêta (6 à 9 jours après) ; 20 % du reliquat = frais d’USD8 | Same. | yes |
| CONSENT_TEXT.message | …cookies Google Analytics facultatifs… Ces outils ne sont chargés qu’après votre accord, et les refuser n’a aucun effet sur l’application. | Optional GA cookies… loaded only after you accept; refusing has no effect on the app. | yes |

## 5. Term decisions (reviewed or changed)

- **Mint / Redeem = « Émettre » / « Racheter »: kept.** Concern: « Racheter » could read as "buy again". Circle's French site uses « Émettez et rachetez de l’USDC », with the holder as subject. In the dialog the user gives USD8 and receives USDC, so the meaning is clear. « Rembourser » (the MiCA term) was rejected because French lending UIs use it for *Repay*.
- **7D / 30D = « 7J » / « 30J »: kept.** This is the standard compact chart-toggle form in French (1J/7J/1M/1A, Binance FR "7J"). The toggle row renders as « 7J 30J APY », and the aria label is in full (« APY sur 30 jours »).
- **« Connecter le portefeuille »: kept.** It is 25 chars (1.8× English). Checked against the CSS: on desktop the button is a fixed 218 px, nowrap, 14 px monospace, and 25 × 8.4 px = 210 px fits. On phones (≤760 px) the button gets its own header row with auto width (~248 px incl. padding), which fits a 390 px viewport. No shorter natural form keeps the meaning (« Connecter » alone is used by Uniswap but is less clear for this audience).
- **Yield illustration short forms** (target « pool », « via la trésorerie », « petit, plafonné »): changed so the text fits inside the fixed SVG geometry.
- **APY, TVL, pool de couverture, demande d’indemnisation, indemnisation, caution, sous séquestre, période d’attente, règlement, score d’assurance**: confirmed. They are consistent across app, docs and shared strings.

## 6. For human judgement

- **Claim-status buttons in the covered-tokens table**, e.g. « Finaliser l’indemnisation (encore 2 j 5 h) » (~42 chars, nowrap, min-width 260 px). This is wider than the 720 px phone table's last column. English « Finalise Payout (2d 5h left) » already overflows (~283 px vs ~234 px), and es/it/pt have the same length. It is a CSS issue for all languages, not a French wording issue.
- **« Déposer une demande » in the 135 px File Claim button** wraps to two lines (es/pt also wrap). The 52 px button height holds two lines.
- **« x300 % en bêta privée »** copies the English "x300%". A French marketer might prefer « ×3 », but that would change the owner's figure, so it was left alone.
