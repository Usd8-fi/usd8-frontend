# Spanish (es) translation audit — independent review

## 1. Verdict

**READY WITH NOTES** — confidence **high** that a native Spanish-speaking crypto user would find it accurate and natural. The first pass was already good: neutral international Spanish, consistent "tú", correct glossary terms and no number, negation or condition errors in the claim, payout, bond, deadline or cooldown content. The fixes below cover two ambiguities about the private-beta boost, one eligibility condition worded loosely, one unclear withdrawal condition, and Rick's number-agreement rule in the composed amount strings.

## 2. Counts

- App strings reviewed: 505 (15 namespaces) + 22 shared strings (docs widgets, docs picker, cookie banner) = 527
- Strings changed: 24 (landing 5, transactions 9, lib 7, fileClaim 1, settlement 1, notices 1)
- Strings added: 11 `lib.json` `_many` plural forms (CLDR `Intl.PluralRules('es')` returns many/one/other)
- Docs paragraphs/cells changed: 6 (defi-insurance.md 4, usd8.md 2). Every page was compared paragraph by paragraph with `book-src/`: no sentences, facts, examples or numbers were dropped or added.

## 3. CRITICAL / MAJOR issues (all fixed)

No CRITICAL issues. MAJOR:

| # | Where | Old → New | Why (back-translation) |
|---|---|---|---|
| 1 | `notices.site.message` | "…generan puntuación de seguro a una tasa potenciada del 300 % y al final recibirás 3 Boosters" → "…generan puntuación de seguro al triple de la tasa normal y, al terminar la beta, recibirás 3 Boosters" | Old: "a rate boosted by 300 %", which readers can take as +300 % (4×). The owner means 3×. New: "at triple the normal rate". "Al final" was also vague; now "when the beta ends". |
| 2 | `landing.usd8.flag` | "x300 % en la beta privada" → "x3 en la beta privada" | "x300 %" is not a Spanish idiom and is ambiguous between ×3 and +300 %. "x3" is unambiguous and shorter. |
| 3 | defi-insurance.md:25 (claim condition 1) | "los precios TWAP de 24 h consecutivos de un token asegurado cayeron más de un 20 %…" → "el precio TWAP de 24 h de un token asegurado cayó más de un 20 % entre dos períodos consecutivos en los últimos 1–6 días" | Old: "the consecutive 24 h TWAP prices fell >20 %". It did not say what is compared with what, so it could be read as a cumulative fall across several days. EN "adjacent 24hr TWAP prices dropped >20%" means a drop between two adjacent windows. |
| 4 | defi-insurance.md:3 | "quienes tienen USD8 y sUSD8 ganan puntuación" → "quienes tienen USD8 o sUSD8 ganan puntuación" | Old: "holders of USD8 **and** sUSD8", which suggests you need both to earn score. |
| 5 | `transactions.pool.withdrawAvailability` | "…{cooldown} si no hay reclamaciones pendientes; si las hay, cuando todas se hayan finalizado." → "…; si las hay, el retiro espera a que se finalicen todas." | Old: "…if there are, when all have been finalized". The clause had no subject, so it did not say what happens. New: "if there are, the withdrawal waits until they are all finalized". |

MINOR (fixed):
- Number agreement (Rick's rule; the old forms broke at 1, e.g. "1 USD8 disponibles"): `transactions.earnings.availableToWithdraw`, `pool.balances.readyToWithdraw(AfterClaims)`, `estimatedForWithdrawal(AfterClaims)`, `inCooldown(WithTiming)` now use label form ("Disponible para retirar: {amount} {symbol}", "Retiro estimado: …", "En período de espera: {amount} {symbol} ({timing})"). The `balances.summary` separator is now ". ". `landing.score.cooldownIn` / `cooldownAfterHolding`: "+{amount} disponibles en…" → "+{amount} de puntuación disponible en {duration}" (it agrees with "puntuación", which is always singular, and keeps the "+" first as Rick designed).
- `lib.cooldown.readyIn.*` / `readyNow`: "disponible en 3 días" / "disponible ahora" → "termina en 3 días" / "ya ha terminado". They appear only inside the "in cooldown" balance line, where they now describe the cooldown, not the amount, so there is no agreement problem. Assembled: "En período de espera: 0.5 wstETH (termina en 3 días)".
- `fileClaim.metric.scoreCommitted`: "{percent} del total comprometido" ("of the committed total") → "{percent} de toda la puntuación comprometida" ("of all score committed").
- `settlement.finality.minutesToGo`: now starts with a capital letter after "·", like "Listo para liquidar".
- `landing.yieldIllustration.backing` "respalda todo el USD8" → "respaldo de USD8" and `smallPool` "pool pequeño y limitado" → "pool pequeño". Both are SVG labels centred near the edges of a 300-unit viewBox, and at the monospace font size the longer strings ran past the edge. "Capped" is dropped from the diagram label only; the pool tooltip and docs still state the cap.
- defi-insurance.md:5 "con el tope del límite del pool" → "sujeto al límite del pool de cobertura" (the old phrase said "cap of the limit"). usd8.md table cell "Con el límite del pool de cobertura" → "Sujeto al límite del pool de cobertura". usd8.md "ten USD8" → "mantén USD8" (more natural for "hold").
- defi-insurance.md Boosters: "para sumar un 1 % a tu puntuación" → "para aumentar un 1 % tu puntuación de seguro total" (now clearly a 1 % increase, not "+1").

## 4. Back-translation of the most money-critical strings

| Key / location | Spanish | Literal back-translation | Matches EN? |
|---|---|---|---|
| landing.claims.intro | Usa tu puntuación de seguro para presentar una reclamación si un token asegurado cae más del 20 % frente a su activo subyacente. | Use your insurance score to file a claim if an insured token falls more than 20 % against its underlying asset. | yes |
| fileClaim.requirement | {symbol} debe perder más del 20 % de su valor frente a su activo subyacente, medido entre su precio TWAP inmediatamente antes y después de la caída. | {symbol} must lose more than 20 % of its value vs its underlying, measured between its TWAP price immediately before and after the drop. | yes |
| fileClaim.form.tokenAmountHelp | Debes tener {symbol} desde al menos {holding} Para la elegibilidad cuenta tu saldo más bajo en ese período… Si ese saldo es cero, no eres elegible y pierdes la fianza de reclamación. | You must have held {symbol} since at least {N blocks before the incident.} For eligibility your lowest balance in that window counts… If that balance is zero you are not eligible and you lose the claim bond. | yes |
| fileClaim.form.claimBondHelp | Para presentar una reclamación se exige una fianza antispam de 10 USD8. No se devuelve si no resultas elegible. | A 10 USD8 anti-spam bond is required to file. It is not returned if you turn out not eligible. | yes |
| fileClaim.form.scoreHelp | …La liquidación la limita a tu puntuación disponible, y solo se gasta si aceptas una indemnización a la que tengas derecho. | Settlement caps it to your available score, and it is only spent if you accept a payout you are entitled to. | yes |
| fileClaim.form.boostersHelp | …Solo los Boosters elegibles aumentan el peso de tu indemnización, y se queman si la aceptas. Los sobrantes se devuelven. Si la rechazas, se devuelven todos. | Only eligible Boosters increase your payout weight, and they are burned if you accept it. Excess are returned. If you decline, all are returned. | yes |
| fileClaim.metric.bondNotRefunded | No se reembolsará: no se cumplen las condiciones | Will not be refunded: conditions not met | yes |
| fileClaim.payout.ineligible | No tienes derecho a indemnización y tu fianza de {bond} USD8 no se reembolsará. Recupera tus tokens para cerrar la reclamación. | You have no right to a payout and your {bond} USD8 bond will not be refunded. Recover your tokens to close the claim. | yes |
| fileClaim.statusDescription.payoutExpired | el plazo de indemnización ha terminado; retira lo que tienes en garantía. | the payout window has ended; withdraw what you have in escrow. | yes |
| fileClaim.statusDescription.settlementExpired | el plazo de liquidación ha terminado; retira lo que tienes en garantía. | the settlement window has ended; withdraw your escrow. | yes |
| fileClaim.action.cancelPayoutReturnTokens | Rechazar y recuperar tokens | Decline and recover tokens | yes (shortened button) |
| landing.coverPools.help | …si uno cae un 20 % o más y se abre un incidente, los activos del pool pagan las reclamaciones válidas, hasta una parte limitada del pool por incidente. Los retiros tienen un período de espera de 7 días, y los activos pendientes de retiro siguen cubriendo reclamaciones. | …if one falls 20 % or more and an incident opens, pool assets pay valid claims, up to a limited share of the pool per incident. Withdrawals have a 7-day waiting period, and assets pending withdrawal still cover claims. | yes |
| landing.coverPools.warning | …El APY puede ser alto, pero ten en cuenta que, si un token asegurado sufre una pérdida, los depósitos del pool pueden usarse para pagar reclamaciones… | APY can be high, but note that if an insured token suffers a loss, pool deposits may be used to pay claims. | yes |
| landing.pool.earningsHelp | Las ganancias se pagan en USD8, no en {asset}. No están expuestas a las reclamaciones de seguro y puedes retirarlas en cualquier momento. | Earnings are paid in USD8, not {asset}. They are not exposed to insurance claims and you can withdraw them at any time. | yes |
| app.pool.cooldownStarted | Período de espera iniciado. Este importe deja de generar rendimiento y puede reducirse si el pool paga reclamaciones antes de que se liquide tu salida. | Cooldown started. This amount stops earning and may decrease if the pool pays claims before your exit settles. | yes |
| transactions.pool.mayDecrease | Puede reducirse si el pool paga reclamaciones antes de que se liquide tu retiro. | May decrease if the pool pays claims before your withdrawal settles. | yes |
| transactions.pool.withdrawAvailability | Participaciones disponibles: {amount}. Período de espera de 7 días si no hay reclamaciones pendientes; si las hay, el retiro espera a que se finalicen todas. | Shares available: X. 7-day waiting period if there are no pending claims; if there are, the withdrawal waits until all are finalized. | yes (after fix) |
| lib.pool.depositsPausedForIncident | Los depósitos están en pausa mientras el incidente de seguro n.º {incident} esté activo… | Deposits are paused while insurance incident no. {incident} is active… | yes |
| coveredProtocols.columns.maxCoverageHelp | Reembolso máximo vigente, fijado onchain, para cada token de la lista. La indemnización real depende de la puntuación de seguro del usuario y de los límites de los pools de cobertura. | Current maximum reimbursement, set onchain, for each listed token. The actual payout depends on the user's score and the cover-pool limits. | yes |
| simulateClaim.intro | …La liquidación lo recalcula todo en el TEE, así que la indemnización final puede ser distinta. | Settlement recalculates everything in the TEE, so the final payout may differ. | yes |
| notices.site.message | …tus USD8 generan puntuación de seguro al triple de la tasa normal y, al terminar la beta, recibirás 3 Boosters. | …your USD8 earn insurance score at triple the normal rate and, when the beta ends, you will receive 3 Boosters. | yes (after fix) |
| defi-insurance.md condition 2–3 | …puntuación de seguro sin gastar que obtuvo al menos 7 días antes de la caída… tenía el token asegurado desde al menos 7 días antes de la caída | unspent score earned at least 7 days before the drop… held the insured token since at least 7 days before the drop | yes |
| defi-insurance.md bond | …una fianza de 10 USD8, que se reembolsa íntegramente si se cumplen las condiciones 2 y 3. | a 10 USD8 bond, fully refunded if conditions 2 and 3 are met | yes |
| defi-insurance.md claim window | el plazo de reclamación se cierra 3 días después de la primera reclamación válida; a partir de ese momento ya no se pueden presentar reclamaciones por ese token asegurado. | the claim window closes 3 days after the first valid claim; after that no more claims can be filed for that insured token | yes |
| defi-insurance.md example | límite… 50 % → $1125… 80 % ($900)… A hasta $300 y B hasta $600… tope de $400… A recibirá $300 y B, $400 | same numbers and logic | yes |
| cover-pools.md payout limit | …fijado actualmente en el 50 %: como máximo, cada incidente puede pagar el 50 % del tamaño que tenga en ese momento el pool de cobertura. | currently 50 %: at most each incident can pay 50 % of the pool's size at that moment | yes |
| faqs.md revenue | el 20 % sobrante de cada indemnización: como los reclamantes reciben como máximo un 80 % de cobertura, el 20 % restante queda para USD8 como comisión. | the 20 % left over from each payout: since claimers get at most 80 % coverage, the remaining 20 % goes to USD8 as a fee | yes |
| CONSENT_TEXT.message | USD8 usa cookies opcionales de Google Analytics para conocer, de forma agregada, cómo se usa el sitio. Solo cargamos la analítica si la aceptas, y rechazarla no afecta al funcionamiento de la app. | USD8 uses optional GA cookies to learn, in aggregate, how the site is used. We only load analytics if you accept, and rejecting does not affect the app. | yes |

## 5. Term decisions

Unchanged, and confirmed on review:
- **APY** stays "APY" (masculine). "TAE" is a regulated Spain-only banking term and "TEA" varies by country; Spanish-language DeFi and exchange UIs show APY/APR. **TVL** stays.
- **Cover Pool → pool de cobertura**. "Fondo de cobertura" would mean hedge fund, so it is avoided. "Pool" is the word Spanish DeFi users already know from liquidity pools.
- Payout → indemnización, claim → reclamación, bond → fianza, escrow → en garantía, cooldown → período de espera, wallet → billetera (neutral/LatAm), withdraw → retiro.

New rules added to the glossary:
- Runtime amounts go in label form, and the score note agrees with "puntuación".
- Cooldown timing says "termina en …" / "ya ha terminado".
- The beta boost is written "x3" / "al triple de la tasa normal" (×3, not +300 %).
- `_many` plural forms are required in lib.json.

## 6. Left for human judgement

- The stage labels "Indemnización abierta / cerrada" (Payout Open/Closed) are understandable but a little bureaucratic. A native PM may prefer "Cobro abierto / cerrado". I kept them so they match the glossary term "indemnización".
- "Retiro" and "billetera" are the neutral/LatAm choice; Spain would say "retirada" and "cartera". This was a deliberate decision to stay neutral.
- The SVG label "pool pequeño" drops "capped" to fit the diagram (see MINOR above).
