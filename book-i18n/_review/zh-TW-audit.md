# zh-TW (Traditional Chinese, Taiwan) — independent audit

## 1. Verdict

**READY WITH NOTES** — confidence **high** that a Taiwanese user finds it accurate and natural.
This reads as genuine Taiwan copy, not converted Simplified Chinese. It uses 提領, 理賠金/給付, 封測, 稽核, 帳戶, 網路, 部位, 儲存庫, 社交工程, 賽局理論, 誘因, 「」 quotes and ／, consistently.

I checked automatically for leftovers from Simplified-to-Traditional conversion:
- Running OpenCC s2twp over every string changes only already-correct Traditional phrasing (演算法, 連接, 了解), so no Simplified characters remain.
- None of these leftover words appear: 天后, 上鍊, 引數, 許可權, 型別, 銷燬, 賬, 獲取, 當前, 實時, 檢測, 超時, 配置, 渠道, 博弈, 倉位, 反饋, 彈窗, 滑塊, 盈利, 完結, 暫無.
- 視窗 is used only for UI dialogs, as the glossary requires.
- Typography is clean: no CJK–Latin/digit/placeholder spaces, full-width punctuation.

## 2. Counts

- Strings reviewed: 494 app strings (15 namespaces) + 29 shared = 523
- Strings changed: 5 (app JSON); shared: 0
- Docs: all 8 pages compared paragraph by paragraph with `book-src/`. Docs paragraphs changed: 3

## 3. CRITICAL / MAJOR issues

| Sev | Key / file | Old → New | Why (back-translation) |
|---|---|---|---|
| MAJOR | notices `site.message` | 封測使用者持有USD8可享300%的保險積分速率加成 → 封測期間持有USD8，保險積分累積速率提升至300% | Old reads as a "+300% bonus" (4×). The flag "x300%" means 3×. New: "accrual rate raised to 300%". |
| MINOR | settlement `finality.minutesToGo` / `explanation` | 還要約N分鐘 → 約N分鐘後可結算; 等已最終確認的區塊超過… → 等最終確認區塊的時間超過… | Now says what becomes possible, and that it is the block *time* that passes the deadline. |
| MINOR | app `claim.insufficientUsd8ForAmountAndBond` | 無法同時支付受保數量與理賠保證金 → USD8餘額不足以同時支應申請理賠的數量與理賠保證金 | "pay the insured quantity" was unclear. |
| MINOR | simulateClaim `intro` | 重新計算所有數據 → 重新計算所有數值 | 資料/數值 is the Taiwan UI register here, not 數據. |
| MINOR | docs cover-pools.md:6 | 以USD8支付年化收益 → 以USD8發放年化收益 | More natural verb for yield distribution, consistent with app strings (以USD8發放). |
| MINOR | docs defi-insurance.md:13 | 換回最高價值0.8 USDC的理賠金 → 每個aUSDC最多可從承保池換回價值0.8 USDC的資產 | Makes clear the figure is per aUSDC. |
| MINOR | docs faqs.md:29 | 理賠金最高為80% → 理賠金最高為損失價值的80% | Says what the 80% is a share of. |

There were no CRITICAL issues. The "Claim Open" table button was already correct (開放申請中).

## 4. Money-critical back-translations

| Key | zh-TW | Back-translation | Match |
|---|---|---|---|
| fileClaim.requirement | {symbol}相對其底層資產的價值須下跌超過20%，以下跌前後緊鄰的兩個TWAP價格計算 | Must drop >20% vs underlying, measured by adjacent TWAPs before/after | yes |
| fileClaim.form.claimBondHelp | 申請理賠須繳交10 USD8的防濫用保證金。若你不符合理賠資格，保證金將不予退還。 | 10 USD8 anti-abuse bond; not refunded if ineligible | yes |
| fileClaim.form.tokenAmountHelp (+blocks) | {symbol}有持有時間要求：最晚須在理賠事件發生前N個區塊開始持有。資格以這段期間內你的最低餘額計算，之後才買進的代幣不列入。若這個餘額為零…保證金也會被沒收。 | Must start holding at latest N blocks before incident; lowest balance counts; later tokens excluded; zero → bond forfeited | yes |
| fileClaim.form.scoreHelp | 結算時會以你的可用積分為上限，而且只有在你接受合格的理賠金時才會實際扣除 | Capped at available score; only deducted on accepting eligible payout | yes |
| fileClaim.form.boostersHelp | 只有符合資格的加成卡會提高理賠權重，並在接受理賠金時銷毀；多出的會退還。放棄理賠金則會退還所有加成卡。 | Only eligible boosters count and burn on acceptance; excess returned; decline returns all | yes |
| fileClaim.payout.ineligible | 你不符合理賠資格，{bond} USD8保證金也不予退還。請取回代幣以結束這筆理賠。 | Ineligible; bond not refunded; return tokens to close | yes |
| fileClaim.statusDescription.payoutExpired | 理賠金領取期已結束，請取回你託管的資產 | Payout window closed; withdraw escrow | yes |
| fileClaim.statusDescription.settlementExpired | 結算期已結束，請取回你託管的資產 | Settlement window closed; withdraw escrow | yes |
| fileClaim.weight.summary | 最高理賠權重…佔目前暫定託管總權重的{share}；最終權重取決於持有資格 | matches | yes |
| coveredProtocols.columns.maxCoverageHelp | 各代幣目前在鏈上設定的最高理賠比例。實際理賠金額取決於使用者的保險積分與承保池理賠上限。 | matches | yes |
| coveredProtocols.columns.insuredTokenHelp | 發生受保的損失事件後，可用來申請理賠的資產；能否獲賠仍須視保險積分與理賠規則而定 | Asset claimable after covered loss; subject to score and rules | yes |
| simulateClaim.insuredToken.help | 持有同一種代幣的承保池不參與這起理賠事件的給付 | Same-token pool excluded from this incident | yes |
| simulateClaim.lossValue.help | 以下跌前7天的平均價格計算。損失上限是這個價值的特定百分比。 | 7-day average price before drop; cap is a % of it | yes |
| landing.coverPools.help | …每起事件的給付以承保池一定比例為上限。提領須經過7天冷卻期，等待提領的資產仍須承擔理賠。 | matches | yes |
| landing.coverPools.warning | 一旦受保代幣發生損失，承保池的存款可能會被用來支付理賠 | matches | yes |
| landing.pool.earningsHelp | 收益以USD8發放，而不是{asset}。收益不承擔保險理賠，可隨時提領。 | matches | yes |
| landing.claims.availableHelp | 積分獲得後須經過{duration}才能使用，並會扣除已用於理賠的積分 | matches | yes |
| transactions.pool.withdrawAvailability | 若沒有待處理的理賠，{cooldown}結束後即可提領；否則須等所有理賠結案 | matches | yes |
| transactions.pool.mayDecrease | 若承保池在你的提領結算前給付理賠，這個金額可能會減少 | matches | yes |
| app.pool.cooldownStarted | 這部分資產會停止產生收益；若承保池在你退出結算前給付理賠，金額可能會減少 | matches | yes |
| lib.pool.depositsPausedForIncident | 保險理賠事件#{n}處理期間暫停存入，請在該事件結案後再試 | matches | yes |
| notices.site.message (new) | 封測期間持有USD8，保險積分累積速率提升至300%，封測結束時還會獲得3張加成卡 | Score rate raised to 300% in beta; 3 boosters at end | yes |
| docs defi-insurance §1–3 | 超過20%／過去1–6天／至少7天／10 USD8保證金…符合條件2和3就會全額退還／第一筆有效理賠送出3天後申請期結束／結算期最長3天／管理員額外3天／理賠金領取期3天 | all numbers and conditions intact | yes |
| docs defi-insurance example | 50%→$1125；80%即$900；A最多$300、B最多$600；上限$400；A獲賠$300、B獲賠$400 | identical | yes |
| docs cover-pools Withdraw/Limit | 7天冷卻期…9–12天（Beta）／6–9天…冷卻中資產仍須承擔理賠給付…單一事件最多不超過承保池當下規模的50% | matches | yes |
| CONSENT_TEXT.message | 我們只會在你同意後載入分析功能；拒絕也不會影響應用程式的正常使用 | matches | yes |

## 5. Term decisions changed

- "300% boosted rate" → 積分累積速率提升至300% (not 300%加成). Added to `_glossary/zh-TW.md`, together with Claim Open → 開放申請／開放申請中, which the app already used.
- No other term changes. The existing Taiwan glossary choices hold up: 年化報酬率 in prose / 7日年化 in labels, 理賠金 vs 給付, 提領, 封測, 稽核, 結案, and 期 (not 視窗) for time windows.

## 6. For human judgement

- English inconsistency: "drops 20% **or more**" (landing help, cover-pools.md warning) vs "**more than** 20%" (claim rules). Each is translated as written.
- The docs say Boosters are "burnt when filing a claim". The app says they are burned on acceptance. The translation follows each source.
- FAQ "10 USD8 bond, refunded after claim" leaves out the "if conditions are met" caveat. The translation is faithful.
- CONSENT text uses 選用性的 for "optional". This is acceptable; 非必要 is the other common Taiwan cookie-banner wording if the owner prefers it.
