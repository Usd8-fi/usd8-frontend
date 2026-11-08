# Vietnamese (vi) translation audit

## 1. Verdict
**READY WITH NOTES.** Confidence: **high** that a Vietnamese crypto user will find it accurate, and **medium-high** that they will find it natural. The text is idiomatic product Vietnamese written by meaning, and it uses "bạn" consistently. No CRITICAL meaning errors were found. I fixed one MAJOR fee ambiguity and one MAJOR term problem ("dispute"). The remaining fixes are fluency or terminology.

## 2. Counts
- Strings reviewed: 530 (501 app JSON strings across 15 namespaces + 29 shared docs/cookie strings)
- Strings changed: 15 (app 3, transactions 2, fileClaim 6, coveredProtocols 3, shared 1)
- Docs paragraphs/list items changed: 14 (philosophy 4, defi-insurance 3, white-hat-economy 1, faqs 4, transparency 2)
- Every docs page was compared with `book-src/*.md` paragraph by paragraph. No sentences, facts, numbers, links or examples were dropped or added. The `Consensys Diligence` spelling fix in English cover-pools.md was already reflected.

## 3. CRITICAL / MAJOR issues

| Sev | Location | Old → New | Why |
| --- | --- | --- | --- |
| MAJOR | faqs.md "How does USD8 make money" | "20% phần còn lại của khoản chi trả — vì người yêu cầu chỉ nhận tối đa 80% mức bảo hiểm…" → "20% còn dư sau khi chi trả — vì người yêu cầu chỉ được bồi thường tối đa 80%, phần 20% còn lại là phí của USD8" | The old text back-translates to "20% of the remaining part of the payout… only receive max 80% of the coverage amount". That reads as a cut taken from the payout itself. English means the 20% left over after the max 80% payout. |
| MAJOR | fileClaim.statusDescription.settlementPending, coveredProtocols.actions.settleAndDispute, defi-insurance.md L55, faqs.md L56, transparency.md L22 | "khiếu nại" → "tranh chấp" (noun / window), "phản bác" (admin verb) | "Khiếu nại" means a customer complaint or appeal. "đang trong thời hạn khiếu nại" back-translates to "within the complaint period", which invites claimants to complain. In fact only admin/Timelock can dispute during beta. "Thời hạn tranh chấp" is the usual term for an optimistic dispute window. |
| MAJOR (term) | app.pool.sharePositive, app.pool.shareBalanceChanged, transactions.pool.sharesToRedeem, transactions.pool.withdrawAvailability | "phần góp" → "share" / "share pool" | "Phần góp" echoes the legal term "phần vốn góp" (capital contribution) and is not what Vietnamese DeFi users say. They say "share", just as the glossary already keeps "pool" and "vault". |
| MINOR | app.transaction.reverted | "Giao dịch bị revert." → "Giao dịch thất bại (bị revert)." | "Revert" is understood by crypto-native users but means nothing to newcomers. The new text states the failure plainly first. |
| MINOR | coveredProtocols.columns.maxCoverageHelp | "bồi hoàn" → "bồi thường" | Uses the glossary term consistently (reimbursement = bồi thường everywhere else). |
| MINOR | coveredProtocols.actions.fileClaim | "Yêu cầu bồi thường" → "Gửi yêu cầu" | It was 1.8× the English length in a narrow table button under the "Bồi thường" column. The new text matches fileClaim.action.fileClaim. |
| MINOR | fileClaim.form.scoreHelp | "khi bạn nhận một khoản chi trả" → "khi bạn chấp nhận một khoản chi trả" | Precision: the score is spent on *accepting* the payout. |
| MINOR | fileClaim.form.tokenAmountHelp | "token mua sau" → "token có thêm sau đó" | English says "acquired", not only "bought". |
| MINOR | fileClaim metric/form "Insurance Score to Spend" | "Điểm bảo hiểm sử dụng" → "Điểm bảo hiểm sẽ dùng" | The old label read like "insurance score usage". |
| MINOR | defi-insurance.md example li 2 | Reordered the clause: "giao lại aUSDC của mình để nhận tài sản từ pool bảo hiểm, trị giá tối đa 0.8 USDC" | In the old order, "trị giá tối đa 0.8 USDC" could attach to the pool. |
| MINOR | defi-insurance.md condition 1 | "giá TWAP 24 giờ liền kề … giảm >20%" → "giá TWAP 24 giờ … giảm >20% giữa hai khung 24 giờ liền kề" | "Adjacent" now clearly modifies the two windows being compared. |
| MINOR | faqs.md / transparency.md | "bánh xe phụ" → "cơ chế an toàn tạm thời" | The "training wheels" calque reads oddly in Vietnamese prose. |
| MINOR | faqs.md "Claims are not expected…" | Passive calque → "Chúng tôi không dự kiến yêu cầu bồi thường sẽ xảy ra thường xuyên…" | Fluency fix. |
| MINOR | philosophy.md | "người dùng mới, ngây thơ" → "còn non kinh nghiệm"; "được khuyến khích bằng doanh thu" → "có phần thưởng lấy từ doanh thu"; "tới 80%" → "tối đa 80%"; added "(dystopia)" after "xã hội phản địa đàng" | "Ngây thơ" means naive and is mildly condescending. The incentive wording was a calque. "Tối đa" states the cap explicitly. |
| MINOR | white-hat-economy.md | "Chỉ riêng bảo hiểm thì mới là phản ứng sau sự việc" → "Nếu chỉ có bảo hiểm, chúng ta mới chỉ phản ứng sau khi sự việc đã xảy ra" | The old sentence was ungrammatical. |
| MINOR | vi-shared.json CONSENT_TEXT.title | "Cookie & phân tích" → "Tùy chọn cookie & phân tích" | "Preferences" had been dropped. |

## 4. Back-translation of money-critical strings

| Key / location | Vietnamese | Literal back-translation | Match |
| --- | --- | --- | --- |
| landing.claims.intro | Nếu một token được bảo hiểm giảm hơn 20% so với tài sản cơ sở, bạn có thể dùng điểm bảo hiểm để yêu cầu bồi thường. | If an insured token drops more than 20% vs its underlying, you can use insurance score to claim. | yes |
| fileClaim.requirement | {symbol} phải mất hơn 20% giá trị so với tài sản cơ sở, tính theo giá TWAP ngay trước và ngay sau đợt giảm. | {symbol} must lose more than 20% value vs underlying, measured by TWAP right before and right after the drop. | yes |
| fileClaim.form.tokenAmountHelp (+holding.blocks) | Bạn phải nắm giữ {symbol} từ ít nhất {blocks} block trước sự cố. Điều kiện được xét theo số dư thấp nhất… Nếu số dư này bằng 0, bạn không đủ điều kiện và sẽ mất khoản cọc… | You must hold {symbol} from at least N blocks before the incident. Eligibility uses lowest balance… If zero, not eligible and lose the bond. | yes |
| fileClaim.form.claimBondHelp | Để gửi yêu cầu, bạn cần đặt cọc 10 USD8 nhằm chống spam. Khoản cọc này sẽ không được hoàn lại nếu bạn không đủ điều kiện bồi thường. | To file you need a 10 USD8 anti-spam deposit. It won't be refunded if you're not eligible. | yes |
| fileClaim.form.scoreHelp | Khi quyết toán, số này được giới hạn trong mức điểm khả dụng…, và điểm chỉ bị trừ khi bạn chấp nhận một khoản chi trả hợp lệ. | At settlement it's capped to available score; score deducted only if you accept an eligible payout. | yes |
| fileClaim.form.boostersHelp | …Chỉ Booster đủ điều kiện mới tăng trọng số chi trả và sẽ bị đốt khi bạn nhận chi trả. Booster dư sẽ được trả lại. Nếu bạn từ chối chi trả, toàn bộ Booster được trả lại. | Only eligible boosters increase weight and are burned on acceptance; excess returned; declining returns all. | yes |
| fileClaim.payout.ineligible | Bạn không đủ điều kiện nhận chi trả và khoản cọc {bond} USD8 sẽ không được hoàn lại. | Not eligible for payout and {bond} USD8 bond won't be refunded. | yes |
| fileClaim.metric.bondNotRefunded | Không được hoàn lại: chưa đáp ứng điều kiện | Not refunded: conditions not met | yes |
| fileClaim.statusDescription.settlementExpired | đã hết thời hạn quyết toán, vui lòng rút tài sản ký quỹ của bạn. | settlement window over, please withdraw your escrow. | yes |
| fileClaim.statusDescription.settlementPending | đã quyết toán, đang trong thời hạn tranh chấp | settled, within the dispute window | yes (fixed) |
| fileClaim.statusDescription.payoutExpired | đã hết thời hạn nhận chi trả, vui lòng rút tài sản ký quỹ của bạn. | payout window over, please withdraw your escrow. | yes |
| simulateClaim.intro | …Khi quyết toán, TEE sẽ tính lại toàn bộ nên khoản chi trả cuối cùng có thể khác. | At settlement the TEE recalculates everything so final payout may differ. | yes |
| simulateClaim.lossValue.help | …tính theo giá trung bình 7 ngày trước đợt giảm. Trần tổn thất là một tỷ lệ phần trăm của giá trị này. | …at the 7-day average price before the drop. Loss cap is a % of this value. | yes |
| simulateClaim.insuredToken.help | …pool bảo hiểm nắm giữ chính token này sẽ không tham gia chi trả cho sự cố của nó. | A cover pool holding this token won't pay for its incident. | yes |
| landing.coverPools.help | …nếu một token giảm từ 20% trở lên và một sự cố được mở, tài sản trong pool sẽ dùng để chi trả…, tối đa một tỷ lệ giới hạn của pool cho mỗi sự cố. Rút tiền phải qua thời gian chờ 7 ngày, và tài sản đang chờ rút vẫn tiếp tục bảo hiểm… | If a token drops ≥20% and an incident opens, pool assets pay valid claims up to a capped share per incident. 7-day cooldown; assets waiting still cover claims. | yes |
| landing.coverPools.warning | …nếu một token được bảo hiểm bị tổn thất, tiền nạp trong pool có thể được dùng để chi trả bồi thường. | If an insured token suffers a loss, pool deposits may be used to pay claims. | yes |
| landing.pool.earningsHelp | Lợi nhuận được trả bằng USD8, không phải {asset}. Lợi nhuận không bị dùng để chi trả bồi thường và bạn có thể rút bất cứ lúc nào. | Earnings paid in USD8 not {asset}; not used for claims; withdraw anytime. | yes |
| app.pool.cooldownStarted | …Khoản này sẽ ngừng sinh lợi nhuận và có thể giảm nếu pool phải chi trả bồi thường trước khi bạn rút xong. | This amount stops earning and may decrease if the pool pays claims before you finish withdrawing. | yes |
| transactions.pool.withdrawAvailability | Có {amount} share khả dụng. Nếu không có yêu cầu bồi thường nào đang chờ, bạn rút được sau {cooldown}; nếu có, phải đợi đến khi tất cả được hoàn tất. | {amount} shares available. If no pending claims, withdraw after {cooldown}; otherwise wait until all finalized. | yes |
| lib.pool.depositsPausedForIncident | Tạm ngừng nhận nạp trong khi sự cố bảo hiểm #{incident} đang diễn ra. Hãy thử lại sau khi sự cố được hoàn tất. | Deposits paused while incident #N is active; retry after it's finalized. | yes |
| landing.claims.availableHelp | Điểm sẽ khả dụng sau {duration}, trừ đi phần điểm đã dùng cho các yêu cầu bồi thường. | Score available after {duration}, minus score already spent on claims. | yes |
| coveredProtocols.columns.maxCoverageHelp | Mức bồi thường tối đa hiện tại (onchain)… Số tiền thực nhận phụ thuộc vào điểm bảo hiểm của bạn và giới hạn của pool bảo hiểm. | Current onchain max reimbursement… Actual payout depends on your score and cover pool limits. | yes |
| defi-insurance.md settlement para | Thời hạn quyết toán mở tối đa 3 ngày… Nếu không được quyết toán, người yêu cầu có thể rút lại token đã ký quỹ và không bị trừ điểm bảo hiểm nào. | Settlement window max 3 days… If not settled, claimers can withdraw escrowed tokens; no score deducted. | yes |
| defi-insurance.md payout window | thời hạn nhận chi trả là 3 ngày, sau đó mọi yêu cầu còn chờ đều bị coi là không chấp nhận… | Payout window 3 days; after that all pending claims count as not accepted… | yes |
| cover-pools.md payout limit | …khoản chi trả tối đa cho mỗi sự cố không vượt quá 50% quy mô hiện tại của pool bảo hiểm. | Max payout per incident does not exceed 50% of current pool size. | yes |
| faqs.md fees | 20% còn dư sau khi chi trả — vì người yêu cầu chỉ được bồi thường tối đa 80%, phần 20% còn lại là phí của USD8 | 20% left over after payout — claimers get at most 80%, the remaining 20% is USD8's fee. | yes (fixed) |
| notices.site.message | …được hưởng tốc độ tích điểm bảo hiểm x300% khi nắm giữ USD8 và sẽ nhận 3 Booster khi beta kết thúc. | Get x300% score rate on USD8 holdings and receive 3 Boosters when beta ends. | yes |
| CONSENT_TEXT.message | USD8 dùng cookie Google Analytics (không bắt buộc)… Chúng tôi chỉ bật công cụ phân tích khi bạn đồng ý, và việc từ chối không ảnh hưởng đến ứng dụng. | Optional GA cookies… We only enable analytics if you agree; rejecting doesn't affect the app. | yes |

## 5. Term decisions changed
- **Dispute:** "khiếu nại" → "tranh chấp" (noun/window), "phản bác" (admin verb). Reason in §3.
- **Pool shares:** "phần góp" → "share". Reason in §3.
- **Reverted:** "bị revert" → "thất bại (bị revert)".
- The glossary (`book-i18n/_glossary/vi.md`) has been updated with these terms.
- **Kept after review:**
  - "quyết toán" for settle/settlement. It is the standard finance word for closing accounts and computing what each party is owed. "Thanh toán" would read as plain "payment" and clash with payout ("chi trả").
  - "ký quỹ" for escrow.
  - "tiền cọc" for bond.
  - "APY"/"TVL" kept in Latin script, "7 ngày/30 ngày" for the window toggles.
  - "xã hội phản địa đàng" for dystopia. It is the established Vietnamese literary term; I added "(dystopia)" in brackets for crypto readers who don't know it.

## 6. For human judgement
- "Quyết toán" is correct and short, but some insurance-industry readers would say "giải quyết bồi thường" for claim settlement. That form is too long for the status chips, so I kept "quyết toán" everywhere.
- The stage chips "Mở quyết toán" / "Mở nhận chi trả" use headline style (like "Mở bán"). They are natural as status labels, but a UI check on a 390px phone is advisable.
