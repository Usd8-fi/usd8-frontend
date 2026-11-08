# Persian (fa) translation audit — USD8 app + docs

## 1. Verdict

**READY WITH NOTES** — confidence **high** that a Persian-speaking crypto user finds it accurate, and **medium-high** that they find it natural. The translation I received was already strong: numbers, conditions and risk caveats were correct, and the typography was clean (Persian ی/ک, ZWNJ, Western digits, ، ؛ ؟). I found no CRITICAL meaning errors. I fixed one MAJOR bidi rendering bug, one MAJOR grammar problem in a composed string, and several clarity and fluency issues.

## 2. Counts

- Strings reviewed: 501 app strings (15 namespaces) + 29 shared strings (UI/WIDGET/CONSENT) = 530
- Strings changed: 26 (25 app + 1 shared)
- Docs paragraphs reviewed: all 9 pages, compared paragraph by paragraph with `book-src` (no dropped or added sentences, facts or numbers)
- Docs paragraphs changed: 4 (faqs 1, transparency 1, white-hat-economy 2)

## 3. CRITICAL / MAJOR issues

| # | Sev | Key / file | Old → New | Why (back-translation) |
|---|---|---|---|---|
| 1 | MAJOR | `landing.score.cooldownIn`, `landing.score.cooldownAfterHolding` | `+{amount} پس از {duration} قابل استفاده می‌شود` → `{amount} امتیاز دیگر پس از {duration} قابل استفاده می‌شود` | Bidi: under `dir=rtl` the leading "+" resolves RTL and renders as "12.5+", which looks like a different number. New: "12.5 more points become usable after 7 days". |
| 2 | MAJOR | `fileClaim.form.tokenAmountHelp` (+ `holdingRequirement.unavailable`) | `شرط نگهداری {symbol}: دست‌کم از {holding} ملاک…` → `باید {symbol} را دست‌کم از این زمان در کیف پول خود نگه داشته باشید: {holding} ملاک…`; unavailable fragment now starts with «آغاز بازه‌ی…» | The old composed sentence was a verbless fragment ("Holding requirement USDC: at least from 7,200 blocks before the incident."). Persian puts the verb last, but `{holding}` ends the clause with its own period, so the verb has to come before the colon. New: "You must have held USDC in your wallet at least since this point: 7,200 blocks before the incident." |
| 3 | MAJOR | `fileClaim.form.boostersHelp` | `…برآورده کنند: دست‌کم از {holding} فقط…` → `…لازم است، یعنی دست‌کم از این زمان در کیف پول شما بوده باشند: {holding} فقط…` | Same composed-fragment problem as #2. |
| 4 | MAJOR | `fileClaim.stage.*`, `lib.claimStage.*` (claimOpen/claimClosed/settleOpen/payoutOpen/payoutClosed) | `ثبت درخواست باز` → `ثبت درخواست باز است` (and similar) | The bare noun + «باز» can parse as "registering an open request", not "claims are open". Full status phrases remove the ambiguity. |
| 5 | MAJOR | `coveredProtocols.actions.claimOpen` | `ثبت درخواست باز` → `مهلت ثبت درخواست` | Table button with a timer. It now reads "Claim window (2 days and 3 hours left)". |
| 6 | MAJOR | `app.claim.cancel.noUnresolved`, `app.claim.finalize.noUnresolved` | `درخواست بازی` → `درخواست تعیین‌تکلیف‌نشده‌ای` | «درخواست بازی» also reads as "a game request" (بازی = game). |
| 7 | MAJOR | `simulateClaim.results.scoreShare` / `lossCap` | `سهم امتیاز A ({percent}%)` → `سهم امتیاز (A): {percent}%` | "Score share A" read as a name, and the RTL bidi would have shown "A." as ".A". The label now ties cleanly to `Payout = min(A, B)`. |
| 8 | MAJOR | `landing.yieldIllustration.smallPool` | `استخر کوچک` → `استخر کوچک و سقف‌دار` | The word "capped" had been dropped. |
| 9 | MAJOR | faqs.md:23 | `تا وقتی دست‌کم 7 روز … گذشته باشد` → `به شرط آنکه دست‌کم 7 روز … گذشته باشد` | «تا وقتی» can be read as "until", which inverts the condition. New: "provided at least 7 days have passed since you earned your score". |
| 10 | MAJOR | transparency.md:16 | `فراخوانی دائمی endBetaMode` → `فراخوانی endBetaMode، که … را برای همیشه غیرفعال می‌کند` | Old: "permanent calling of endBetaMode". In English, "permanently" modifies the disabling. |

MINOR fixes:
- `landing.coverPools.help`: "capped share" now uses the clearer «سقف مشخصی از موجودی استخر», and «اعلام شود» became «ثبت شود».
- `landing.asset.scoreRateHelp*`: «واریز می‌شود», which collides with the deposit term, became «به حسابتان اضافه می‌شود».
- `landing.footer.openSourceWithDataTime`: "Data as of" now reads «داده‌ها مربوط به» instead of «تا» ("up to").
- `notices.site.message`: "at the end" now reads «در پایان بتا».
- white-hat-economy.md: "enforcement layer" now reads «لایه‌ی ضمانت اجرا» instead of «لایه‌ی اجرایی» ("executive layer").
- Shared `CONSENT_TEXT.message`: smoother phrasing for "understand aggregate site usage".

## 4. Back-translation of money-critical strings

| Key | Persian | Literal English | Match |
|---|---|---|---|
| fileClaim.requirement | ارزش {symbol} در برابر دارایی پایه‌اش باید بیش از 20% افت کند؛ این افت با مقایسه‌ی قیمت TWAP درست پیش و پس از آن سنجیده می‌شود. | X's value against its underlying must fall more than 20%; measured by comparing TWAP price just before and after. | yes |
| fileClaim.form.tokenAmountHelp | باید {symbol} را دست‌کم از این زمان … نگه داشته باشید: {holding} ملاک … کمترین موجودی شما در این بازه است … ودیعه‌ی درخواست شما ضبط می‌شود. | You must have held X at least since: N blocks before the incident. Eligibility uses your lowest balance in that window… if zero, bond is forfeited. | yes |
| fileClaim.form.claimBondHelp | برای ثبت درخواست، ودیعه‌ای 10 USD8 برای جلوگیری از اسپم لازم است. اگر واجد شرایط دریافت خسارت نباشید، این ودیعه بازگردانده نمی‌شود. | A 10 USD8 anti-spam deposit is needed to file; not returned if you are not eligible. | yes |
| fileClaim.form.scoreHelp | … در تسویه، این مقدار حداکثر تا امتیاز قابل استفاده‌ی شما در نظر گرفته می‌شود و امتیاز فقط زمانی مصرف می‌شود که یک پرداخت واجد شرایط را بپذیرید. | Settlement counts it at most up to your available score; score is spent only when you accept an eligible payout. | yes |
| fileClaim.form.boostersHelp | … فقط بوسترهای واجد شرایط وزن پرداخت را بالا می‌برند و هنگام پذیرش پرداخت سوزانده می‌شوند. بوسترهای اضافی بازگردانده می‌شوند و اگر پرداخت را رد کنید، همه‌ی بوسترها به شما برمی‌گردند. | Only eligible boosters raise payout weight and are burned on acceptance; excess returned; decline returns all. | yes |
| fileClaim.payout.ineligible | شما واجد شرایط دریافت پرداخت نیستید و ودیعه‌ی {bond} USD8 شما بازپرداخت نمی‌شود. برای بستن درخواست، توکن‌های خود را پس بگیرید. | You are not eligible for payout and your N USD8 bond is not refunded. Take back your tokens to close the claim. | yes |
| fileClaim.action.cancelPayoutReturnTokens | رد پرداخت و پس‌گرفتن توکن‌ها | Decline payout and take back tokens | yes (28 chars vs 31 EN) |
| fileClaim.action.returnTokens | پس‌گرفتن توکن‌ها | Take back tokens | yes |
| fileClaim.metric.bondNotRefunded | بازپرداخت نمی‌شود: شرایط برقرار نیست | Not refunded: conditions not met | yes |
| fileClaim.statusDescription.settlementExpired | مهلت تسویه تمام شد؛ لطفاً دارایی امانی خود را برداشت کنید. | Settlement window ended; please withdraw your escrowed asset. | yes |
| fileClaim.noClaimInIncident | … مهلت ثبت درخواست تمام شده، اما تسویه به مجوز نیاز ندارد و هر کسی می‌تواند آن را انجام دهد. | Filing closed, but settlement needs no permission; anyone can do it. | yes |
| fileClaim.weight.summary | حداکثر وزن پرداخت: … — {share} از وزن موقت کل امانت‌ها؛ وزن نهایی به احراز شرط نگهداری بستگی دارد. | Max payout weight … — share of provisional total escrow weight; final depends on holding check. | yes |
| simulateClaim.intro | … در تسویه همه‌چیز دوباره در TEE محاسبه می‌شود؛ بنابراین پرداخت نهایی ممکن است متفاوت باشد. | Settlement recomputes all in the TEE, so final payout may differ. | yes |
| simulateClaim.lossValue.help | … بر اساس میانگین قیمت 7 روز پیش از افت. سقف خسارت درصدی از همین ارزش است. | …at the 7-day average price before the drop; loss cap is a % of this value. | yes |
| coveredProtocols.columns.maxCoverageHelp | حداکثر جبران خسارت فعلی … طبق تنظیمات آن‌چین. مبلغ واقعی پرداخت به امتیاز بیمه‌ی کاربر و محدودیت‌های استخر پوشش بستگی دارد. | Current onchain max reimbursement…; actual payout depends on score and pool limits. | yes |
| landing.coverPools.help | … اگر ارزش یکی از آن‌ها 20% یا بیشتر افت کند … حداکثر تا سقف مشخصی از موجودی استخر. برداشت 7 روز دوره‌ی انتظار دارد و دارایی‌هایی که در انتظار برداشت‌اند همچنان پشتوانه‌ی پرداخت خسارت‌ها هستند. | If one drops 20% or more…, up to a set cap of pool balance per incident. 7-day cooldown; assets waiting still back claims. | yes |
| landing.coverPools.warning | … ممکن است از سپرده‌های استخر برای پرداخت خسارت‌ها استفاده شود … | …pool deposits may be used to pay claims… | yes |
| landing.pool.earningsHelp | درآمد به USD8 پرداخت می‌شود، نه {asset}. درآمد در معرض درخواست‌های خسارت نیست و هر زمان قابل برداشت است. | Earnings paid in USD8, not X; not exposed to claims; withdrawable any time. | yes |
| landing.claims.availableHelp | امتیاز پس از گذشت {duration} قابل استفاده می‌شود؛ امتیازی که پیش‌تر صرف درخواست‌های خسارت شده از آن کسر می‌شود. | Score becomes usable after N; score already spent on claims is deducted. | yes |
| transactions.pool.withdrawAvailability | {amount} سهم در دسترس. اگر درخواست خسارتی در جریان نباشد، برداشت پس از دوره‌ی انتظار 7 روزه ممکن می‌شود؛ وگرنه پس از نهایی شدن همه‌ی درخواست‌ها. | N shares available. If no pending claim, withdrawal possible after the 7-day cooldown; otherwise after all claims finalize. | yes |
| transactions.pool.mayDecrease | اگر استخر پیش از نهایی شدن برداشت شما خسارتی بپردازد، ممکن است کمتر شود. | If the pool pays a claim before your withdrawal settles, it may decrease. | yes |
| app.pool.cooldownStarted | دوره‌ی انتظار آغاز شد. این مبلغ دیگر بازدهی کسب نمی‌کند و اگر استخر پیش از نهایی شدن خروج شما خسارتی بپردازد، ممکن است کاهش یابد. | Cooldown started. Amount stops earning and may decrease if pool pays claims before exit settles. | yes |
| notices.site.message | … امتیاز بیمه را با نرخ تقویت‌شده‌ی 300% کسب می‌کنند و در پایان بتا 3 بوستر دریافت خواهند کرد. | …earn score at a 300% boosted rate and will get 3 boosters at end of beta. | yes |
| terms.disagreeNote | اگر نپذیرید، اتصال کیف پول شما قطع می‌شود. به هیچ امضا یا تراکنشی نیاز نیست. | If you don't agree, your wallet is disconnected. No signature or transaction needed. | yes |
| CONSENT_TEXT.message | … ابزار تحلیل فقط پس از موافقت شما بارگذاری می‌شود و رد کردن آن هیچ اثری بر کارکرد اپلیکیشن ندارد. | Analytics loads only after you consent; rejecting has no effect on the app. | yes |
| docs defi-insurance §1 conditions 1–3 + bond | … بیش از 20% … 1 تا 6 روز گذشته … دست‌کم 7 روز پیش از افت … ودیعه‌ای 10 USD8 … اگر شرط 2 و 3 برقرار باشد، به‌طور کامل بازپرداخت می‌شود. | >20% in past 1–6 days; score earned ≥7 days before; held ≥7 days; 10 USD8 bond fully refunded if 2 & 3 met. | yes |
| docs cover-pools Withdraw | … 7 روزه … در دوره‌ی بتا ممکن است 9 تا 12 روز دیگر (و پس از بتا 6 تا 9 روز) … همچنان در معرض پرداخت خسارت‌های بیمه | 7-day; may take another 9–12 days in beta (6–9 after) from first claim; still exposed to payouts. | yes |

## 5. Term decisions

- **Mint: kept «ضرب»** (not «مینت»). «ضرب» is the established Persian word for coin and stablecoin issuance and pairs with «سوزاندن» (burn). «مینت» mostly appears for NFTs and reads like a loan transliteration. The context (USD8 card, «ضرب USD8» dialog title) removes any "multiply" reading. This is recorded in the glossary.
- **Bond: kept «ودیعه»**. It is the right word for a refundable guarantee deposit and stays distinct from «سپرده» (pool deposit). Forfeiture is «ضبط».
- **Claim: kept «درخواست خسارت»**, with short «درخواست» where the context is clear. This is natural insurance phrasing; «ادعا» would be a calque.
- **Return Tokens: kept «پس‌گرفتن توکن‌ها»**. It is correct direction-wise: the user takes back the escrowed tokens.
- **New:** claim-stage labels became full status phrases («… باز است / … بسته شد»), and the timed table button uses «مهلت ثبت درخواست». The glossary is updated.
- **New typography rule:** no leading "+{amount}" in RTL strings. The glossary is updated.

## 6. Left for human judgement

- «ضرب» vs «مینت» is a defensible call either way. If the owner's Persian community uses «مینت» heavily, switch the Mint keys in `landing`, `transactions`, `app` and `lib` together.
- `landing.header.retryData` «دریافت دوباره‌ی داده‌ها» and `app.score.retry` «بارگذاری دوباره‌ی امتیاز» are about 2x the English character count. They appear in error-notice buttons, not the header bar, so I left them as they are. If they wrap on 390px, shorten both to «تلاش دوباره» and update `lib.pool.withdrawalAmountsUnavailable`, which quotes the button name.
- Source issue (English, not fa): `en` `fileClaim.form.tokenAmountHelp` / `boostersHelp` have no space after `{holding}`, so English renders "incident.Eligibility". The fa strings include the space.
- `book-i18n/_review/fa-shared.json` `CONSENT_TEXT.message` changed. The copy already inlined in `analytics.js` needs to be re-synced by whoever owns that file.
