# Indonesian (id) glossary — USD8 docs + app UI

Style: formal "Anda"; natural Indonesian product copy as written by local crypto apps (Pintu, Indodax, Tokocrypto), translated by meaning, not word for word (clauses reordered, sentences merged/split; facts, numbers, conditions and risk caveats unchanged). Imperative buttons in Title Case and short (phone width). Keep USD8, sUSD8, token symbols (USDC, wstETH, aUSDC, sGHO …), protocol/company names (Aave, Morpho, Sky, Chainlink, OpenZeppelin, Brevis, Github, Telegram, X), TEE, TWAP, RPC, NFT, LP, zk, contract/function names (Registry, Treasury, DefiInsurance, endBetaMode), addresses, URLs and code in English. Contract names in the Addresses table stay English (timelock-queue.js reads them).

Typography: numbers come from code and keep English formatting ("0.3", "$2250", no thousands separators); percent without space ("20%", Indonesian convention); ranges "9-12 hari". Loanword verbs take a hyphen: di-mint, di-upgrade, di-revert, di-boost.

## Key decisions

- **APY stays "APY"** in labels and in most prose ("APY tinggi"), with "imbal hasil" for yield in general. Reason: Indonesian crypto apps and media use "APY" as-is (Pintu Earn, Bybit/Binance ID, blockchainmedia.id); the native equivalent ("persentase hasil tahunan") is long and nobody scans for it. Window label: "APY 30H" (noun first, Indonesian order).
- **7D / 30D → "7H" / "30H"** (H = hari) — the chart-toggle convention of Indonesian exchanges (24J, 7H, 1B, 1T). Long form in tooltips: "APY 30 hari". Note the toggle group renders as "7H 30H APY" because the suffix is appended after the buttons.
- **TVL stays "TVL"**: universal DeFi metric used untranslated in Indonesian crypto media.
- **USD8's Cover Pools (plural, the protocol's pools) → "Pool Proteksi milik USD8"**, never "Pool Proteksi USD8", which is the name of the single pool holding USD8.
- **Cover Pool → "Pool Proteksi"** (pool names: "Pool Proteksi wstETH", "Pool Proteksi USD8"). "Pool" is the everyday DeFi loanword ("pool likuiditas"); "proteksi" is how Indonesian insurers market cover ("proteksi asuransi"). "Pool Pertanggungan" is correct but legalistic and long. Contract names in the address table stay "wstETH Cover Pool" etc.
- **Claim → "klaim"** (ajukan klaim, pengaju klaim, jaminan klaim) — the standard Indonesian insurance word.
- **Payout → "pembayaran"** (Terima Pembayaran, periode pembayaran); **reimbursement → "penggantian"** (simulator).
- **Cooldown → "masa tunggu"** (Mulai Masa Tunggu, dalam masa tunggu). Score maturity "holding period" → "periode kepemilikan", kept distinct from the withdrawal cooldown.
- **Settle / settlement → "selesaikan" / "penyelesaian"**; dispute window → **"masa sanggah"** (the established Indonesian term for an objection window).
- **Escrow stays "escrow"** ("di escrow", "menitipkan … di escrow"): Indonesian finance uses the loanword (rekening escrow).
- **Booster, Timelock** stay as proper names; **White Hat Economy → "Ekonomi White Hat"** (Indonesian word order, "white hat" is the common security term).

| English | Bahasa Indonesia |
| --- | --- |
| Cover Pool / Cover Pools | Pool Proteksi (prose lowercase: pool proteksi) |
| Cover Pool limit | batas Pool Proteksi |
| Cover Pool LP | LP Pool Proteksi |
| Insurance Score | Skor Asuransi (short: skor) |
| Available score | skor tersedia ("Skor Tersedia Anda") |
| Score to spend | Skor Asuransi yang Digunakan |
| Score Rate | Laju Skor ("{rate} per USD8 per hari") |
| Booster / Boosters | Booster |
| Claim (noun) / File a claim | klaim / Ajukan Klaim |
| File insurance claims (title) | Ajukan Klaim Asuransi |
| Simulate claim | Simulasi Klaim |
| Cancel claim | Batalkan Klaim |
| Claimer / claimant | pengaju klaim |
| Claim window | periode klaim |
| Claim bond / anti-spam bond | jaminan klaim / jaminan anti-spam |
| Claim verification service | layanan verifikasi klaim |
| Settle / Settlement | selesaikan / penyelesaian (settlement root: settlement root) |
| Settlement window | periode penyelesaian |
| Dispute / dispute window | sanggah / masa sanggah |
| Finalize payout | Finalisasi Pembayaran |
| Accept / decline payout | Terima / Tolak Pembayaran ("Cancel Payout and Return Tokens" = Tolak Pembayaran & Ambil Kembali Token, same verb as the Return Tokens button) |
| Return tokens (to the claimer) | Ambil Kembali Token (never "kembalikan", which reads as the user handing them over) |
| Payout | pembayaran |
| Payout window | periode pembayaran |
| Payout limit | batas pembayaran |
| Reimbursement | penggantian |
| Loss cap / loss value | batas kerugian / nilai kerugian |
| Insured token | token yang diasuransikan (label: Token Diasuransikan) |
| Insured (yes/no) | Diasuransikan — "YA, dengan batas" |
| Max coverage / coverage | cakupan maksimum (column: Cakupan Maks.) / cakupan |
| Bond | jaminan |
| Escrow / escrowed | escrow / di escrow, dititipkan di escrow |
| Forfeit | melepaskan (token, skor); bond: hangus |
| Incident | insiden |
| Holding requirement | syarat kepemilikan |
| Eligibility / eligible | kelayakan / memenuhi syarat |
| Payout weight | bobot pembayaran |
| Underlying asset | aset dasar |
| White Hat Economy | Ekonomi White Hat |
| Timelock / Timelock Queues | Timelock / Antrean Timelock |
| Queued / Ready to Execute / Executed | Dalam antrean / Siap Dieksekusi / Dieksekusi |
| Admin | admin |
| Private beta / invitation code | beta privat / kode undangan |
| Exit queue | antrean keluar |
| Withdraw / withdrawal | tarik / penarikan |
| Cooldown / Start Cooldown | masa tunggu / Mulai Masa Tunggu |
| Deposit (verb / noun) | setor / setoran |
| Deposit cap | batas setoran |
| Pool Filled / Uncapped | Pool Terisi / Tanpa Batas |
| Shares | share (pool) |
| Earnings | pendapatan (Tarik Pendapatan) |
| Yield / treasury yield | imbal hasil / imbal hasil treasury |
| Balance | saldo |
| Approve (ERC-20) | setujui / persetujuan |
| Mint / Redeem | Mint / Tebus (penebusan); redemption quote: estimasi penebusan; pool shares to redeem: share pool yang ditebus (same verb as USD8 redeem, review change) |
| Treasury | treasury (contract name: Treasury) |
| Vault | vault |
| Wallet / Connect Wallet | dompet / Hubungkan Dompet |
| Stablecoin | stablecoin |
| Onchain / Offchain / Open source | on-chain / off-chain / open source |
| Deployed on network | tersedia ("USD8 tidak tersedia di {network}") |
| Finalized block / finality | blok final / finalitas |
| DeFi Insurance | Asuransi DeFi |
| Philosophical Roots | Akar Filosofis |
| Transparency | Transparansi |
| System Stats | Statistik Sistem |
| FAQs | FAQ |
| Legal | Legal (legal.md itself stays English) |
| Docs (footer) | Dokumentasi |
| About X (tooltip aria-label) | Tentang X |
| Learn More | Pelajari lebih lanjut |
| Retry / Retry Data | Coba Lagi / Muat Ulang Data |
| Check (booster button) | Cek |
