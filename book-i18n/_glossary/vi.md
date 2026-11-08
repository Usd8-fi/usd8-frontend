# Vietnamese (vi) glossary — USD8 docs + app UI

Style: address the reader as "bạn"; plain, friendly product Vietnamese written by meaning, not word for word (clauses reordered, sentences merged or split where it reads better; facts, numbers, conditions and risk caveats unchanged). One rendering per term across app strings, docs, docs widget and cookie banner.

Keep in English/Latin: USD8, sUSD8, token symbols (USDC, wstETH, aUSDC, msLOSS …), protocol/company names (Morpho, Aave, Chainlink, OpenZeppelin, Brevis, Github, Telegram, X), TEE, TWAP, RPC, NFT, LP, zk-coprocessor, contract/function names (Registry, Treasury, DefiInsurance, endBetaMode, Timelock in the address table), settlement root, addresses, URLs, code. Numbers keep English formatting ("0.8", "$500"); the app never localizes numbers.

## Key decisions

- **APY → "APY"** (kept). Vietnamese crypto apps and media (Binance/OKX/Bybit Earn in Vietnamese, local DeFi press) show "APY"/"APR" as-is; the native "lợi suất năm" exists but is never used as a UI label. Also the pool card renders the window buttons *before* the suffix ("[7 ngày] [30 ngày] APY"), so a short Latin label reads naturally there. Prose uses "lợi suất" for yield and "APY" for the rate.
- **7D / 30D → "7 ngày" / "30 ngày"**. Abbreviations are risky: Vietnamese stock/chart toggles use "1T/3T/1N" where T = tháng (month) and N = năm (year), so "7N" would read as "7 years". Full words are still short enough for the toggle. windowApy → "APY {window}" (Vietnamese puts the modifier after the noun).
- **TVL → "TVL"**: standard in Vietnamese crypto; no short native equivalent ("tổng giá trị khóa" is only used to explain it).
- **Cover Pool → "pool bảo hiểm"** (capitalised at sentence/label start; pool names "Pool bảo hiểm wstETH"). "Pool" is the everyday DeFi word in Vietnamese ("pool thanh khoản"); "quỹ" would clash with treasury/vault. Contract names in the Addresses table stay English.
- **Claim → "yêu cầu bồi thường"** (the standard insurance term; short "yêu cầu" when context is clear). Button "File Claim" → "Yêu cầu bồi thường" in the token table, "Gửi yêu cầu" in the form.
- **Payout → "chi trả" / "khoản chi trả"**; reimbursement → "bồi thường"; Accept Payout → "Nhận chi trả".
- **Bond → "tiền cọc"** (claim bond: "tiền cọc yêu cầu bồi thường"; anti-spam: "cọc … nhằm chống spam"). "Cọc" is the everyday word for money you get back if you keep the rules, and it stays distinct from escrow.
- **Escrow → "ký quỹ"** (escrowed: "đã ký quỹ"; withdraw escrow: "rút tài sản ký quỹ").
- **Settle / settlement → "quyết toán"** (the finance term for closing out and computing what each party is owed; "thanh toán" would read as plain "payment").
- **Cooldown → "thời gian chờ rút"** ("Bắt đầu chờ rút", "đang chờ rút", "thời gian chờ 7 ngày"). "Cooldown" is not a Vietnamese finance word; "chờ rút" tells the user exactly what is waiting.
- **Insurance Score → "điểm bảo hiểm"** (short "điểm"; Score Rate → "Tốc độ tích điểm", "{rate} điểm/{unit}/ngày").
- **Booster stays "Booster"**: NFT/product name, a familiar loanword.
- **White Hat Economy → "Kinh tế Mũ trắng"**: "hacker mũ trắng / mũ đen" is the established Vietnamese term; first docs mention adds "(White Hat Economy)".
- **Dispute → "tranh chấp"** (noun, "thời hạn tranh chấp"; admin action verb "phản bác"). Changed in review from "khiếu nại", which reads as a customer complaint and could make claimants think they can file one; only admin/Timelock can dispute in beta. "Tranh chấp" is the usual term for optimistic dispute windows.
- **Pool shares → "share"** (changed in review from "phần góp", which echoes the legal term "phần vốn góp" and is not what Vietnamese DeFi users say; vault/pool shares are called "share" like "pool" and "vault").
- **Reverted → "Giao dịch thất bại (bị revert)"**: plain failure first for non-technical users, the familiar loanword in brackets.
- **Treasury (yield) → "ngân quỹ"** ("lợi suất ngân quỹ của USD8"); contract name stays "Treasury".

| English | Tiếng Việt |
| --- | --- |
| Cover Pool / Cover Pools | pool bảo hiểm |
| Cover Pool limit | hạn mức của pool bảo hiểm |
| Cover Pool LP | LP của pool bảo hiểm |
| Insurance Payout Limit | Hạn mức chi trả bảo hiểm |
| Insurance Score | điểm bảo hiểm |
| Available score | điểm khả dụng |
| Score to spend | điểm bảo hiểm sử dụng |
| Score Rate | Tốc độ tích điểm |
| Score weight | Tỷ trọng điểm |
| Booster(s) | Booster |
| Claim (noun) | yêu cầu bồi thường |
| File a claim | gửi yêu cầu bồi thường |
| Simulate claim | Mô phỏng bồi thường |
| Cancel claim | Hủy yêu cầu |
| Claimer / claimant | người yêu cầu (bồi thường) |
| Claim Open / Claim Closed | Đang nhận yêu cầu / Ngừng nhận yêu cầu |
| Claim window | thời hạn nhận yêu cầu bồi thường |
| Claim bond | tiền cọc yêu cầu bồi thường |
| Claim verification service | dịch vụ xác minh yêu cầu bồi thường |
| Settle / Settlement | quyết toán |
| Settle Open / Settled / Not Settled | Mở quyết toán / Đã quyết toán / Chưa quyết toán |
| Settlement window | thời hạn quyết toán |
| Settlement root | settlement root |
| Dispute (window) | tranh chấp (thời hạn tranh chấp); verb: phản bác |
| Finalize payout | Hoàn tất chi trả |
| Payout Open / Payout Closed | Mở nhận chi trả / Hết hạn nhận chi trả |
| Accept / decline payout | nhận / từ chối chi trả |
| Return tokens (to the claimer) | Nhận lại token |
| Payout | chi trả, khoản chi trả |
| Reimbursement | bồi thường |
| Loss cap | trần tổn thất |
| Loss value | giá trị tổn thất |
| Insured token | token được bảo hiểm |
| Max coverage | (mức) bảo hiểm tối đa |
| Bond | tiền cọc |
| Escrow / escrowed | ký quỹ / đã ký quỹ |
| Forfeit | mất (khoản cọc / token đã ký quỹ) |
| Incident | sự cố |
| Holding requirement / window | yêu cầu nắm giữ / khoảng thời gian nắm giữ |
| Underlying | tài sản cơ sở |
| Price drop | đợt giảm giá |
| Attestation | bản chứng thực (attestation) |
| Proof | bằng chứng |
| Timelock / Timelock Queues | Timelock / Hàng đợi Timelock |
| Queued / Executed / Ready to Execute | Đã lên lịch / Đã thực thi / Sẵn sàng thực thi |
| Admin | admin |
| Private beta / invitation code | beta kín / mã mời |
| Beta (protocol mode) | beta, giai đoạn beta |
| Withdraw / withdrawal | rút |
| Withdraw Earnings | Rút lợi nhuận |
| Cooldown | thời gian chờ rút |
| Start Cooldown | Bắt đầu chờ rút |
| Deposit (verb / button) | nạp / Nạp |
| Your Deposit | Khoản nạp của bạn |
| Deposit cap / capacity | hạn mức nạp / sức chứa |
| Pool Filled | Mức lấp đầy |
| Uncapped | Không giới hạn |
| Shares (pool) | share (share pool) |
| Earnings / rewards | lợi nhuận / thưởng |
| Yield | lợi suất |
| APY | APY |
| TVL | TVL |
| 7D / 30D | 7 ngày / 30 ngày |
| Treasury / treasury yield | ngân quỹ / lợi suất ngân quỹ |
| Vault | vault |
| Mint / Redeem | Đúc / Quy đổi |
| Redemption quote | báo giá quy đổi |
| Approve (ERC-20) | phê duyệt |
| Wallet / Connect Wallet | ví / Kết nối ví |
| Transaction | giao dịch |
| Reverted | thất bại (bị revert) |
| Finalized block / finality | block đã chốt / được chốt |
| Stablecoin | stablecoin |
| Onchain / offchain / open source | onchain / offchain / mã nguồn mở |
| Deployed (on network) | được triển khai |
| DeFi Insurance | Bảo hiểm DeFi |
| White Hat Economy | Kinh tế Mũ trắng |
| Philosophical Roots | Nền tảng triết lý |
| Transparency | Minh bạch |
| System Stats | Thông số hệ thống |
| FAQs | Câu hỏi thường gặp |
| Legal | Pháp lý (legal.md stays English) |
| Docs / Audit Report | Tài liệu / Báo cáo kiểm toán |
| About X (tooltip label) | Về X |
| Check (booster widget) | Kiểm tra |
