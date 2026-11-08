# Russian (ru) translation audit — independent review

## 1. Verdict

**READY WITH NOTES** — confidence **high** that a native Russian crypto user finds the app and docs accurate and natural after the fixes below. The base translation was good, idiomatic Russian; the problems were three meaning errors in money/beta copy plus a few composed-string and calque issues.

## 2. Counts

- Strings reviewed: 527 app strings (15 namespaces) + 31 shared strings (docs widget, docs picker, cookie banner) + 8 docs pages (every paragraph compared with `book-src/`)
- Strings changed: 10 app + 1 shared
- Docs paragraphs changed: 6 (defi-insurance ×2, faqs ×2, transparency ×1, white-hat-economy ×1)

## 3. CRITICAL and MAJOR issues (all fixed)

| Sev | Where | Old → New | Why (back-translation) |
|---|---|---|---|
| CRITICAL | `notices.site.message` | «по ставке, повышенной на 300%» → «по тройной ставке (300% от обычной)» | Old = "at a rate increased BY 300%" (= 4x). The beta boost is 3x. |
| CRITICAL | `landing.usd8.flag` | «×300% в закрытой бете» → «×3 в закрытой бете» | «×300%» is ambiguous in Russian and next to the old notice read as +300%. Now "×3 in the private beta", matching the notice. |
| CRITICAL | `book-i18n/ru/defi-insurance.md:78` (Boosters) | «NFT, которые можно сжечь при подаче заявки и увеличить общий страховой балл на 1%» → «NFT, которые можно добавить к заявке: каждый увеличивает ваши общие страховые баллы на 1%. Засчитанные бустеры сжигаются, когда вы принимаете выплату, остальные возвращаются.» | Old = "NFTs you can burn when filing a claim". Wrong timing: they are burned only on payout acceptance. It also dropped "Eligible Boosters are burned when you accept the payout; the rest are returned". |
| CRITICAL | `book-i18n/ru/faqs.md:37` | «залог 10 USD8 — его вернут после рассмотрения заявки» → «… , если у вас было право на выплату» | Old = "refunded after the claim is reviewed" with no condition, which implies an unconditional refund. English: "refunded after the claim if you were eligible". |
| MAJOR | `book-i18n/ru/defi-insurance.md:25` (claim condition 1) | «соседние 24-часовые цены TWAP … показали падение более чем на 20% за последние 1–6 дней» → «за последние 1–6 дней цена застрахованного токена упала более чем на 20% (сравниваются два соседних 24-часовых TWAP)» | The old line was a calque ("adjacent 24-hour prices TWAP showed a drop") and unclear. Same facts: >20%, 1–6 days, adjacent 24h TWAPs. |
| MAJOR | `book-i18n/ru/faqs.md:23` | «Подавать заявки можно, пока баллам не меньше 7 дней.» → «Подавать заявки можно баллами, начисленными не менее 7 дней назад.» | «пока» ("while/until") made the condition read like a time limit. New = "you can file with score earned at least 7 days ago". |
| MAJOR | `landing.score.cooldownIn` / `cooldownAfterHolding` | «+{amount} к доступным через {duration}» → «+{amount} станут доступны через {duration}» | The old phrase was broken telegraphese ("+X to the available in 7 days"). Checked with 1/2/5/21 days (через 1 день / 2 дня / 7 дней / 21 день) and 1 minute (через 1 минуту). |
| MAJOR | `lib.amount.tooManyDecimals` | «Допустимо не более {decimals} знаков после точки.» → «Максимум знаков после точки: {decimals}.» | Only one key, so the number agreement broke for 1/21 («не более 1 знаков»). The label form agrees with any number. |

MINOR (fixed): `lib.settlement.baseUnits` «базовых единиц {asset}» → «баз. ед. {asset}» (agrees after any amount); `lib.pool.waitingForClaims` and `transactions.usd8.waitingForQuote` changed to the glossary's «Ждём …» status style; `transactions.pool.balances.estimatedForWithdrawal*` now start with a capital letter, because they open the `balances.summary` sentence; `transparency.md` «ставить систему на паузу» → «управлять паузой» (pause and unpause); `white-hat-economy.md` «…и правоохранительные органы» → «…и обращение в правоохранительные органы»; shared `CONSENT_TEXT.title` «Cookie и аналитика» → «Настройки cookie и аналитики» (English "…Preferences").

## 4. Back-translation of money-critical strings

| Key / location | Translation | Literal back-translation | Match |
|---|---|---|---|
| fileClaim.requirement | Заявку можно подать, если {symbol} подешевел относительно базового актива более чем на 20%. Падение считается по цене TWAP непосредственно до и после него. | A claim can be filed if {symbol} lost more than 20% against its underlying. The drop is measured by TWAP price immediately before and after it. | yes |
| fileClaim.form.tokenAmountHelp | Чтобы получить выплату, нужно держать {symbol} не менее {holding} Учитывается минимальный баланс за этот период… Если минимальный баланс равен нулю, права на выплату нет, а залог по заявке не возвращается. | To get a payout you must hold {symbol} at least {holding}. The minimum balance over that period counts… If it is zero you have no right to a payout and the bond is not returned. | yes |
| fileClaim.form.claimBondHelp | …нужно внести залог 10 USD8 — это защита от спама. Если права на выплату у вас не окажется, залог не вернётся. | You must post a 10 USD8 bond, an anti-spam protection. If you turn out not to be eligible, the bond is not returned. | yes |
| fileClaim.form.scoreHelp | …При урегулировании сумма ограничивается вашими доступными баллами, а списываются они, только если вы примете положенную выплату. | At settlement it is capped to your available score, and it is spent only if you accept the eligible payout. | yes |
| fileClaim.form.boostersHelp | …Вес выплаты увеличивают только засчитанные бустеры — они сжигаются, когда вы принимаете выплату. Лишние бустеры возвращаются, а если вы откажетесь от выплаты, вернутся все. | Only eligible boosters raise the payout weight; they are burned when you accept. Excess are returned; if you decline, all are returned. | yes |
| fileClaim.payout.ineligible | Права на выплату у вас нет, и залог {bond} USD8 не вернётся. Чтобы закрыть заявку, верните свои токены. | You have no right to a payout and the {bond} USD8 bond will not come back. Return your tokens to close the claim. | yes |
| fileClaim.weight.summary | Максимальный вес выплаты: {weight}{boosters} — это {share} от предварительного общего веса в эскроу. Итоговый вес зависит от того, выполнено ли требование удержания. | Max payout weight … is {share} of the provisional total escrow weight. The final weight depends on whether the holding requirement is met. | yes |
| fileClaim.statusDescription.payoutExpired | окно выплаты закрыто — заберите свои средства из эскроу. | payout window closed, take your funds out of escrow. | yes |
| fileClaim.noClaimInIncident | …Приём заявок закрыт, но провести урегулирование может любой желающий. | Filing is closed, but anyone can run the settlement. | yes |
| landing.claims.intro | Если застрахованный токен подешевеет относительно базового актива более чем на 20%, подайте заявку, используя страховые баллы. | If an insured token falls more than 20% against its underlying, file a claim using insurance score. | yes |
| landing.claims.availableHelp | Баллы можно использовать через {duration} после начисления. Баллы, уже потраченные на заявки, вычитаются. | Score can be used {duration} after it is earned. Score already spent on claims is subtracted. | yes |
| landing.coverPools.help | …если какой-то из них подешевеет на 20% или больше и откроется инцидент, активы пула пойдут на выплаты…, но не больше установленной доли пула на один инцидент. Вывод средств проходит через 7-дневный период ожидания, и всё это время ожидающие вывода активы продолжают покрывать заявки. | …if one falls 20% or more and an incident opens, pool assets pay valid claims, up to a set share of the pool per incident. Withdrawal goes through a 7-day waiting period, during which the waiting assets still cover claims. | yes |
| landing.coverPools.warning | …если застрахованный токен понесёт убыток, депозиты пула могут пойти на выплаты по заявкам… | …if an insured token suffers a loss, pool deposits may be used to pay claims… | yes |
| landing.pool.earningsHelp | Доход выплачивается в USD8, а не в {asset}. Он не идёт на страховые выплаты, и его можно вывести в любой момент. | Earnings are paid in USD8, not {asset}. They are not used for insurance payouts and can be withdrawn at any time. | yes |
| landing.pool.filledHelp | …При 100% новые депозиты не принимаются, пока кто-нибудь не выведет средства. | At 100% no new deposits are accepted until someone withdraws. | yes |
| transactions.pool.withdrawAvailability | Доступно долей: {amount}. Вывести их можно, когда пройдёт {cooldown}, если нет незавершённых заявок, а иначе — после завершения всех заявок. | Shares available: X. You can withdraw them once {cooldown} passes if there are no pending claims, otherwise after all claims are finalized. | yes |
| transactions.pool.mayDecrease | Может уменьшиться, если до завершения вывода пул произведёт выплаты по заявкам. | May decrease if the pool pays claims before the withdrawal completes. | yes |
| app.pool.cooldownStarted | Период ожидания начался. Эта сумма больше не приносит доход и может уменьшиться, если до завершения выхода пул произведёт выплаты по заявкам. | Waiting period started. This amount no longer earns and may decrease if the pool pays claims before the exit completes. | yes |
| lib.pool.depositsPausedForIncident | Пока открыт страховой инцидент №{incident}, депозиты временно не принимаются. Повторите попытку после его завершения. | While incident #N is open, deposits are temporarily not accepted. Retry after it is finalized. | yes |
| coveredProtocols.columns.maxCoverageHelp | Максимальное возмещение по каждому токену из списка — текущее значение в контракте. Фактическая выплата зависит от страховых баллов пользователя и лимитов пулов покрытия. | Max reimbursement per listed token is the current on-chain value. The actual payout depends on the user's score and cover-pool limits. | yes |
| simulateClaim.intro | …При урегулировании TEE пересчитывает всё заново, поэтому итоговая выплата может отличаться. | At settlement the TEE recalculates everything, so the final payout may differ. | yes |
| notices.site.message (fixed) | …получают страховые баллы за USD8 по тройной ставке (300% от обычной), а по окончании беты — 3 бустера. | …earn insurance score on USD8 at a triple rate (300% of normal), and 3 boosters when the beta ends. | yes (was no) |
| docs defi-insurance §1 condition 2 | у заявителя есть неизрасходованные страховые баллы, начисленные не позже чем за 7 дней до падения цены | the claimer has unspent score earned no later than 7 days before the drop | yes |
| docs defi-insurance §3 | Примет заявитель выплату или нет, залог возвращается в любом случае, если выполнены его условия. | Whether or not the claimer accepts, the bond is returned if its conditions are met. | yes |
| docs cover-pools Withdraw | …вывод приостанавливается до урегулирования инцидента… ещё 9–12 дней в период беты (6–9 дней после беты)… активы в периоде ожидания по-прежнему участвуют в страховых выплатах. | Withdrawal is paused until the incident is resolved, another 9–12 days in beta (6–9 after)… assets in the waiting period still take part in payouts. | yes |
| docs cover-pools payout limit | …по одному инциденту можно выплатить не больше половины текущего размера пула покрытия. | No more than half the current pool size can be paid per incident. | yes |
| docs faqs revenue | 20%, остающиеся от выплат: заявители получают не больше 80% покрытия, а оставшиеся 20% — комиссия USD8 | the 20% left over from payouts: claimers get at most 80% coverage, the remaining 20% is USD8's fee | yes |

## 5. Term decisions

No glossary term was changed. Two rules were added to `_glossary/ru.md`:
- The beta boost "x300%" / "300% boosted" means 3x: write «×3» or «по тройной ставке (300% от обычной)», never «на 300%».
- Boosters are «добавить к заявке» (added to a claim) and «сжигаются при принятии выплаты» (burned when the payout is accepted).

## 6. For human judgement

- `fileClaim.holdingRequirement.blocks` gets its number from code as `toLocaleString('en-US')`, so it shows as `50,400 блоков`. A Russian reader may take the comma for a decimal point (50.4). This follows the owner's "English number format" rule, and the component is outside this reviewer's files. Consider showing the number without a separator. «блоков» is correct for typical values (7200, 50400). It would be wrong only for counts ending in 1–4.
- `durationAdjective` in Russian returns noun forms («7 дней»), which a test pins (`'2 дня'`). The host therefore reads «период ожидания 7 дней» rather than the more idiomatic «7-дневный период ожидания». This is acceptable as it stands.
