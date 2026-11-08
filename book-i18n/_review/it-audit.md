# Italian (it) translation audit — independent review

## 1. Verdict

**READY WITH NOTES.** Confidence: **high** that a native Italian user will find it accurate and natural. The app strings were already fluent and the money conditions in them were right. The two CRITICAL errors were both in the docs: the Booster mechanics were out of date, and the FAQ bond line dropped its eligibility condition. Both are fixed. All other money and risk conditions match the English (the >20% drop, the up-to-80% cap, the 50% pool limit, the 10 USD8 bond, the 7-day windows, the 3-day claim, settlement, dispute and payout windows, 9–12 / 6–9 days, the 20% fee, escrow, "may decrease").

## 2. Counts

- Strings reviewed: 505 app strings across 15 namespaces, plus 30 shared strings (docs UI, widgets, cookie consent). Docs: 8 pages plus SUMMARY, compared paragraph by paragraph with `book-src/`.
- App strings changed: 19 wording changes, 11 added `_many` plural forms (lib.json) and 35 typography-only changes (straight ' replaced with ’ so the app JSON uses one apostrophe style).
- Shared strings changed: 0. They were checked and are correct.
- Docs paragraphs changed: 4 (defi-insurance Boosters, two FAQ lines, the addresses table labels). The docs build in scratch passes: every English heading and widget id is present, and the `<img>`, `<table>` and `<a href>` counts are equal on all 8 pages.

## 3. CRITICAL / MAJOR issues (all fixed)

| Sev | Where | Old → New | Why (back-translation) |
| --- | --- | --- | --- |
| CRITICAL | book-i18n/it/defi-insurance.md:78 (Boosters) | «NFT che puoi **bruciare quando presenti** una richiesta … per aumentare dell'1%…» → «NFT che puoi **aggiungere** quando presenti una richiesta…: ognuno aumenta dell'1%… **I Booster idonei vengono bruciati quando accetti l'indennizzo; gli altri ti vengono restituiti.**» | The old text said "NFTs you burn when filing a claim". That is wrong: Boosters are escrowed, only eligible ones are burned, only on acceptance, and the rest are returned. The English sentence about this was missing entirely. |
| CRITICAL | book-i18n/it/faqs.md:37 | «cauzione di 10 USD8, rimborsata dopo la richiesta» → «… rimborsata dopo la richiesta **se soddisfi i requisiti**» | The old text meant "always refunded". The English says "refunded … if you were eligible". |
| MAJOR | book-i18n/it/addresses.md table | «Cover Pool wstETH», «Cover Pool USD8», «Oracolo di prezzo USD8» → «wstETH Cover Pool», «USD8 Cover Pool», «USD8 Price Oracle» | Owner rule: contract names in the address table stay English. `timelock-queue.js` also uses these labels as contract names in queue descriptions. |
| MAJOR | landing.coverPools.help | «…un periodo di attesa di 7 giorni, **durante il quale** gli asset continuano a coprire…» → «…7 giorni, **e gli asset in attesa di prelievo** continuano a coprire le richieste» | The old text limited the exposure to the 7 days. The English means queued assets stay exposed until they exit, and the exit can be paused longer while claims are pending. |
| MAJOR (a11y) | transactions.pool.closeDeposit / closeWithdraw / closeWithdrawEarnings, transactions.usd8.closeMint / closeRedeem, fileClaim.close.fileClaim / claimStatus | «Chiudi il deposito in {pool}» → «Chiudi la finestra di deposito nel {pool}» (and the same pattern for the others) | The close-button labels read as "Close (terminate) your deposit / the claim / the mint". A screen-reader user would hear a money action, not "close dialog". |
| MAJOR | notices.site.message | «a un tasso potenziato al 300% e alla fine riceverai 3 Booster» → «a un tasso **triplicato (300%)** e **alla fine della beta** riceverai 3 Booster» | The boost is 3x the base rate. "Triplicato" cannot be misread as +300% (4x). "Alla fine" alone was vague; it now says the end of the beta. |

Minor fixes: betaGate.help («sul nostro Telegram o via DM su X»), fileClaim.form.scoreHelp (removed the comma before «e»), fileClaim.action.cancelPayoutReturnTokens («…ritira i token»), landing.score.intro (less calqued word order), landing.pool.*HelpLabel («del/nel {pool}» instead of a bare «di/in Cover Pool X»), landing.yieldIllustration.label («va al {target}») and smallPool («pool ristretto», 14 characters, so it fits the 84 px SVG box), simulateClaim.close, FAQ LP-risk comma. lib.json: added the Italian CLDR `many` forms («{count} di giorni»).

## 4. Back-translation of the most money-critical strings

| Key | Italian | Literal back-translation | Match |
| --- | --- | --- | --- |
| fileClaim.requirement | {symbol} deve perdere più del 20% del proprio valore rispetto al sottostante, confrontando il prezzo TWAP immediatamente prima e dopo il calo. | {symbol} must lose more than 20% of its value against the underlying, comparing the TWAP price immediately before and after the drop. | yes |
| fileClaim.form.tokenAmountHelp (+holdingRequirement.blocks, 7,200) | Devi aver detenuto {symbol} per almeno 7,200 blocchi prima dell’incidente. L’idoneità si basa sul tuo saldo minimo in quella finestra, quindi i token acquisiti dopo non contano. Se quel saldo è zero, non hai diritto al risarcimento e perdi la cauzione. | You must have held {symbol} for at least 7,200 blocks before the incident. Eligibility is based on your minimum balance in that window, so tokens acquired later don't count. If that balance is zero you are not entitled to the claim and you lose the bond. | yes |
| fileClaim.form.claimBondHelp | Per presentare la richiesta serve una cauzione anti-spam di 10 USD8, che non ti verrà restituita se non hai diritto al risarcimento. | Filing requires a 10 USD8 anti-spam bond, which will not be returned to you if you are not entitled to the claim. | yes |
| fileClaim.form.scoreHelp | …In liquidazione viene limitato al tuo punteggio disponibile e viene speso solo se accetti un indennizzo idoneo. | At settlement it is capped to your available score and is spent only if you accept an eligible payout. | yes |
| fileClaim.form.boostersHelp | Facoltativi. … stesso requisito di detenzione pre-incidente del token assicurato: {holding} Solo i Booster idonei aumentano il peso dell’indennizzo e vengono bruciati quando lo accetti. Quelli in eccesso ti vengono restituiti; se rifiuti, ti vengono restituiti tutti. | Optional. … same pre-incident holding requirement… Only eligible Boosters increase payout weight and are burned when you accept it. Excess ones are returned; if you decline, all are returned. | yes |
| fileClaim.payout.ineligible | Non hai diritto all’indennizzo e la cauzione di {bond} USD8 non ti sarà rimborsata. Ritira i tuoi token per chiudere la richiesta. | You are not entitled to the payout and the {bond} USD8 bond will not be refunded. Withdraw your tokens to close the claim. | yes |
| fileClaim.metric.bondNotRefunded | Non sarà rimborsata: condizioni non soddisfatte | Will not be refunded: conditions not met | yes |
| fileClaim.weight.summary | Peso massimo per l’indennizzo: {weight}{boosters} — {share} del peso provvisorio complessivo vincolato; il peso finale dipende dai requisiti di detenzione. | Max payout weight … — {share} of the total provisional escrowed weight; final weight depends on the holding requirements. | yes |
| fileClaim.statusDescription.settlementExpired / payoutExpired | finestra di liquidazione / di indennizzo chiusa: ritira ciò che hai vincolato. | settlement / payout window closed: withdraw what you escrowed. | yes |
| fileClaim.statusDescription.payoutOpen | finestra di indennizzo aperta: finalizza il prima possibile. | payout window open: finalize as soon as possible. | yes |
| fileClaim.noClaimInIncident | …La presentazione delle richieste è chiusa, ma la liquidazione è aperta a tutti: chiunque può avviarla. | Filing is closed, but settlement is open to all: anyone can start it. | yes |
| landing.claims.intro | Se un token assicurato perde più del 20% rispetto al suo asset sottostante, usa il tuo punteggio assicurativo per chiedere un risarcimento. | If an insured token loses more than 20% against its underlying asset, use your insurance score to claim. | yes |
| landing.claims.availableHelp | Il punteggio diventa utilizzabile dopo {duration}, al netto di quello già speso in richieste di risarcimento. | Score becomes usable after {duration}, net of what was already spent on claims. | yes |
| landing.coverPools.help (fixed) | …se uno perde il 20% o più e si apre un incidente, gli asset del pool pagano le richieste valide, fino a una quota massima del pool per incidente. Per prelevare c’è un periodo di attesa di 7 giorni, e gli asset in attesa di prelievo continuano a coprire le richieste. | …if one drops 20% or more and an incident opens, pool assets pay valid claims, up to a capped share of the pool per incident. Withdrawing has a 7-day wait, and assets waiting to withdraw keep covering claims. | yes |
| landing.coverPools.warning | …I rendimenti possono essere elevati, ma attenzione: se un token assicurato subisce una perdita, i depositi del pool possono servire a pagare le richieste… | Yields can be high, but beware: if an insured token suffers a loss, pool deposits may be used to pay claims. | yes |
| landing.pool.earningsHelp | I guadagni sono pagati in USD8, non in {asset}. Non sono esposti alle richieste di risarcimento e puoi prelevarli in qualsiasi momento. | Earnings are paid in USD8, not {asset}. They are not exposed to claims and you can withdraw them any time. | yes |
| landing.asset.coverageHelp | La copertura dipende dall’importo disponibile nei Cover Pool. | Coverage depends on the amount available in the Cover Pools. | yes |
| coveredProtocols.columns.maxCoverageHelp | Rimborso massimo attualmente previsto onchain per ciascun token. L’indennizzo effettivo dipende dal tuo punteggio assicurativo e dai limiti dei Cover Pool. | Maximum reimbursement currently set onchain for each token. Actual payout depends on your insurance score and the Cover Pool limits. | yes |
| app.pool.cooldownStarted | Periodo di attesa avviato. Da ora questo importo non genera più rendimento e può diminuire se il pool paga richieste di risarcimento prima che la tua uscita sia definitiva. | Waiting period started. From now on this amount no longer earns yield and may decrease if the pool pays claims before your exit is final. | yes |
| transactions.pool.withdrawAvailability (+cooldownWithLength "7 giorni") | {amount} quote disponibili. Periodo di attesa di 7 giorni se non ci sono richieste di risarcimento in sospeso; altrimenti si attende la finalizzazione di tutte le richieste. | {amount} shares available. 7-day waiting period if there are no pending claims; otherwise you wait for all claims to be finalized. | yes |
| transactions.pool.mayDecrease | Può diminuire se il pool paga richieste di risarcimento prima che il tuo prelievo sia definitivo. | May decrease if the pool pays claims before your withdrawal is final. | yes |
| lib.pool.depositsPausedForIncident | I depositi sono temporaneamente sospesi finché l’incidente assicurativo #{incident} è attivo. Riprova quando sarà stato finalizzato. | Deposits are temporarily suspended while insurance incident #N is active. Retry once it has been finalized. | yes |
| simulateClaim.intro | …La liquidazione ricalcola tutto nel TEE, quindi l’indennizzo finale può essere diverso. | Settlement recalculates everything in the TEE, so the final payout may differ. | yes |
| simulateClaim.lossValue.help | Valore dei token assicurati per cui chiedi il risarcimento, al prezzo medio dei 7 giorni prima del calo. Il limite di perdita è una percentuale di questo valore. | Value of the insured tokens you claim for, at the 7-day average price before the drop. The loss cap is a percentage of this value. | yes |
| notices.site.message (fixed) | …i tuoi USD8 accumulano punteggio assicurativo a un tasso triplicato (300%) e alla fine della beta riceverai 3 Booster. | …your USD8 accrue insurance score at a tripled (300%) rate and at the end of the beta you will receive 3 Boosters. | yes |
| docs defi-insurance §1–3 | conditions >20% between consecutive 24h TWAPs within 1–6 days; score earned ≥7 days before; held ≥7 days; 10 USD8 bond refunded if 2 and 3 are met; 3-day windows; worked example $2250 → $1125 → $900 → A $300 / B $400 | Same numbers and logic | yes |
| docs cover-pools / faqs limits | 50% per-incident cap; 9–12 days in beta (6–9 after); queued assets stay exposed; 20% leftover = USD8 fee | Same | yes |
| CONSENT_TEXT.message | …cookie facoltativi di Google Analytics … Attiviamo gli strumenti di analisi solo dopo il tuo consenso. Se rifiuti, l’app funziona normalmente. | Optional GA cookies … we only enable analytics after you consent. If you reject, the app works normally. | yes |

## 5. Term decisions (reviewed)

- **APY**: kept as «APY» in labels and metrics («APY 30G»), the established acronym in Italian-language crypto UIs. «Rendimento annuo» is too long for a metric label. Prose uses «rendimento». Kept.
- **Cover Pool**: kept as an English product name (masculine, invariable). Italian DeFi users read it without trouble, and «fondo di copertura» would mean hedge fund. `libI18n.test.js` pins «Il Cover Pool è pieno…». See section 6.
- Address-table contract labels went back to English (owner rule). This is now recorded in the glossary.
- Glossary additions: close-button labels («Chiudi la finestra di …»), the 300% boost («triplicato», never «del 300%»), the `_many` plural form, the apostrophe style, and «del/nel {pool}» before pool names.

## 6. For human judgement

- «Cover Pool» vs «pool di copertura»: es, fr and pt translate the term, following Rick's rule for Romance languages ("lowercase generic product terms"). Italian keeps the English name. Switching means about 30 strings and docs lines, plus the Italian assertion in `src/lib/libI18n.test.js`.
- The «7G / 30G» window abbreviation is understandable, but «7 gg» is also common in Italian. This is a style choice.
- Outside my files: `App.jsx` passes the untranslated config pool name (`activePool.name`, e.g. "wstEth Cover Pool") into the pool dialog's close label. It is aria-only and still reads correctly in Italian.
