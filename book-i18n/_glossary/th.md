# Thai (th) glossary — USD8 docs + app UI

Style: natural Thai product copy, written by meaning (clauses reordered, sentences merged or split where Thai reads better; facts, numbers, conditions and risk caveats unchanged). Address the reader as "คุณ"; polite but concise, no ครับ/ค่ะ; "โปรด" only for real requests. Thai sentences carry no full stop: a space separates sentences and phrases. No spaces between Thai words otherwise. One space between Thai and Latin words, numbers or Latin/number placeholders ("ถือ USD8 หรือ sUSD8", "สูงสุด 80%", "บน {network}"). Numbers keep English formatting ('.' decimals, $500 style amounts, ranges "9-12 วัน").

Keep in English: USD8, sUSD8, token symbols (USDC, wstETH, aUSDC, sGHO…), protocol/company names (Morpho, Aave, Sky, Chainlink, Brevis, OpenZeppelin, Github, Telegram, X), TEE, TWAP, RPC, LP, NFT, zk-coprocessor, settlement root, "finalized" (in brackets after the Thai), contract/function names (Registry, Treasury, DefiInsurance, endBetaMode, Timelock), addresses, URLs, code. Contract names in the Addresses table stay English (timelock-queue.js reads them).

## Key decisions

- **APY → ผลตอบแทนต่อปี.** The standard Thai finance term (banks, mutual funds); Thai crypto media often write "APY" but explain it as ผลตอบแทนต่อปี, so the Thai term is clear to both crypto natives and newcomers, while bare "APY" reads as untranslated to the latter. Single-window label: "ผลตอบแทนต่อปี (30 วัน)"; the toggle reads "[7 วัน] [30 วัน] ผลตอบแทนต่อปี". In prose "ผลตอบแทนต่อปีสูง" / "ผลตอบแทน".
- **7D / 30D → "7 วัน" / "30 วัน"**: short, unambiguous, fits the small toggle buttons (Thai has no common one-letter day abbreviation).
- **TVL → ยอดฝากรวม** ("total deposits"): on the pool card TVL is exactly the deposits in the pool; "มูลค่ารวมที่ล็อกไว้" is a long calque.
- **Claim → เคลม** (ยื่นเคลม, ผู้ยื่นเคลม, เงินมัดจำเคลม). "เคลมประกัน" is everyday Thai insurance language; the formal "เรียกร้องค่าสินไหมทดแทน" is too heavy for a product UI.
- **Cover Pool → พูลคุ้มครอง** ("พูลคุ้มครอง wstETH"): describes what the pool does (provides ความคุ้มครอง); Thai DeFi users know "พูล". Contract-table names stay "wstETH Cover Pool".
- **Insured Token → โทเคนที่มีประกัน**: short and unambiguous ("โทเคนที่คุ้มครอง" would read as "the token that protects").
- **Payout / Reimbursement → เงินชดเชย**; accept payout → รับเงินชดเชย; decline → ไม่รับเงินชดเชย; Finalize/Finalise Payout (table button AND docs step 3 heading) → จัดการเงินชดเชย: the step is a choice (accept payout, or decline and get tokens back), so a neutral verb is used everywhere; the docs heading was changed from ตัดสินใจรับเงินชดเชย ("decide to accept") so docs and button use one term and the heading no longer implies acceptance. Claim finalization in error/status messages → ปิดเคลม (both accept and return close the claim).
- **Cooldown → คูลดาวน์** (ช่วงคูลดาวน์ 7 วัน, เริ่มคูลดาวน์, อยู่ในคูลดาวน์): established loanword in Thai crypto/staking; a native paraphrase ("ช่วงรอถอน") does not fit the short button.
- **Escrow → พักไว้** (โทเคนที่พักไว้, ถอนสินทรัพย์ที่พักไว้คืน): plain Thai for funds held aside by the contract; "เอสโครว์" is legal jargon.
- **Bond → เงินมัดจำ** (claim bond = เงินมัดจำเคลม, anti-spam bond = เงินมัดจำกันสแปม): what Thai users call a refundable deposit.
- **Booster → บูสเตอร์**, counted with "ชิ้น" (NFT items).

| English | ไทย |
| --- | --- |
| Insurance Score / score | คะแนนประกัน / คะแนน |
| Available score | คะแนนที่ใช้ได้ |
| Score Rate | อัตราคะแนน ("{rate} ต่อ USD8 ต่อวัน") |
| Score to spend | คะแนนประกันที่จะใช้ |
| Booster | บูสเตอร์ (ชิ้น) |
| Claim / file a claim | เคลม / ยื่นเคลม |
| Claimer | ผู้ยื่นเคลม |
| Cancel claim | ยกเลิกเคลม |
| Simulate claim | จำลองการเคลม |
| Claim window | ช่วงรับเคลม (stage: เปิดรับเคลม / ปิดรับเคลม) |
| Claim verification service | บริการตรวจสอบเคลม |
| Settle / settlement | สรุปผล / การสรุปผล, ผลสรุป |
| Settlement window | ช่วงสรุปผล |
| Dispute / dispute window | โต้แย้ง / ช่วงโต้แย้ง |
| Payout / payout window | เงินชดเชย / ช่วงรับเงินชดเชย |
| Payout weight | น้ำหนักการจ่าย |
| Insurance Payout Limit | วงเงินจ่ายชดเชย |
| Cover Pool limit | วงเงินของพูลคุ้มครอง |
| Max coverage | ความคุ้มครองสูงสุด (column: คุ้มครองสูงสุด) |
| Loss cap / loss value | เพดานความเสียหาย / มูลค่าความเสียหาย |
| Incident | เหตุการณ์ |
| Holding requirement / window | เงื่อนไขการถือครอง / ช่วงถือครอง |
| Return tokens | รับโทเคนคืน |
| Forfeit | สละ (bond: ไม่ได้รับคืน / เสียเงินมัดจำ) |
| Underlying asset | สินทรัพย์อ้างอิง |
| Withdraw / withdrawal | ถอน / การถอน |
| Exit queue | คิวถอนออก |
| Deposit / your deposit | ฝาก / ยอดฝากของคุณ |
| Deposit cap | เพดานเงินฝาก |
| Pool Filled | ความจุที่ใช้ |
| Pool shares | แชร์พูล |
| Earnings / rewards | รายได้ (ถอนรายได้) |
| Mint / Redeem | มินต์ / ไถ่ถอน |
| Approve | อนุมัติ |
| Treasury (yield) | คลัง USD8 / ผลตอบแทนของคลัง (contract: Treasury) |
| Vault | วอลต์ |
| Wallet | วอลเล็ต |
| Yield | ผลตอบแทน |
| Stablecoin | สเตเบิลคอยน์ |
| Onchain / Offchain / Open source | ออนเชน / ออฟเชน / โอเพนซอร์ส |
| Timelock / Timelock Queues | Timelock / คิวของ Timelock |
| Admin | แอดมิน |
| Oracle | ออราเคิล (Chainlink Oracles stays English) |
| Strategy | กลยุทธ์ |
| Private beta / invitation code | เบต้าแบบปิด / รหัสเชิญ |
| White Hat Economy | เศรษฐกิจหมวกขาว |
| DeFi Insurance | ประกัน DeFi |
| Philosophical Roots | รากฐานทางปรัชญา |
| Transparency | ความโปร่งใส |
| System Stats | ข้อมูลระบบ |
| Addresses (footer/heading) | ที่อยู่สัญญา |
| FAQs | คำถามที่พบบ่อย |
| Legal | ข้อกฎหมาย (legal.md itself stays English) |
| Docs | เอกสาร |
| Check (booster button) | ตรวจสอบ |
| Retry Data | โหลดข้อมูลใหม่ |
| About X (tooltip aria-label) | เกี่ยวกับ X |

Durations (lib.json): "{count} วัน/ชั่วโมง/นาที/วินาที" for both phrase and adjective forms (Thai needs no adjective form: "คูลดาวน์ 7 วัน"); cooldown timing "ถอนได้ในอีก {count} วัน" / "ถอนได้แล้ว". Thai has a single plural category (other); _one and _other carry the same text.
