# Thai (th) translation audit — independent review

## 1. Verdict

**READY WITH NOTES** — confidence **high** that a Thai crypto user will find the money/risk content accurate, and **medium-high** that it reads natively: it is fluent, idiomatic product Thai rather than a calque. The notes in §6 are wording choices only, with no open meaning problems.

## 2. Counts

- Strings reviewed: 501 app strings (15 namespaces) + 31 shared strings (UI_TEXT, WIDGET_TEXT, CONSENT_TEXT) = 532
- Strings changed: 7 (all in `src/locales/th`; shared strings unchanged)
- Docs: all 8 pages compared paragraph by paragraph against `book-src/` (including the current `cover-pools.md` with "Consensys Diligence"). Nothing dropped or added, and every number matches. Changed: 1 heading + 1 paragraph (`defi-insurance.md` step 3).
- Glossary: Finalize Payout entry rewritten.

## 3. CRITICAL / MAJOR issues

No CRITICAL issues. Every claim, payout, bond, cooldown, cap, deadline and eligibility condition matches the English.

| Sev | Key / file | Old → New | Why |
|---|---|---|---|
| MAJOR | `lib.amount.invalid.redeem` | ใส่จำนวน {token} ที่จะไถ่ถอน**เป็น USD8** ให้ถูกต้อง → ใส่จำนวน {token} ที่จะไถ่ถอนให้ถูกต้อง | When redeeming, `{token}` is USD8 (TransactionDialogs.jsx:34), so the old text said "enter the USD8 amount to redeem **into** USD8". That is the wrong direction and makes no sense. New: "Enter a valid USD8 amount to redeem." |
| MAJOR | `lib.amount.zero.redeem` | …ที่จะไถ่ถอนเป็น USD8 ให้มากกว่าศูนย์ → …ที่จะไถ่ถอนให้มากกว่าศูนย์ | Same wrong direction ("redeem into USD8"). |
| MINOR | `lib.amount.noBalance.redeem` | คุณไม่มี {token} สำหรับไถ่ถอน USD8 → คุณไม่มี {token} ที่ไถ่ถอนได้ | Rendered as "You have no USD8 to redeem USD8", which repeats itself. |
| MINOR | `landing.claims.availableHelp` + `landing.score.holdingPeriod` | คะแนนจะใช้ได้เมื่อได้รับมาแล้ว {duration} / ครบช่วงถือครอง → คะแนนจะใช้ได้หลังได้รับมาครบ {duration} / ช่วงถือครองที่กำหนด | With the fallback (no duration loaded yet), the old pair read "…เมื่อได้รับมาแล้ว ครบช่วงถือครอง", which is broken Thai. Now: "usable once held for the full 7 days" / "…for the full set holding period". |
| MINOR | `app.claim.finalize.errors.FinalizeNotOpen` | ยังไม่เปิดให้รับเงินชดเชย → ขณะนี้ไม่ได้เปิดให้รับเงินชดเชย | "ยังไม่" means "not yet". This error also fires after the window has closed, so "not open right now" is the accurate version. |
| MINOR | `lib.errors.dataUnavailable` | ไม่มีข้อมูล → โหลดข้อมูลไม่ได้ | "ไม่มีข้อมูล" reads as "there is no data / none". The message actually means a read failed. |
| MINOR (term) | `book-i18n/th/defi-insurance.md` step 3 | ### 3 ตัดสินใจรับเงินชดเชย / "มีเวลา 3 วันในการตัดสินใจรับเงินชดเชย" → ### 3 จัดการเงินชดเชย / "มีเวลา 3 วันในการเลือกว่าจะรับเงินชดเชยหรือไม่" | The docs heading did not match the table button (จัดการเงินชดเชย), and "ตัดสินใจรับ" leans toward "decide to accept". Now one term in both places, and the sentence states the choice. |

## 4. Back-translation of the most money-critical strings

| Key | Thai | Literal back-translation | Match |
|---|---|---|---|
| fileClaim.requirement | {symbol} ต้องเสียมูลค่าเทียบกับสินทรัพย์อ้างอิงมากกว่า 20% โดยเทียบราคา TWAP ทันทีก่อนและหลังการร่วง | {symbol} must lose more than 20% of value against the underlying, comparing the TWAP price immediately before and after the drop | yes |
| landing.claims.intro | ใช้คะแนนประกันยื่นเคลมได้ เมื่อโทเคนที่มีประกันร่วงลงมากกว่า 20% เทียบกับสินทรัพย์อ้างอิง | You can use insurance score to file a claim when an insured token drops more than 20% against its underlying | yes |
| fileClaim.form.tokenAmountHelp (+holding.blocks) | คุณต้องถือ {symbol} ไว้ตลอดช่วง 7,200 บล็อกก่อนเกิดเหตุการณ์ สิทธิ์เคลมจะคิดจากยอดคงเหลือต่ำสุด… หากยอดต่ำสุดเป็นศูนย์ คุณจะไม่มีสิทธิ์เคลมและจะเสียเงินมัดจำเคลม | You must hold {symbol} throughout the 7,200 blocks before the incident; eligibility uses your lowest balance… if it is zero you are not eligible and lose the claim bond | yes |
| fileClaim.form.claimBondHelp | ต้องวางเงินมัดจำกันสแปม 10 USD8 เพื่อยื่นเคลม หากคุณไม่มีสิทธิ์เคลม เงินมัดจำนี้จะไม่ได้รับคืน | A 10 USD8 anti-spam deposit is required to file; if not eligible it is not returned | yes |
| fileClaim.form.scoreHelp | …ตอนสรุปผลจะจำกัดไม่ให้เกินคะแนนที่ใช้ได้ของคุณ และคะแนนจะถูกใช้จริงก็ต่อเมื่อคุณรับเงินชดเชยที่มีสิทธิ์เท่านั้น | Settlement caps it at your available score; score is spent only if you accept an eligible payout | yes |
| fileClaim.form.boostersHelp | …เฉพาะบูสเตอร์ที่มีสิทธิ์เท่านั้นที่จะเพิ่มน้ำหนักการจ่าย และจะถูกเบิร์นเมื่อคุณรับเงินชดเชย บูสเตอร์ส่วนเกินจะได้รับคืน หากไม่รับเงินชดเชยจะได้บูสเตอร์คืนทั้งหมด | Only eligible boosters add payout weight and are burned on acceptance; excess returned; declining returns all | yes |
| fileClaim.payout.ineligible | คุณไม่มีสิทธิ์ได้รับเงินชดเชย และจะไม่ได้รับเงินมัดจำ {bond} USD8 คืน โปรดรับโทเคนคืนเพื่อปิดเคลม | You are not eligible for payout and will not get the {bond} USD8 bond back; take your tokens back to close the claim | yes |
| fileClaim.metric.bondNotRefunded | จะไม่ได้รับคืน: ไม่เข้าเงื่อนไข | Will not be refunded: conditions not met | yes |
| fileClaim.action.cancelPayoutReturnTokens | ไม่รับเงินชดเชยและรับโทเคนคืน | Decline payout and get tokens back | yes |
| coveredProtocols.actions.finalisePayout | จัดการเงินชดเชย | Handle (manage) payout | yes (neutral, see §6) |
| coveredProtocols.columns.maxCoverageHelp | อัตราชดเชยสูงสุดของแต่ละโทเคน… เงินชดเชยจริงขึ้นอยู่กับคะแนนประกันของผู้ใช้และวงเงินของพูลคุ้มครอง | Max reimbursement rate per token (onchain now)… actual payout depends on the user's score and cover pool limits | yes |
| landing.asset.coverageHelp | ความคุ้มครองขึ้นอยู่กับยอดเงินที่มีอยู่ในพูลคุ้มครอง | Coverage depends on the funds available in the cover pools | yes |
| landing.coverPools.help | …หากโทเคนใดร่วง 20% ขึ้นไปและมีการเปิดเหตุการณ์… แต่ละเหตุการณ์จ่ายได้ไม่เกินสัดส่วนที่กำหนดของพูล การถอนมีช่วงคูลดาวน์ 7 วัน และสินทรัพย์ที่รอถอนก็ยังอาจถูกนำไปจ่ายเคลม | …if a token drops 20% or more and an incident opens… each incident pays at most a set share of the pool; withdrawals have a 7-day cooldown, and assets waiting to withdraw may still pay claims | yes |
| landing.coverPools.warning | …เงินฝากในพูลอาจถูกนำไปจ่ายเคลม โปรดทำความเข้าใจความเสี่ยงที่เกี่ยวข้องให้ดีก่อน | …pool deposits may be used to pay claims; understand the risks first | yes |
| landing.pool.earningsHelp | รายได้จ่ายเป็น USD8 ไม่ใช่ {asset} รายได้ส่วนนี้ไม่ถูกนำไปจ่ายเคลมประกัน และถอนได้ทุกเมื่อ | Earnings are paid in USD8, not {asset}; not used for claims; withdrawable any time | yes |
| app.pool.cooldownStarted | เริ่มคูลดาวน์แล้ว จำนวนนี้จะหยุดรับผลตอบแทน และอาจลดลงหากพูลต้องจ่ายเคลมก่อนการถอนของคุณเสร็จสิ้น | Cooldown started; this amount stops earning and may decrease if the pool pays claims before your withdrawal completes | yes |
| transactions.pool.withdrawAvailability | มี {amount} แชร์ที่ถอนได้ หากไม่มีเคลมค้างอยู่ จะถอนได้หลังคูลดาวน์ 7 วัน หากมี ต้องรอจนเคลมทั้งหมดสิ้นสุด | {amount} shares available; with no pending claims, withdrawable after the 7-day cooldown; otherwise wait until all claims finish | yes |
| transactions.pool.mayDecrease | อาจลดลงหากพูลต้องจ่ายเคลมก่อนการถอนของคุณเสร็จสิ้น | May decrease if the pool pays claims before your withdrawal completes | yes |
| lib.pool.depositsPausedForIncident | ปิดรับเงินฝากชั่วคราวระหว่างที่เหตุการณ์ประกัน #{incident} ยังเปิดอยู่ โปรดลองใหม่หลังเหตุการณ์สิ้นสุด | Deposits temporarily closed while incident #{incident} is open; try after it ends | yes |
| landing.claims.availableHelp (new) | คะแนนจะใช้ได้หลังได้รับมาครบ 7 วัน โดยหักคะแนนที่ใช้เคลมไปแล้วออก | Score is usable after it has been held for a full 7 days, minus score already spent on claims | yes |
| simulateClaim.intro | …ตอนสรุปผล TEE จะคำนวณทุกอย่างใหม่ เงินชดเชยจริงจึงอาจต่างจากนี้ | …at settlement the TEE recalculates everything, so the actual payout may differ | yes |
| simulateClaim.insuredToken.help | …พูลคุ้มครองที่ถือโทเคนเดียวกันนี้จะไม่ถูกนำมาจ่ายในเหตุการณ์ของโทเคนนั้น | …a cover pool holding this same token is not used to pay in that token's incident | yes |
| notices.site.message | ผู้ใช้เบต้าจะได้รับอัตราคะแนนประกันจากการถือ USD8 เพิ่มเป็น 300% และจะได้รับบูสเตอร์ 3 ชิ้นเมื่อจบเบต้า | Beta users get the USD8 score rate boosted to 300% and receive 3 boosters when beta ends | yes (matches the x300% flag) |
| docs defi-insurance "File a Claim" 1–3 | ราคา TWAP 24 ชั่วโมงสองช่วงติดกัน…ร่วงลงเกิน 20% ภายใน 1-6 วันที่ผ่านมา / คะแนน…ได้รับมาก่อนราคาร่วงอย่างน้อย 7 วัน / ถือโทเคน…มาก่อนราคาร่วงอย่างน้อย 7 วัน | Adjacent 24h TWAPs dropped >20% within the past 1–6 days / score earned at least 7 days before the drop / token held at least 7 days before the drop | yes |
| docs settlement example | …ใช้ได้ทั้งหมด $1125… งบ…$900… A เคลมได้สูงสุด $300 และ B ได้ $600… จำกัดไว้ที่ $400… A ได้ $300 ส่วน B ได้ $400 | Same figures and logic as English | yes |
| docs cover-pools payout limit | …แต่ละเหตุการณ์จ่ายชดเชยได้สูงสุด 50% ของขนาดพูลคุ้มครอง ณ ขณะนั้น | Each incident pays at most 50% of the current cover pool size | yes |
| CONSENT_TEXT.message | USD8 ใช้คุกกี้ Google Analytics แบบไม่บังคับ… เราจะโหลดเครื่องมือวิเคราะห์ก็ต่อเมื่อคุณยอมรับเท่านั้น และการปฏิเสธจะไม่กระทบการใช้งานแอป | Optional GA cookies…; loaded only after you accept; rejecting does not affect the app | yes |

## 5. Term decisions (judged as requested)

- **APY → ผลตอบแทนต่อปี: kept.** This is the standard Thai finance term (banks, funds). Thai crypto media write "APY" but explain it with exactly this phrase, so Thai users with no crypto background can also read it. The labels are longer than "30D APY" (ผลตอบแทนต่อปี (30 วัน)). The site already has a CSS rule that wraps cover-pool labels on phones for non-English languages, and there is no shorter natural form ("APY" would mean leaving it untranslated). Used the same way across app, docs and glossary.
- **TVL → ยอดฝากรวม: kept.** On the pool card the figure is exactly the pool's total deposits. It is short, and Thai banking users recognise it. "มูลค่ารวมที่ล็อกไว้" is a long calque.
- **Finalise Payout: unified to จัดการเงินชดเชย** (button and docs heading). The step is a choice between accepting and declining, and the button opens both options, so a neutral verb fits. In error and status messages, claim finalization stays ปิดเคลม ("close the claim"), a separate concept that is used consistently.
- **คูลดาวน์: kept.** Thai crypto and gaming users know the loanword well. It is used for exactly this "wait before withdrawing" sense, and a native paraphrase (ช่วงรอถอน) would not fit the Start Cooldown button. The docs explain it in context ("การถอนมีช่วงคูลดาวน์ 7 วัน…ไม่ได้รับผลตอบแทน แต่ยังคงคุ้มครองเคลมอยู่").
- **Politeness: right for a Thai fintech app.** Addresses the user as คุณ, never uses ครับ/ค่ะ, and uses โปรด only for real requests ("โปรดลองอีกครั้ง"), the same register as Thai banking and exchange apps. Typography is consistent: no spaces between Thai words, a space before and after Latin words and numbers, and no full stops.

## 6. Left for human judgement

- Width of `ผลตอบแทนต่อปี (30 วัน)` and the 7 วัน / 30 วัน toggle on 390 px cover-pool cards should get a quick visual check. Fallback if it is too wide: `ผลตอบแทน/ปี`.
- `จัดการเงินชดเชย` is accurate but generic. A native reviewer may prefer `รับ/ไม่รับเงินชดเชย` if space allows.

## Validation

- Keys: all 15 namespaces match English (plural groups; Thai has only the `other` category, and `_one`/`_other` are both present). No empty values. Placeholders and tags are identical. Same for `th-shared.json` against the `en` rows.
- Docs: built in a scratch directory with `MDBOOK_BOOK__LANGUAGE=th`. The build is clean, every English id is present on all 8 pages, and the `<img`, `<table` and `<a href` counts equal English.
- Tests: `src/lib/i18n.test.jsx` and `src/lib/libI18n.test.js`, 37/37 passing.
