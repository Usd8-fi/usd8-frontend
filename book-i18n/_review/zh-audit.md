# zh (Simplified Chinese, zh-CN) — independent audit

## 1. Verdict

**READY WITH NOTES** — confidence **high** that a mainland native user finds it accurate and natural.
The text was already a careful idea-level translation. No number, condition, negation or caveat was wrong. Two strings could mislead (the 300% beta boost and the "Claim Open" button), and I fixed both. The rest were fluency/clarity touch-ups. Typography follows the owner's rules everywhere: no CJK–Latin/digit/placeholder spaces, full-width punctuation, 你 not 您, no Traditional characters (checked automatically with OpenCC t2s).

## 2. Counts

- Strings reviewed: 494 app strings (15 namespaces) + 29 shared (docs widget/picker/consent) = 523
- Strings changed: 11 (app JSON); shared: 0
- Docs paragraphs reviewed: all 8 pages, paragraph by paragraph against `book-src/` (cover-pools.md checked against the current working copy, which fixes the "Diligence" typo — zh already had it right). Docs paragraphs changed: 3

## 3. CRITICAL / MAJOR issues

| Sev | Key / file | Old → New | Why (back-translation) |
|---|---|---|---|
| MAJOR | notices `site.message` | 内测用户持有USD8可享300%保险积分速率加成 → 内测期间持有USD8，保险积分累积速率提升至300% | Old reads as "a 300% bonus on the rate", i.e. +300% = 4×. The flag says "x300%" (3×). New: "the score accrual rate is raised to 300%". |
| MAJOR | coveredProtocols `actions.claimOpen` | 理赔进行中 → 开放申请中 | Old says "a claim is being processed", which hides that the button is open for filing (with a countdown). New: "open for applications", matching `fileClaim.stage.claimOpen` 开放申请. |
| MINOR→clarity | fileClaim `holdingRequirement.blocks` + `form.tokenAmountHelp` + `form.boostersHelp` + `holdingRequirement.unavailable` | 你须至少从以下时点起持有{symbol}：理赔事件发生前N个区块。… → {symbol}的持有要求：须在理赔事件发生前至少N个区块就已持有。… | Old assembled sentence was awkward ("from the following point in time: N blocks before the incident."). Same meaning, now reads naturally with both the `blocks` and `unavailable` variants. |
| MINOR | app `claim.holdingWindowUnavailable` | 持有期窗口暂不可用 → 暂时无法获取持有期信息 | "holding-period window unavailable" was a calque. |
| MINOR | app `claim.insufficientUsd8ForAmountAndBond` | 无法同时支付受保数量和理赔保证金 → USD8余额不足以同时支付申请理赔的数量和理赔保证金 | "pay the insured quantity" was unclear. |
| MINOR | settlement `finality.minutesToGo` / `explanation` | 约N分钟后 → 约N分钟后可结算; 最终确认区块越过理赔截止时间后 → 一旦最终确认区块的时间超过理赔申请截止时间 | The fragment "in about N min" did not say what happens then. "A block crosses a deadline" was a calque. |
| MINOR | app `pool.completeWithdrawal` | 提取已到期的资产 → 提取冷却期已满的资产 | "matured" here means the cooldown is complete. 到期 suggests expiry. |
| MINOR | docs cover-pools.md:6 | 以USD8支付收益 → 以USD8发放年化收益 | "APY" had been dropped. |
| MINOR | docs defi-insurance.md:13 | 换回最高价值0.8 USDC的赔付 → 每个aUSDC最多可从承保池换回价值0.8 USDC的资产 | Makes clear the figure is per aUSDC (1 → 0.3 example). |
| MINOR | docs faqs.md:29 | 赔付比例最高为80% → 赔付最高为损失价值的80% | Says what the 80% is a share of. |

## 4. Money-critical back-translations

| Key | zh | Back-translation | Match |
|---|---|---|---|
| fileClaim.requirement | {symbol}相对其底层资产须贬值超过20%（按下跌前后相邻两个TWAP价格计算） | {symbol} must lose >20% vs its underlying (measured by the two adjacent TWAP prices before/after the drop) | yes |
| fileClaim.form.claimBondHelp | 申请理赔需缴纳10 USD8防滥用保证金。如果你不符合理赔条件，保证金将不予退还。 | Filing requires a 10 USD8 anti-abuse bond. If you're not eligible it won't be refunded. | yes |
| fileClaim.form.tokenAmountHelp (+blocks) | {symbol}的持有要求：须在理赔事件发生前至少N个区块就已持有。资格按这段期间内你的最低余额计算，之后才买入的代币不计入。若该余额为零…保证金也会被没收。 | Holding requirement: must already hold ≥N blocks before the incident. Eligibility uses your lowest balance in this period; later-bought tokens don't count. If zero… bond forfeited. | yes |
| fileClaim.form.scoreHelp | 结算时以你的可用积分为上限，且只有在你接受合格赔付时才会实际扣除 | Capped at available score at settlement; only deducted if you accept an eligible payout | yes |
| fileClaim.form.boostersHelp | 只有合格的加成卡会提高赔付权重，并在接受赔付时销毁；多余的退还。放弃赔付则退还全部 | Only eligible boosters raise weight and burn on acceptance; excess returned; declining returns all | yes |
| fileClaim.payout.ineligible | 你不符合赔付条件，你的{bond} USD8保证金也不予退还。请取回代币以关闭此理赔。 | Not eligible; your bond not refunded; return tokens to close | yes |
| fileClaim.metric.bondNotRefunded | 不予退还：未满足条件 | Not refunded: conditions not met | yes |
| fileClaim.statusDescription.payoutExpired | 赔付窗口已关闭，请取回你的托管资产 | Payout window closed, withdraw your escrow | yes |
| fileClaim.weight.summary | 最高赔付权重…占当前暂定托管总权重的{share}；最终权重取决于持有资格 | Max payout weight… {share} of provisional escrow weight; final depends on holding eligibility | yes |
| coveredProtocols.columns.maxCoverageHelp | 各代币当前在链上设定的最高赔付比例。实际赔付取决于用户的保险积分和承保池赔付上限。 | Current onchain max reimbursement per token; actual payout depends on score and pool limits | yes |
| simulateClaim.intro | …结算时会在TEE中重新计算全部数据，最终赔付可能有所不同 | Settlement recomputes in TEE; final payout may differ | yes |
| simulateClaim.insuredToken.help | 持有同一代币的承保池不参与该代币理赔事件的赔付 | A pool holding the same token doesn't pay for that incident | yes |
| simulateClaim.lossValue.help | 按下跌前7天均价计算。损失上限为该价值的一定比例。 | At 7-day average price before drop; loss cap is a % of it | yes |
| landing.coverPools.help | …每次事件的赔付以承保池一定比例为上限。提取需经过7天冷却期，等待提取的资产仍须承担理赔。 | …capped share per incident; 7-day cooldown; assets waiting still cover claims | yes |
| landing.coverPools.warning | 一旦受保代币发生损失，承保池存款可能被用于支付理赔 | If an insured token suffers a loss, pool deposits may pay claims | yes |
| landing.pool.earningsHelp | 收益以USD8发放，而非{asset}。收益不承担保险理赔，可随时提取。 | Paid in USD8 not {asset}; not exposed to claims; withdraw anytime | yes |
| landing.asset.coverageHelp | 保障额度受承保池可用资金限制 | Coverage limited by funds available in pools | yes |
| landing.claims.availableHelp | 积分获得后须经过{duration}才可使用，已用于理赔的积分会被扣除 | Usable after {duration}; score spent on claims is deducted | yes |
| transactions.pool.withdrawAvailability | 如无待处理理赔，{cooldown}结束后即可提取；否则须等全部理赔完结后才能提取 | If no pending claims, withdraw after cooldown; otherwise after all claims finalize | yes |
| transactions.pool.mayDecrease | 若承保池在你提取结算前支付理赔，该金额可能减少 | May decrease if pool pays claims before your withdrawal settles | yes |
| app.pool.cooldownStarted | 这部分资产将停止产生收益；若承保池在你退出结算前支付理赔，金额可能减少 | Stops earning; may decrease if pool pays claims before exit settles | yes |
| lib.pool.depositsPausedForIncident | 保险理赔事件#{n}处理期间暂停存入，请在该事件完结后重试 | Deposits paused during incident; retry after it's finalized | yes |
| notices.site.message (new) | 内测期间持有USD8，保险积分累积速率提升至300%，内测结束时还将获得3张加成卡 | Holding USD8 in beta raises score rate to 300%; 3 boosters at the end | yes |
| docs defi-insurance §1 | …跌幅超过20%…过去1–6天内…积分在价格下跌前至少7天就已获得…已持有至少7天…10 USD8保证金，只要满足条件2和3即可全额退还…首笔有效理赔提交3天后，理赔窗口即关闭 | matches all numbers/conditions | yes |
| docs defi-insurance §2 example | 50% → $1125，80%即$900…A最多$300，B最多$600…上限均为$400…A获赔$300，B获赔$400 | identical arithmetic | yes |
| docs faqs "make money" | 申请人最多只能获得80%的赔付，剩下的20%即为USD8的费用 | Claimants get max 80%; the remaining 20% is USD8's fee | yes |
| CONSENT_TEXT.message | 只有在你同意后，我们才会加载分析功能；拒绝不会影响应用的正常使用 | Analytics load only after you accept; rejecting doesn't affect the app | yes |

## 5. Term decisions changed

- Claim Open (table button) → 开放申请中 (was 理赔进行中). The table button now matches the stage label 开放申请.
- "300% boosted rate" → 积分累积速率提升至300% (not "300%加成"), so the 3× multiplier is unambiguous.
- Both are added to `_glossary/zh.md`. Everything else in the glossary is unchanged: 年化收益率/7日年化, 赔付, 提取, 内测, 窗口 for time windows, 完结 for finalized claims (结案 would also be fine; I kept it to avoid churn).

## 6. For human judgement

- English inconsistency, translated as written: landing `coverPools.help` and cover-pools.md say "drops 20% **or more**" (20%或以上), but claim rules say "**more than** 20%" (超过20%). The owner should pick one in English.
- The docs say Boosters are "burnt when filing a claim" (申请理赔时销毁). The app says they are escrowed at filing and "burned on acceptance". The translation follows each English source. The docs English may need fixing.
- FAQ "10 USD8 bond, refunded after claim" leaves out the "if conditions are met" caveat that the claim-process page states. The translation is faithful to the English.
- `lib.claimHistory.outOfRange` and `lib.cooldown.readyIn.day_other` are pinned by tests and were not touched.
