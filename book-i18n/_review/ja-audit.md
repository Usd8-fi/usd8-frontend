# Japanese (ja) translation audit — independent review

## 1. Verdict

**READY WITH NOTES.** Confidence: **high** that a native Japanese crypto user will find the app strings and docs accurate and natural. The first pass was already strong: idiomatic です・ます prose, consistent terms (請求, 精算, 保険スコア, カバープール, クールダウン, 保証金, エスクロー), correct CJK typography, and no numbers, units, negations or caveats dropped. Every fix below is a precision or clarity improvement. None corrects a reversed meaning.

## 2. Counts

- App strings reviewed: 501 (15 namespaces) + 30 shared docs/consent strings (`ja-shared.json`)
- Docs reviewed: 9 pages (SUMMARY, usd8, philosophy, defi-insurance, cover-pools, white-hat-economy, faqs, transparency, addresses), compared paragraph by paragraph with `book-src/`. No sentences, facts, examples or numbers were dropped or added.
- Strings changed: 6
- Docs paragraphs/list items changed: 2
- Glossary: 2 rows added

## 3. CRITICAL / MAJOR issues

No CRITICAL issues found.

**MAJOR 1: `fileClaim.holdingRequirement.blocks`** (inserted into `tokenAmountHelp` and `boostersHelp`)
- Old: インシデントの{blocks}ブロック前から保有している必要があります。
- Back-translation: "must have held it from {blocks} blocks before the incident". The English "at least" is missing.
- New: インシデントの{blocks}ブロック**以上**前から保有している必要があります。
- Assembled sentence: 「wstETHをインシデントの50400ブロック以上前から保有している必要があります。対象かどうかはその期間中の最低残高で判定されるため…」

**MAJOR 2: `fileClaim.holdingRequirement.unavailable`**
- Old: インシデント前の所定の期間から保有している必要があります。
- Back-translation: "must have held it from the configured period before the incident". This is vague, and "for at least / throughout" is lost.
- New: インシデント前の所定の期間**を通じて**保有している必要があります。
- New back-translation: "must have held it throughout the configured pre-incident window".

**MAJOR 3: `notices.site.message`** (beta reward terms)
- Old: …獲得レートが300%にブーストされ、終了時に3つのブースターを受け取れます。
- Literally this says "boosted to 300%", which is correct. But Japanese readers commonly misread "300%ブースト" as "+300%" (4x). "終了時" also did not say what ends.
- New: …獲得レートが**通常の3倍（300%）**になり、**ベータ終了時には**3つのブースターを受け取れます。
- New back-translation: "the rate becomes 3x the normal rate (300%), and you receive 3 boosters when the beta ends".

## 4. MINOR changes

- `landing.usd8.flag`: x300%（プライベートベータ限定） → **3倍（プライベートベータ限定）**. 「x300%」 is not a natural Japanese promo form and is ambiguous. 「3倍」 is the standard wording and matches the owner's meaning: the rate is 3x.
- `fileClaim.weight.summary`: removed the doubled parentheses that appeared when `{boosters}` (（ブースター2個を含む）) was followed by （…全体の{share}）. Now: 最大支払いウェイト：{weight}{boosters}。暫定エスクローウェイト全体の{share}に相当し、最終的なウェイトは保有要件の判定で決まります。
- `landing.score.holdingPeriod`: 保有期間 → 所定の保有期間. This is the fallback for `{duration}` in `availableHelp`, so it now reads 「獲得から所定の保有期間後に利用可能」.
- `book-i18n/ja/defi-insurance.md`, claim condition 3: 価格下落前の7日以上、…保有 → **価格下落の7日以上前から**、…保有. The old phrasing was stiff; the new one is the natural "held since at least 7 days before".
- `book-i18n/ja/transparency.md`, endBetaMode item: reordered so that 「恒久的に」 modifies 無効化, as in the English.

## 5. Back-translation of the most money-critical strings

| Key / location | Japanese | Literal back-translation | Matches? |
|---|---|---|---|
| fileClaim.requirement | 請求するには、{symbol}の価値が原資産に対して20%を超えて下落している必要があります。下落幅は、下落直前と直後のTWAP価格で測定します。 | To claim, {symbol}'s value must have fallen by more than 20% vs its underlying; measured with TWAP right before and after the drop. | yes |
| landing.claims.intro | 保険対象トークンが原資産に対して20%を超えて下落した場合、保険スコアを使って保険金を請求できます。 | If an insured token drops more than 20% vs its underlying, you can claim using your insurance score. | yes |
| fileClaim.holdingRequirement.blocks (new) | インシデントの{blocks}ブロック以上前から保有している必要があります。 | Must have held it since at least {blocks} blocks before the incident. | yes |
| fileClaim.form.tokenAmountHelp (tail) | 対象かどうかはその期間中の最低残高で判定されるため、後から取得したトークンは算入されません。その残高がゼロの場合は対象外となり、請求保証金は没収されます。 | Eligibility uses the lowest balance in that window, so later tokens don't count. If that balance is zero you're ineligible and the bond is forfeited. | yes |
| fileClaim.form.claimBondHelp | 請求には、スパム防止のための10 USD8の保証金が必要です。請求の対象外だった場合、保証金は返金されません。 | A 10 USD8 anti-spam bond is required. Not refunded if you're ineligible. | yes |
| fileClaim.form.scoreHelp | 使用したいスコアを指定します。精算時には利用可能なスコアが上限となり、スコアが実際に使用されるのは、対象となる支払いを受け取った場合のみです。 | Specify the score you want to use; settlement caps it at available score; score is actually spent only if you accept an eligible payout. | yes |
| fileClaim.form.boostersHelp | 任意です。ブースターも保険対象トークンと同じく、{holding}支払いウェイトを高めるのは対象となるブースターのみで、支払いを受け取るとバーンされます。余ったブースターは返還され、支払いを辞退した場合はすべて返還されます。 | Optional; boosters have the same holding requirement; only eligible ones raise weight and are burned on acceptance; excess returned; declining returns all. | yes |
| fileClaim.payout.ineligible | 支払いの対象外のため、{bond} USD8の保証金は返金されません。トークンを引き出して請求を終了してください。 | You're not eligible, so the {bond} USD8 bond is not refunded. Withdraw tokens to close the claim. | yes |
| fileClaim.metric.bondNotRefunded | 返金されません（条件未達） | Not refunded (conditions not met) | yes |
| coveredProtocols.columns.maxCoverageHelp | 掲載中の各トークンについて、現在オンチェーンで設定されている補償の上限です。実際の支払額は、ユーザーの保険スコアとカバープールの上限によって決まります。 | Current onchain coverage maximum per listed token; actual payout depends on score and cover-pool limits. | yes |
| landing.asset.coverageHelp | 補償額は、カバープールで利用可能な資金の範囲内に限られます。 | Coverage is limited to the funds available in the cover pools. | yes |
| landing.coverPools.help | …20%以上下落してインシデントが開始されると、プールの資産から有効な請求への支払いが行われます（1インシデントあたりの上限はプールの一定割合）。引き出しには7日間のクールダウンがあり、引き出し待ちの資産も引き続き請求の補償に充てられます。 | If one drops 20% or more and an incident opens, pool assets pay valid claims (per-incident cap = a share of the pool). 7-day withdrawal cooldown; assets waiting to withdraw still cover claims. | yes |
| landing.coverPools.warning | …保険対象トークンに損失が発生した場合、預け入れた資産が請求の支払いに使われる可能性があります。 | If an insured token suffers a loss, deposits may be used to pay claims. | yes |
| landing.pool.earningsHelp | 収益は{asset}ではなくUSD8で支払われます。保険の請求に充てられることはなく、いつでも引き出せます。 | Earnings are paid in USD8, not {asset}; never used for claims; withdrawable anytime. | yes |
| app.pool.cooldownStarted | クールダウンを開始しました。この金額には利回りが付かなくなり、引き出しが確定する前にプールが請求の支払いを行った場合は減少することがあります。 | Cooldown started; this amount stops earning and may decrease if the pool pays claims before your withdrawal settles. | yes |
| transactions.pool.withdrawAvailability | 利用可能：{amount}シェア。保留中の請求がなければ{cooldown}後に引き出せます。請求がある場合は、すべての請求が確定した後に引き出せます。 | Available: N shares. Withdrawable after {cooldown} if no pending claims; otherwise after all claims are finalized. | yes |
| lib.cooldown.readyIn.day_other | あと{count}日で引き出し可能 | Withdrawable in {count} days | yes (pinned by test) |
| lib.pool.depositsPausedForIncident | 保険インシデント#{incident}の対応中は、預け入れを一時停止しています。インシデントの確定後に再度お試しください。 | Deposits paused while incident #N is active; try again after it's finalized. | yes |
| landing.claims.availableHelp | スコアは獲得から{duration}後に利用可能になります。請求にすでに使用したスコアは差し引かれます。 | Score becomes usable {duration} after being earned; score already spent on claims is deducted. | yes |
| notices.site.message (new) | …保険スコアの獲得レートが通常の3倍（300%）になり、ベータ終了時には3つのブースターを受け取れます。 | …score rate becomes 3x (300%), and you get 3 boosters when the beta ends. | yes |
| simulateClaim.intro | …精算時にはTEEですべてが再計算されるため、最終的な支払額は異なる場合があります。 | Settlement recalculates everything in the TEE, so the final payout may differ. | yes |
| simulateClaim.lossValue.help | 請求する保険対象トークンの価値で、下落前7日間の平均価格で算出します。損失上限は、この価値に対する割合です。 | Value of the tokens claimed for, at the 7-day average price before the drop; loss cap is a % of this. | yes |
| docs defi-insurance, step 1 | 価格下落の7日以上前に獲得した、未使用の保険スコア／価格下落の7日以上前から…保有 | Unspent score earned ≥7 days before the drop / held ≥7 days before the drop | yes |
| docs defi-insurance, example | 上限50% → 1125ドル、その80% → 900ドル、A 300ドル／B 600ドル、上限400ドル、A 300ドル・B 400ドル | Same numbers as the English | yes |
| docs cover-pools, payout limit | 各インシデントの支払額は、その時点のカバープールの規模の50%まで | Each incident's payout is capped at 50% of the current pool size | yes |
| docs faqs, revenue | 支払いの残り20%：請求者が受け取れる補償は最大80%なので、残る20%がUSD8の手数料 | The leftover 20%: claimers get at most 80%, so the remaining 20% is USD8's fee | yes |
| CONSENT_TEXT.message | 任意のGoogle Analytics Cookie…分析は同意いただいた場合にのみ読み込みます。拒否しても、アプリの利用には影響しません。 | Optional GA cookies; analytics loads only after you accept; rejecting doesn't affect the app. | yes |

## 6. Term decisions changed

- Beta score boost: 300%にブースト / x300% → 通常の3倍（300%）, label 3倍. This avoids the "+300%" misreading. Added to the glossary.
- Holding requirement: always 「〜以上前から保有」 so that "at least" is never dropped. Added to the glossary.
- All other glossary terms (年利, 7日/30日平均年利, 預け入れ総額, 請求, 精算, 保証金, エスクロー, 出金キュー, クールダウン) were confirmed and are used consistently across the app JSON, docs and shared strings.

## 7. Left for human judgement

- The English source is inconsistent about the trigger: "20% or more" (`landing.coverPools.help`, cover-pools.md warning) versus "more than 20%" (claim requirement, FAQ, code). The ja translation follows each English string faithfully (20%以上 vs 20%を超えて). The owner may want to unify the English to ">20%".
- `lib.claimService.*{code}`: the code inserts ` (CODE)` with ASCII parentheses and a leading space, so ja reads 「…失敗しました (X)。」. This is acceptable for a machine error code. Fixing it would need a code change, which is outside a translator's scope.
- FAQ "支払額の上限は80%" mirrors the English "Max payout amount is 80%", which does not say 80% of what. The defi-insurance page makes it clear (価値の80%).
