# Ukrainian (uk) translation audit

## 1. Verdict

**READY WITH NOTES**. Confidence: **high** that a native Ukrainian crypto user would find it accurate and natural.

The first pass was already good: correct cases after numbers, no Russianisms (checked a list of about 40 typical calques plus Russian-only letters ы/э/ъ/ё; none found), consistent terms, «» quotes, ’ apostrophe. I found no CRITICAL money or eligibility errors. The fixes below are two MAJOR wording risks and a set of fluency and terminology improvements.

## 2. Counts

- Strings reviewed: 527 app JSON keys (15 namespaces, including lib plural forms) + 31 shared strings (UI_TEXT / WIDGET_TEXT / CONSENT_TEXT) + all 9 docs pages, compared paragraph by paragraph with `book-src/`.
- Strings changed: 14 (app JSON). Shared strings: 0.
- Docs paragraphs/lines changed: 18. Glossary: 1 row clarified.
- Docs completeness: no dropped or added sentences, numbers or examples on any page.

## 3. CRITICAL / MAJOR issues

No CRITICAL issues.

| Sev | Key / file | Old → New | Why |
| --- | --- | --- | --- |
| MAJOR | `lib.claimService.incidentActive` | «Закрийте цю заявку й відкрийте її знову» → «Закрийте вікно заявки й відкрийте його знову» | Back-translation of the old text: "Close this claim and open it again". Elsewhere in uk, «закрити заявку» means resolving or cancelling a claim («Щоб закрити заявку, поверніть свої токени»). A user could read it as an instruction to cancel the claim. The English means: close and reopen the dialog. |
| MAJOR | `fileClaim.form.boostersHelp` | «їх треба тримати впродовж {holding}» → «їх треба тримати **щонайменше** впродовж {holding}» | Eligibility wording: "at least" was missing, unlike the host for the insured token (`tokenAmountHelp`). |

MINOR (fluency / terminology, all fixed):
- `landing.susd8.apyHelp`, `landing.pool.apyHelpSource`, `landing.coverPools.help`, `landing.yieldIllustration.label`, plus docs cover-pools.md:6, faqs.md:14 and :68, transparency.md:51, philosophy.md:51 and :56: «дохідність скарбниці» (treasury *rate of return*) → «дохід скарбниці» (treasury *income*). «Дохідність» is a rate. Income that funds payouts is «дохід». The glossary row now states this rule.
- cover-pools.md:30: «не приносять дохідності» → «не приносять доходу» (+ «але й далі покривають»).
- `landing.coverPools.help`, cover-pools.md:26: «Виведення має 7-денний період очікування» (calque of "has") → «На виведення діє 7-денний період очікування».
- `landing.pool.apyHelpWhyHigh`: «Вона може бути високою» had an unclear antecedent → «Дохідність може бути високою».
- `fileClaim.form.tokenAmountHelp`: «застава … пропадає» (colloquial) → «заставу за заявку ви втрачаєте».
- `settlement.finality.explanation`, defi-insurance.md:19: «дедлайн» → «строк» (glossary term).
- `app.transaction.inProgress`: «Одна транзакція вже виконується» (calque) → «Транзакція вже виконується».
- `coveredProtocols.columns.maxCoverageHelp`: «ончейн-максимальне відшкодування» (ungrammatical compound) → «максимальне відшкодування …, встановлене ончейн».
- `landing.asset.insured`: «Страхування» → «Застраховано» (label before «ТАК, з обмеженнями»).
- `landing.asset.scoreRateValue`: «{rate} на {unit} за день» → «{rate} за {unit} на день» (natural rate order).
- `betaGate.help`: «DM на X» → «особистих повідомленнях на X».
- defi-insurance.md:36 «Результати повністю перевірювані» → «Результати може повністю перевірити будь-хто». Line 78: "minted to early users" rendered as «їх випускають лише для ранніх користувачів».
- usd8.md:13 table row «Можливості для дохідності» → «Можливість отримувати дохід». Line 20: «заробляйте на ньому дохідність» (wrong collocation) → «вкладайте його, щоб заробляти».
- faqs.md headings: «Де побачити всі ризики USD8?» → «Можна побачити всі ризики USD8?» (so the answer «Звісно, …» fits); «Що інакше в період бети?» → «Чим відрізняється період бети?».
- white-hat-economy.md: «анонімні підказки» (hints) → «анонімні наводки» (tips); «кожного представника спільноти» → «кожну людину» ("every member of the public").
- addresses.md:22: prose «Timelock» → «таймлок» (glossary: the contract name stays English only in tables and code).

## 4. Back-translation of money-critical strings

| Key | Translation | Literal back-translation | Match |
| --- | --- | --- | --- |
| fileClaim.requirement | Заявку можна подати, якщо токен {symbol} знецінився щодо базового активу більш ніж на 20%. Падіння вимірюється за ціною TWAP безпосередньо до та після нього. | A claim can be filed if {symbol} lost more than 20% against its underlying. The drop is measured by TWAP price immediately before and after it. | yes |
| landing.claims.intro | Якщо застрахований токен подешевшає щодо базового активу більш ніж на 20%, подайте заявку, використавши свої страхові бали. | If an insured token falls more than 20% against its underlying, file a claim using your insurance score. | yes |
| fileClaim.form.tokenAmountHelp | Ви повинні були тримати {symbol} щонайменше впродовж {holding} Враховується ваш найменший баланс за цей період … Якщо цей баланс нульовий, права на виплату немає, а заставу за заявку ви втрачаєте. | You must have held {symbol} for at least {holding}. Your lowest balance over this period counts … If it is zero, you have no right to a payout and you lose the claim bond. | yes |
| fileClaim.holdingRequirement.blocks | періоду перед інцидентом (блоків: {blocks}). | the period before the incident (blocks: {blocks}). | yes |
| fileClaim.form.claimBondHelp | Щоб подати заявку, потрібно внести заставу 10 USD8 — це захист від спаму. Якщо права на виплату у вас не виявиться, заставу не повернуть. | To file you must post a 10 USD8 bond, an anti-spam protection. If you turn out not to be eligible, the bond won't be returned. | yes |
| fileClaim.form.scoreHelp | Скільки балів ви хочете списати. Під час врегулювання ця кількість обмежується вашими доступними балами, а списуються вони, лише якщо ви приймете виплату, на яку маєте право. | How many points you want to spend. Settlement caps it at your available score, and they are spent only if you accept a payout you're entitled to. | yes |
| fileClaim.form.boostersHelp | Необов’язково. … їх треба тримати щонайменше впродовж {holding} Вагу виплати збільшують лише бустери, що відповідають вимогам, — їх спалюють, коли ви приймаєте виплату. Зайві бустери повертаються, а якщо ви відмовитеся від виплати, повернуться всі. | Optional. … must be held for at least {holding}. Only eligible boosters increase payout weight; they are burned when you accept. Excess ones are returned; if you decline, all are returned. | yes |
| fileClaim.payout.ineligible | Права на виплату у вас немає, а заставу {bond} USD8 не буде повернуто. Щоб закрити заявку, поверніть свої токени. | You have no right to a payout, and the {bond} USD8 bond won't be returned. To close the claim, return your tokens. | yes |
| fileClaim.metric.bondNotRefunded | Не буде повернуто: умов не виконано | Will not be returned: conditions not met | yes |
| fileClaim.statusDescription.settlementExpired | строк врегулювання минув — заберіть свої кошти з ескроу. | settlement period has passed, take your funds from escrow. | yes |
| fileClaim.statusDescription.payoutOpen | строк виплати триває — завершіть заявку якнайшвидше. | payout period is running, finalize the claim asap. | yes |
| fileClaim.action.cancelPayoutReturnTokens | Відмовитися й повернути токени | Decline and return tokens | yes |
| app.pool.cooldownStarted | Період очікування розпочато. Ця сума більше не приносить дохід і може зменшитися, якщо пул здійснить виплати за заявками до завершення виведення. | Cooldown started. This amount no longer earns and may decrease if the pool pays claims before the withdrawal completes. | yes |
| transactions.pool.mayDecrease | Може зменшитися, якщо пул здійснить виплати за заявками до завершення виведення. | May decrease if the pool pays claims before the withdrawal completes. | yes |
| transactions.pool.withdrawAvailability | Доступно часток: {amount}. Вивести їх можна після {cooldown}, якщо немає незавершених заявок, інакше — після завершення всіх заявок. | Shares available: {amount}. They can be withdrawn after {7-day cooldown} if there are no pending claims, otherwise after all claims are finalized. | yes |
| landing.coverPools.help | … активи пулу підуть на виплати за дійсними заявками — але не більше встановленої частки пулу на один інцидент. На виведення діє 7-денний період очікування, а активи, що чекають на виведення, і далі покривають заявки. | … pool assets go to pay valid claims, but no more than a set share of the pool per incident. Withdrawals have a 7-day cooldown, and assets waiting to withdraw still cover claims. | yes |
| landing.coverPools.warning | Дохідність може бути високою, але пам’ятайте: якщо застрахований токен зазнає збитків, депозити пулу можуть піти на виплати за заявками. | Yield can be high, but remember: if an insured token suffers losses, pool deposits may go to pay claims. | yes |
| landing.pool.earningsHelp | Дохід виплачується в USD8, а не в {asset}. Він не використовується для страхових виплат, і його можна вивести будь-коли. | Earnings are paid in USD8, not {asset}. They are not used for insurance payouts and can be withdrawn any time. | yes |
| landing.asset.coverageHelp | Покриття обмежене коштами, доступними в пулах покриття. | Coverage is limited by funds available in cover pools. | yes |
| coveredProtocols.columns.maxCoverageHelp | Поточне максимальне відшкодування для кожного токена зі списку, встановлене ончейн. Фактична виплата залежить від страхових балів користувача та лімітів пулів покриття. | Current maximum reimbursement per listed token, set onchain. Actual payout depends on the user's score and cover pool limits. | yes |
| landing.claims.availableHelp | Нараховані бали можна використовувати через {duration}; бали, уже витрачені на заявки, віднімаються. | Earned points can be used after {duration}; points already spent on claims are subtracted. | yes |
| simulateClaim.intro | … Під час врегулювання TEE перераховує все заново, тож остаточна виплата може відрізнятися. | … At settlement the TEE recalculates everything, so the final payout may differ. | yes |
| simulateClaim.lossValue.help | Вартість застрахованих токенів … за середньою ціною за 7 днів до падіння. Ліміт відшкодування — це відсоток від цієї вартості. | Value of the insured tokens … at the 7-day average price before the drop. The loss cap is a percentage of this value. | yes |
| lib.pool.depositsPausedForIncident | Поки триває страховий інцидент №{incident}, депозити тимчасово не приймаються. Спробуйте знову після його завершення. | While insurance incident #{incident} is ongoing, deposits are temporarily not accepted. Try again after it ends. | yes |
| notices.site.message | Учасники приватної бети отримують страхові бали за USD8 за підвищеною ставкою 300%, а наприкінці отримають 3 бустери. | Private beta participants earn score on USD8 at a boosted 300% rate and will receive 3 boosters at the end. | yes |
| terms.disagreeNote | Якщо ви не погодитеся, гаманець буде відключено. Підпис або транзакція не потрібні. | If you don't agree, the wallet will be disconnected. No signature or transaction needed. | yes |
| CONSENT_TEXT.message | USD8 використовує необов’язкові cookie Google Analytics … Аналітику вмикаємо лише з вашої згоди, а відмова ніяк не впливає на роботу застосунку. | USD8 uses optional GA cookies … We enable analytics only with your consent, and refusing does not affect the app. | yes |
| docs defi-insurance «1 Подання заявки» list | ціна … впала більш ніж на 20% між двома сусідніми 24-годинними TWAP протягом останніх 1–6 днів; … бали, нараховані щонайменше за 7 днів до падіння; … тримав … щонайменше 7 днів до падіння | price fell >20% between two adjacent 24h TWAPs in the last 1–6 days; score earned at least 7 days before the drop; held at least 7 days before the drop | yes |
| docs cover-pools «Ліміт страхових виплат» | … максимальна виплата за один інцидент не перевищує 50% поточного розміру пулу покриття. | … max payout per incident does not exceed 50% of the current cover pool size. | yes |
| docs faqs «Як заробляє USD8?» | 20% залишку після виплат: заявники отримують щонайбільше 80% покриття, а решта 20% — це комісія USD8 | 20% of the leftover: claimants get at most 80% coverage, the remaining 20% is USD8's fee | yes |

Composed sentences checked with real values: `lib.duration.*` in «через {duration}» (1 годину / 2 години / 5 годин / 21 день); adjectives in «після 7-денного періоду очікування»; `holdingRequirement.*` inside both hosts; `weight.summary` + `weight.boosters_*`; `effectiveScoreAfterBoosters` + `scoreCommitted`; `yieldIllustration.label` with «пул покриття» / «сховище sUSD8»; `apySuffix` after the 7Д/30Д toggles. All read correctly.

## 5. Term decisions changed

- **Yield**: kept «дохідність» for the rate (APY, «дохідність вища»). Income (treasury yield that funds rewards, assets "earning yield", "yield sources") is now consistently «дохід». The glossary row was updated to say this.
- No other glossary terms changed (пул покриття, страхові бали, заявка, врегулювання, строк, період очікування, ескроу, застава, Річна дохідність / 7Д / 30Д, Обсяг пулу all confirmed).

## 6. Left for human judgement

- «Обсяг пулу» for TVL and «7Д/30Д» toggles: both idiomatic and short, but a native reviewer may prefer «TVL» if the target users are used to exchange UIs.
- `fileClaim.holdingRequirement.blocks` uses a colon form («блоків: 50,400») to avoid number agreement. It is correct but a bit technical.
