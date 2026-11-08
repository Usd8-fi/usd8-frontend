# Indonesian (id) translation audit — independent review

## 1. Verdict

**READY WITH NOTES** — confidence **medium-high** that an Indonesian crypto user finds it accurate and natural. Money/risk content (claims, 20% trigger, 80% cap, 50% pool limit, 10 USD8 bond, 7-day cooldown, 3-day windows, 9-12 / 6-9 day timelines, escrow, settlement, dispute, eligibility by lowest balance) matched the English in every string and docs paragraph checked. No CRITICAL issue found. The first pass was already of good quality; fixes below are one MAJOR ambiguity plus fluency/consistency.

## 2. Counts

- App strings reviewed: 501 (15 namespaces) + 29 shared docs/widget/consent strings
- App strings changed: 5
- Docs pages compared paragraph by paragraph: 9 (SUMMARY + 8 chapters); docs paragraphs/list items changed: 6
- Glossary: 3 rows/notes updated

## 3. CRITICAL / MAJOR issues

| Sev | Where | Old → New | Why |
| --- | --- | --- | --- |
| MAJOR | `book-i18n/id/usd8.md` "How to use USD8" | "setor ke Pool Proteksi USD8" → "setor ke Pool Proteksi milik USD8" | EN "deposit into USD8's Cover Pools" (all pools). "Pool Proteksi USD8" is the app's name for the single USD8-asset pool (`common.pools.usd8`), so it read "deposit into the USD8 Cover Pool" — points high-APY seekers at one specific pool. |
| MAJOR | `book-i18n/id/philosophy.md` "The Insurance" | "[Pool Proteksi](…) USD8, yaitu vault publik…" → "[Pool Proteksi](…) milik USD8, yaitu…" | Same ambiguity: back-translation was "payouts come from the USD8 Cover Pool". |
| MAJOR (minor risk) | `book-i18n/id/transparency.md` Timelock list | "Memanggil endBetaMode secara permanen, yang menonaktifkan…" → "Memanggil endBetaMode, yang secara permanen menonaktifkan…" | Back-translation was "call endBetaMode permanently (repeatedly?)"; EN intent is that the call permanently disables upgrades and beta settlement corrections. |
| MINOR | `app.transaction.reverted` | "Transaksi di-revert oleh kontrak." → "Transaksi gagal (di-revert)." | "by the contract" was an added, not always true, cause. |
| MINOR | `fileClaim.action.cancelPayoutReturnTokens` | "Tolak Pembayaran & Ambil Token" → "Tolak Pembayaran & Ambil Kembali Token" | Same verb as the Return Tokens button and `payout.ineligible`. |
| MINOR | `transactions.pool.sharesToRedeem` | "Share Pool yang Ditukar" → "Share Pool yang Ditebus" | One verb for Redeem (Tebus) across the app. |
| MINOR | `terms.disagreeNote` | "dompet Anda akan diputus" → "koneksi dompet Anda akan diputus" | "the wallet will be cut off" → "your wallet connection will be cut". |
| MINOR | `notices.site.message` | "mendapatkan laju skor asuransi yang di-boost 300%…" → "Selama beta privat, laju skor asuransi untuk USD8 yang Anda pegang mendapat boost 300%, dan Anda akan menerima 3 Booster di akhir beta." | Smoother, "Anda" addressed directly; same facts. |
| MINOR | `cover-pools.md` Insured Tokens; `white-hat-economy.md` list; `transparency.md` TEEs | word order of "dievaluasi … dengan cermat"; "Langkah Hukum & Penegakan Hukum" → "Jalur Hukum & Aparat Penegak Hukum"; "pengaturan trustless" → "sistem trustless" | Fluency. |

## 4. Back-translation of the most money-critical strings

| Key / place | Translation | Literal back-translation | Match |
| --- | --- | --- | --- |
| landing.claims.intro | Jika token yang diasuransikan turun lebih dari 20% terhadap aset dasarnya, gunakan skor asuransi Anda untuk mengajukan klaim. | If an insured token drops more than 20% against its underlying asset, use your insurance score to file a claim. | yes |
| fileClaim.requirement | Nilai {symbol} harus turun lebih dari 20% terhadap aset dasarnya, diukur dari harga TWAP sesaat sebelum dan sesudah penurunan. | {symbol}'s value must fall more than 20% against its underlying, measured from the TWAP price just before and after the drop. | yes |
| fileClaim.form.tokenAmountHelp (+ holdingRequirement.blocks) | Anda harus sudah memegang {symbol} minimal selama 50400 blok sebelum insiden. Kelayakan dihitung dari saldo terendah Anda selama periode itu, jadi token yang baru diperoleh setelahnya tidak dihitung. Jika saldo terendah itu nol, Anda tidak memenuhi syarat dan jaminan klaim Anda hangus. | You must have held {symbol} at least 50400 blocks before the incident. Eligibility is counted from your lowest balance over that period, so tokens acquired afterwards are not counted. If that lowest balance is zero, you are not eligible and your claim bond is forfeited. | yes |
| fileClaim.form.boostersHelp | Opsional. Booster harus memenuhi syarat kepemilikan pra-insiden yang sama…, yaitu dimiliki minimal selama {holding} Hanya Booster yang memenuhi syarat yang menambah bobot pembayaran, dan Booster tersebut dibakar saat pembayaran diterima. Kelebihan Booster dikembalikan. Jika pembayaran ditolak, semua Booster dikembalikan. | Optional. Boosters must meet the same pre-incident holding requirement…, i.e. held at least {holding} Only eligible Boosters add payout weight, and they are burned when the payout is accepted. Excess Boosters are returned. If the payout is declined, all Boosters are returned. | yes |
| fileClaim.form.claimBondHelp | Untuk mengajukan klaim, Anda perlu menyetor jaminan anti-spam sebesar 10 USD8. Jaminan ini tidak dikembalikan jika Anda ternyata tidak memenuhi syarat klaim. | To file a claim you must deposit a 10 USD8 anti-spam bond. It is not returned if you turn out not to be eligible. | yes |
| fileClaim.form.scoreHelp | …Saat penyelesaian, jumlah ini dibatasi sebesar skor tersedia Anda, dan skor baru benar-benar terpakai jika Anda menerima pembayaran yang memenuhi syarat. | At settlement this is capped at your available score, and score is only actually spent if you accept an eligible payout. | yes |
| fileClaim.payout.ineligible | Anda tidak memenuhi syarat untuk menerima pembayaran, dan jaminan {bond} USD8 Anda tidak akan dikembalikan. Ambil kembali token Anda untuk menutup klaim. | You are not eligible for a payout and your {bond} USD8 bond will not be returned. Take back your tokens to close the claim. | yes |
| fileClaim.metric.bondNotRefunded | Tidak akan dikembalikan: syarat tidak terpenuhi | Will not be returned: conditions not met | yes |
| fileClaim.weight.summary | Bobot pembayaran maksimum: {weight}{boosters} — {share} dari bobot escrow sementara; bobot akhir bergantung pada kelayakan kepemilikan. | Maximum payout weight … of provisional escrow weight; final weight depends on holding eligibility. | yes |
| fileClaim.noClaimInIncident | …Pengajuan sudah ditutup, tetapi penyelesaian terbuka untuk umum — siapa pun dapat melakukannya. | Filing is closed, but settlement is open to the public — anyone can do it. | yes |
| fileClaim.statusDescription.settlementPending | sudah diselesaikan, masa sanggah sedang berjalan | settled, the dispute window is running | yes |
| coveredProtocols.columns.maxCoverageHelp | Batas penggantian maksimum on-chain saat ini untuk setiap token yang terdaftar. Pembayaran sebenarnya bergantung pada skor asuransi pengguna dan batas pool proteksi. | Current on-chain max reimbursement per listed token. Actual payout depends on the user's insurance score and cover pool limits. | yes |
| landing.asset.coverageHelp | Cakupan bergantung pada jumlah dana yang tersedia di pool proteksi. | Coverage depends on the funds available in the cover pools. | yes |
| landing.coverPools.help | …jika salah satunya turun 20% atau lebih dan sebuah insiden dibuka, aset pool dipakai membayar klaim yang sah, hingga batas porsi tertentu dari pool per insiden. Penarikan memiliki masa tunggu 7 hari, dan aset yang sedang menunggu ditarik tetap menanggung klaim. | …if one drops 20% or more and an incident opens, pool assets pay valid claims, up to a set share of the pool per incident. Withdrawals have a 7-day waiting period, and assets waiting to be withdrawn still cover claims. | yes |
| landing.coverPools.warning | …jika token yang diasuransikan mengalami kerugian, setoran di pool dapat dipakai untuk membayar klaim… | …if an insured token suffers a loss, pool deposits may be used to pay claims… | yes |
| landing.pool.earningsHelp | Pendapatan dibayar dalam USD8, bukan {asset}. Pendapatan tidak ikut menanggung klaim asuransi dan dapat ditarik kapan saja. | Earnings are paid in USD8, not {asset}. They do not cover insurance claims and can be withdrawn any time. | yes |
| app.pool.cooldownStarted | Masa tunggu dimulai. Jumlah ini berhenti menghasilkan imbal hasil dan bisa berkurang jika pool membayar klaim sebelum penarikan Anda tuntas. | Cooldown started. This amount stops earning yield and can decrease if the pool pays claims before your withdrawal completes. | yes |
| transactions.pool.withdrawAvailability (+cooldownWithLength, adjective) | {amount} share tersedia. Masa tunggu 7 hari jika tidak ada klaim yang tertunda; jika ada, setelah semua klaim difinalisasi. | {amount} shares available. 7-day waiting period if no pending claims; if there are, after all claims are finalized. | yes |
| transactions.pool.mayDecrease | Bisa berkurang jika pool membayar klaim sebelum penarikan Anda tuntas. | May decrease if the pool pays claims before your withdrawal completes. | yes |
| landing.claims.availableHelp | Skor baru bisa digunakan setelah 7 hari, dikurangi skor yang sudah terpakai untuk klaim. | Score can only be used after 7 days, minus score already spent on claims. | yes |
| simulateClaim.intro | …Saat penyelesaian, TEE menghitung ulang semuanya, jadi pembayaran akhir bisa berbeda. | At settlement the TEE recalculates everything, so the final payout may differ. | yes |
| simulateClaim.insuredToken.help | …Cakupan maksimumnya menentukan batas kerugian, dan pool proteksi yang berisi token yang sama dikecualikan dari insiden token tersebut. | Its max coverage sets the loss cap, and a cover pool holding the same token is excluded from that token's incident. | yes |
| lib.pool.depositsPausedForIncident | Setoran untuk sementara tidak tersedia selama insiden asuransi #{incident} masih aktif. Coba lagi setelah insiden difinalisasi. | Deposits are temporarily unavailable while insurance incident #{incident} is active. Try again after it is finalized. | yes |
| notices.site.message | Selama beta privat, laju skor asuransi untuk USD8 yang Anda pegang mendapat boost 300%, dan Anda akan menerima 3 Booster di akhir beta. | During the private beta, the insurance score rate on USD8 you hold gets a 300% boost, and you will receive 3 Boosters at the end of the beta. | yes (see §6) |
| docs defi-insurance "1 File a Claim" | harga TWAP 24 jam yang berurutan … turun >20% dalam 1-6 hari terakhir; skor … diperoleh minimal 7 hari sebelum penurunan harga; … memegang token … minimal 7 hari sebelum penurunan harga. Jaminan 10 USD8 dikembalikan penuh jika syarat 2 dan 3 terpenuhi. | adjacent 24h TWAP fell >20% in the last 1-6 days; score earned at least 7 days before; token held at least 7 days before; 10 USD8 bond fully refunded if conditions 2 and 3 are met. | yes |
| docs cover-pools "Insurance Payout Limit" | …pembayaran maksimum per insiden dibatasi 50% dari ukuran Pool Proteksi saat itu. | max payout per incident is capped at 50% of the Cover Pool's size at that time. | yes |
| docs faqs "How does USD8 make money?" | 20% dari sisa pembayaran — karena pengaju klaim hanya mendapat cakupan maksimum 80%, sisa 20%-nya menjadi biaya bagi USD8. | 20% of payout left over — since claimers get at most 80% coverage, the remaining 20% is USD8's fee. | yes |
| consent message | …Analitik baru dimuat setelah Anda menyetujuinya. Jika Anda menolak, aplikasi tetap berfungsi seperti biasa. | Analytics only load after you agree. If you reject, the app keeps working as usual. | yes |

## 5. Term decisions (judged; changed only where noted)

- **Cover Pool → "Pool Proteksi"**: kept. "Proteksi" is what Indonesian insurers and fintech apps call cover; "pool" is the normal DeFi loanword. Added rule: the protocol's pools collectively = "Pool Proteksi milik USD8", because "Pool Proteksi USD8" is the USD8-asset pool's name.
- **Redeem → "Tebus" / "penebusan"**: kept (the verb Indonesian earn/fund apps use for redemption). Now also used for pool shares ("Share Pool yang Ditebus") instead of "Ditukar".
- **Return Tokens → "Ambil Kembali Token"**: kept. It says the tokens come back to the user; "Kembalikan Token" would read as the user handing tokens over. The combined button now uses the same verb.
- **Settle & Dispute → "Selesaikan & Sanggah"**: kept. Matches "masa sanggah" (established Indonesian term for an objection window) used in the claim status and docs; label is short enough for the table cell.
- **"di akhir beta"** where EN says only "at the end": kept. "di akhir" alone is an incomplete phrase in Indonesian; the end of the private beta is the evident meaning and matches the owner-reviewed zh (内测结束时) and ko (베타 종료 시).
- APY/TVL kept as "APY"/"TVL"; 7D/30D → "7H"/"30H" (Indonesian chart convention, H = hari) — kept.

## 6. For human judgement

- "3 Booster di akhir beta": confirm the boosters are given at the end of the private beta (not at the end of some other period).
- 7H/30H toggles: a user used to English charts could read "H" as hours; the APY label beside them and Indonesian app convention make "hari" the expected reading.
- `landing.pool.yieldTarget` "Pool Proteksi" (13 chars) fills the 84px box of the yield illustration edge to edge at 11px; legible but tight (English "Cover pool" is 10 chars).
