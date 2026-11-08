# Arabic (ar) translation audit — independent review

## 1. Verdict

**READY WITH NOTES** (after the fixes below). Confidence: **medium-high** that a native MSA reader will find it accurate and natural. Money and risk content matched the English before review: no number, condition, negation or caveat was wrong. The fixes cover RTL rendering (bidi), one meaning shift in the philosophy page, and polish.

## 2. Counts

- Strings reviewed: 549 app strings (15 namespaces, all Arabic plural forms counted) + 29 shared strings (UI_TEXT / WIDGET_TEXT / CONSENT_TEXT).
- App strings changed: 13. Shared strings changed: 0.
- Docs: all 9 pages compared paragraph by paragraph with `book-src` (no dropped or added sentences, facts or numbers). Paragraphs/list items changed: 9.

## 3. CRITICAL / MAJOR issues

No CRITICAL issues.

| Sev | Where | Old → New | Why |
| --- | --- | --- | --- |
| MAJOR | landing `score.cooldownIn`, `score.cooldownAfterHolding` | `+{amount} تصبح متاحة…` → `⁦+{amount}⁩ تصبح متاحة…` (LRI/PDI isolates, stored as `\u2066`/`\u2069`) | In a `dir=rtl` page the leading "+" is a weak character, so it was drawn on the right of the number: **"1,234.5+"**. I checked this in Chrome. With isolates it renders "+1,234.5". |
| MAJOR | philosophy.md, anarcho-capitalism paragraph | "…على شركات التأمين والوكالات الخاصة **بدلًا من** الخدمات الأساسية…" → "…**لتقديم** الخدمات الأساسية التي تتولاها الدولة المركزية عادةً" | Back-translation of the old text: "relies on insurers *instead of the essential services*", which says the services themselves are dropped. The English says the agencies *replace the state in providing* the services. |
| MAJOR | defi-insurance.md, settlement example (4 items) | `$500`, `$2250`, `$1125`, `$900`, `$300`, `$600`, `$400` → `500 دولار`, `2250 دولارًا`, `1125 دولارًا`, `900 دولار` … (with the correct number agreement) | In RTL the "$" is drawn after the number ("2250$", checked in Chrome), and "N دولار" is the native MSA form. Every figure is unchanged. |
| MINOR | landing `pool.apyWindowLabel`, `pool.apyHelpLabel` | `…لـ{pool}` → `…في {pool}` | Pool names begin with an Arabic word ("مجمع تغطية wstETH"), which produced "لـمجمع" (a stray kashida). |
| MINOR | fileClaim `requirement` | "وفق سعر TWAP قبل الهبوط مباشرة وبعده" → "مقيسًا بسعر TWAP قبل الهبوط وبعده مباشرةً" | "immediately" now applies to both before and after, as in the English. |
| MINOR | fileClaim `form.boostersHelp` | dropped "قبل الحادثة" before `{holding}` | The inserted fragment already ends "…كتلة قبل الحادثة.", so the assembled sentence repeated it. |
| MINOR | fileClaim `statusDescription.payoutOpen` | "يُرجى إتمامه" → "يُرجى إتمام مطالبتك" | Makes clear what is being finalized. |
| MINOR | landing `header.retryData`, app `score.retry`, lib `pool.withdrawalAmountsUnavailable` | "إعادة تحميل البيانات/النقاط" → "تحديث البيانات/النقاط" | The header button was 2x the English length on a 390px screen. The lib string quotes the button label, so it was updated to match. |
| MINOR | coveredProtocols `actions.daysHoursLeft` | "{days} ي {hours} س" → "{days} ي و{hours} س" | Now consistent with the fileClaim countdowns. |
| MINOR | simulateClaim `results.payoutFormula` | "أدنى قيمة بين أ وب" → "القيمة الأدنى بين (أ) و(ب)" | "أ وب" visually reads as a word ("وب"). |
| MINOR | terms `disagreeNote` | "فسيتم فصل محفظتك" → "فسيُقطع اتصال محفظتك" | More natural; same meaning (the wallet is disconnected). |
| MINOR | defi-insurance.md, bond sentence | "وسواء أتمّ … التعويض" → "وسواء قبل … التعويض" | The English "finalize" here means accept or not. |
| MINOR | transparency.md (2), white-hat-economy.md (1) | "الإجراءات الحساسة"→"الحرجة"; "endBetaMode نهائيًا"→"يعطّل نهائيًا"; "ردّ فعل"→"يكتفي بردّ الفعل" | Word choice. "Permanently" is now attached to the effect, not to the call. |

## 4. Back-translation of money-critical strings

| Key | Arabic | Literal back-translation | Match |
| --- | --- | --- | --- |
| fileClaim.requirement | يجب أن يفقد {symbol} أكثر من 20% من قيمته مقابل أصله الأساسي، مقيسًا بسعر TWAP قبل الهبوط وبعده مباشرةً | {symbol} must lose more than 20% of its value vs its underlying, measured by TWAP immediately before and after the drop | yes |
| fileClaim.form.tokenAmountHelp | يجب أن تكون قد احتفظت بـ{symbol} لمدة لا تقل عن {holding} تُحدَّد الأهلية بأدنى رصيد… وإذا كان هذا الرصيد صفرًا فلن تكون مؤهلًا وستخسر ضمان المطالبة | You must have held {symbol} for no less than {holding}. Eligibility is set by the lowest balance… if zero you are not eligible and lose the claim bond | yes |
| fileClaim.form.claimBondHelp | يُشترط دفع ضمان قدره 10 USD8 لمنع المطالبات العشوائية. لن يُردّ إليك إذا لم تكن مؤهلًا للمطالبة | A 10 USD8 bond is required to prevent spam claims. It won't be returned if you are not eligible | yes |
| fileClaim.form.scoreHelp | …عند التسوية لا يتجاوز المحتسب منها نقاطك المتاحة، ولا تُخصم إلا إذا قبلت تعويضًا مستحقًا | At settlement the counted amount doesn't exceed your available score; it is deducted only if you accept an eligible payout | yes |
| fileClaim.form.boostersHelp | …المعززات المؤهلة وحدها تزيد وزن التعويض، وتُحرق عند قبوله. تُعاد إليك المعززات الزائدة، وإذا رفضت التعويض تُعاد جميعها | Only eligible boosters raise payout weight and are burned on acceptance. Excess returned; if you decline, all returned | yes |
| fileClaim.payout.ineligible | لست مؤهلًا للحصول على تعويض، ولن يُردّ ضمانك البالغ {bond} USD8. استعِد رموزك لإغلاق المطالبة | You're not eligible for a payout and your {bond} USD8 bond won't be refunded. Recover your tokens to close the claim | yes |
| fileClaim.metric.bondNotRefunded | لن يُردّ: الشروط غير مستوفاة | Will not be refunded: conditions not met | yes |
| fileClaim.statusDescription.settlementExpired | انتهت فترة التسوية، يُرجى سحب أصولك المحتجزة | Settlement window ended, please withdraw your escrowed assets | yes |
| fileClaim.noClaimInIncident | …أُغلق باب تقديم المطالبات، لكن التسوية لا تتطلب إذنًا، فبإمكان أي شخص تنفيذها | Filing closed, but settlement needs no permission; anyone can do it | yes |
| app.pool.cooldownStarted | بدأت فترة الانتظار. يتوقف هذا المبلغ عن تحقيق العائد، وقد تنخفض قيمته إذا دفع المجمع تعويضات قبل اكتمال سحبك | Cooldown started. This amount stops earning and its value may fall if the pool pays claims before your withdrawal completes | yes |
| transactions.pool.mayDecrease | قد ينخفض المبلغ إذا دفع المجمع تعويضات قبل اكتمال سحبك | The amount may decrease if the pool pays claims before your withdrawal completes | yes |
| transactions.pool.withdrawAvailability | الحصص المتاحة: {amount}. يمكنك السحب بعد انقضاء {cooldown} إذا لم تكن هناك مطالبات معلّقة، وإلا فبعد إتمام جميع المطالبات | Shares available: {amount}. You can withdraw after {cooldown} if no pending claims, otherwise after all claims are finalized | yes |
| landing.coverPools.help | …بحد أقصى نسبة محددة من المجمع لكل حادثة. يخضع السحب لفترة انتظار مدتها 7 أيام، وتظل الأصول المنتظرة للسحب تغطي المطالبات | …up to a set share of the pool per incident. Withdrawals have a 7-day cooldown, and assets waiting to withdraw still cover claims | yes |
| landing.coverPools.warning | …فقد تُستخدم الودائع في المجمع لدفع المطالبات | …pool deposits may be used to pay claims | yes |
| landing.pool.earningsHelp | تُدفع الأرباح بـUSD8 لا بـ{asset}. الأرباح غير معرَّضة لمطالبات التأمين، ويمكنك سحبها في أي وقت | Earnings paid in USD8 not {asset}; not exposed to claims; withdrawable any time | yes |
| landing.claims.availableHelp | تصبح النقاط متاحة للاستخدام بعد {duration} من كسبها، مخصومًا منها ما استخدمته سابقًا في المطالبات | Score becomes usable {duration} after earning it, minus what you already spent on claims | yes |
| lib.claimService.noQualifyingDrop | لم يُرصد هبوط سعري مؤهِّل يتجاوز 20% | No qualifying price drop exceeding 20% was detected | yes |
| lib.pool.depositsPausedForIncident | الإيداع غير متاح مؤقتًا ما دامت حادثة التأمين رقم {incident} نشطة… | Deposits temporarily unavailable while incident #{incident} is active… | yes |
| app.claim.finalize.errors.PayoutCapExceeded | يتجاوز التعويض الحدَّ المتبقي للتعويضات في المجمع | Payout exceeds the pool's remaining payout limit | yes |
| simulateClaim.intro | …تُعاد كل الحسابات داخل TEE عند التسوية، لذا قد يختلف التعويض النهائي | …everything is recalculated in the TEE at settlement, so the final payout may differ | yes |
| simulateClaim.lossValue.help | …محسوبة بمتوسط السعر خلال الأيام السبعة السابقة للهبوط. سقف الخسارة نسبة مئوية من هذه القيمة | …at the average price of the 7 days before the drop. Loss cap is a percentage of this value | yes |
| notices.site.message | …معدل نقاط تأمين معزَّز بنسبة 300% على ما يحتفظون به من USD8، وسيحصلون على 3 معززات في نهايتها | …a 300% boosted score rate on USD8 holdings, and will receive 3 boosters at its end | yes |
| docs defi-insurance, 3 conditions | هبط … بأكثر من 20% … خلال آخر 1–6 أيام / نقاط … اكتسبها قبل الهبوط بـ7 أيام على الأقل / احتفظ … 7 أيام على الأقل | dropped >20% within last 1–6 days / score earned ≥7 days before drop / held ≥7 days | yes |
| docs defi-insurance, finalize | …أمام أصحاب المطالبات 3 أيام لقبول التعويض… يتنازل عن رموزه المؤمَّنة المحتجزة وعن نقاط التأمين المستخدمة | Claimers have 3 days to accept… forfeit escrowed tokens and the score used | yes |
| docs cover-pools, payout limit | …محدد حاليًا بنسبة 50%، أي أن الحد الأقصى للتعويضات عن كل حادثة هو 50% من الحجم الحالي لمجمع التغطية | currently 50%: max payout per incident is 50% of the current pool size | yes |
| docs faqs, revenue | الـ20% المتبقية من التعويض: لأن أصحاب المطالبات يحصلون على تغطية لا تتجاوز 80%… هي رسوم USD8 | the remaining 20%: since claimers get at most 80% coverage… is USD8's fee | yes |
| shared CONSENT_TEXT.message | …لا نحمّل أدوات التحليل إلا بعد موافقتك، ورفضها لا يؤثر في عمل التطبيق | We only load analytics after you consent; rejecting doesn't affect the app | yes |

## 5. Term decisions changed

- Retry Data / Retry Score buttons: "إعادة تحميل …" → "تحديث …" (length on phones). Recorded in the glossary.
- Glossary typography rules added: no "لـ" before a pool-name placeholder; docs dollar amounts written as "N دولار"; bidi isolates around a leading "+{amount}".
- Kept, after judging them:
  - **العائد السنوي** for APY: natural and common in Arabic earn copy.
  - **القيمة المقفلة** for TVL: short form of the standard "إجمالي القيمة المقفلة".
  - **7 أيام / 30 يومًا** for the 7D/30D toggles: grammatical and short enough. I checked the toggle row in RTL.

## 6. Left for human judgement

- **Short countdown units ي/س/د** (`fileClaim.time.*`, `coveredProtocols.actions.*`, widget `hoursLeft/minutesLeft`). Kept. These are the compact units Arabic social and finance apps use (e.g. "٥ د", "٣ س"), and the code only selects one/other, so full words would break number agreement. "ي" is the least familiar of the three; it is still clear inside a countdown such as "يتبقى 2 ي و5 س".
- **"1 يوم" `_one` forms** in lib.json and fileClaim. They must keep `{count}` for the tests. "1 يوم" is common in Arabic UIs, though prose would say "يوم واحد". The shared booster widget (not covered by the tests) uses the natural "معزز واحد" / "معززان".
- **Strings that start with a Latin token** (e.g. "USD8 غير متاحة…", "{amount} {symbol} جاهز للسحب"). They render correctly because the app and docs set `dir="rtl"` at the root, so paragraph direction does not depend on the first strong character. They would only flip if a future container used `dir="auto"` or `unicode-bidi: plaintext`.
- The flag "x300% في النسخة التجريبية الخاصة" is 1.6x the English length. Shortening it would mean dropping the established term "النسخة التجريبية الخاصة"; check on a device if the badge wraps.

## Validation

- Keys and placeholders: every namespace matches the English key set. lib.json has all 6 Arabic plural categories. No empty values. `{placeholders}` and `<tags>` are identical. Shared JSON matches the en rows of UI_TEXT, WIDGET_TEXT and CONSENT_TEXT.
- Docs: scratch build with `MDBOOK_BOOK__LANGUAGE=ar MDBOOK_BOOK__TEXT_DIRECTION=rtl` is clean (`<html lang="ar" dir="rtl">`). Every English heading and widget id is present on all 8 pages. `<img` / `<table` / `<a href` counts equal English.
- Tests: `i18n.test.jsx` + `libI18n.test.js`: 37/37 passed.
