# Persian (fa) glossary — USD8 docs + app UI

Style: natural Persian product copy written by meaning, not word for word (clauses reordered, sentences merged or split where Persian needs it; every fact, number, condition and risk caveat kept). Address the user as «شما». The site renders right-to-left.

Typography:
- Western digits 0-9 and "." decimals exactly as in English (0.8, 0.1, 1:1); no Persian/Arabic-Indic digits and no "٫" decimal separator — numbers come from code and are never localized. Percent stays "20%"; dollar amounts stay "$500".
- Persian punctuation in prose: ، ؛ ؟ and guillemets « ». Ellipsis "…".
- ZWNJ (نیم‌فاصله, U+200C) everywhere it belongs: می‌شود، توکن‌ها، بیمه‌شده، قفل‌شده، آن‌چین، راستی‌آزمایی.
- Ezafe after silent «ه» written as «‌ی» (ZWNJ + ی): دوره‌ی انتظار، بیمه‌ی DeFi، خزانه‌ی USD8 — used consistently in UI and docs.
- Latin script kept for: USD8, sUSD8, token symbols (USDC, wstETH, aUSDC, msLOSS …), DeFi, TEE, TWAP, RPC, NFT, LP, zk, brand/protocol names (Morpho, Aave, Chainlink, Brevis, OpenZeppelin, Github, Telegram, X, Ethereum), contract/function names (Registry, Treasury, DefiInsurance, Timelock in the address table, endBetaMode), addresses, URLs, code. Contract names in the Addresses table stay English (timelock-queue.js reads them).
- Ranges in prose: "9 تا 12 روز" (no en dash, which reads badly in RTL).
- Bidi: never start a string with a sign glued to a placeholder ("+{amount}"): in an RTL paragraph the "+" resolves right-to-left and renders as "12.5+". Rephrase instead («{amount} امتیاز دیگر …»). A leading number, Latin token or "x300%" is fine (it forms one LTR run).
- Mint stays «ضرب» (review decision): it is the established Persian term for coin/stablecoin issuance and pairs with «سوزاندن» (burn); «مینت» is NFT slang and reads as a transliteration in a money UI. The Mint/Redeem pair («ضرب / بازخرید») sits inside the USD8 card, so the one-word button is unambiguous there.

## Key decisions

- **APY → «بازده سالانه»** (labels and prose). Persian exchanges show either «سود سالانه» or the raw "APY"; «بازده» is the precise finance word for yield/return (no promise of a fixed «سود») and «سالانه» keeps the annualisation explicit, so a 7- or 30-day figure is not misread as a weekly/monthly return. Raw "APY" would be a Latin leftover in an otherwise Persian UI.
- **7D / 30D toggles → «7 روز» / «30 روز»**: shortest natural Persian (Persian chart toggles use «۷ روز / ۱ ماه»; "30 روز" keeps the exact window). Single-window label: «بازده سالانه (30 روز)»; tooltip label: «بازده سالانه‌ی … بر مبنای 30 روز».
- **TVL → «ارزش کل قفل‌شده»**: the established Persian DeFi term (used by Persian crypto media alongside "TVL").
- **Cover Pool → «استخر پوشش»** (pl. «استخرهای پوشش»): «استخر» is the standard Persian word for a DeFi pool (استخر نقدینگی); «پوشش» = insurance cover. Pool names: «استخر پوشش wstETH» / «استخر پوشش USD8». Contract labels in the address table stay English.
- **Claim → «درخواست خسارت»** (short «درخواست» once the context is clear); file a claim → «ثبت درخواست (خسارت)»; claimant → «متقاضی». This is how Persian insurers phrase it («اعلام/درخواست خسارت»); «ادعا» would be a calque.
- **Payout → «پرداخت»** (stage/button), «پرداخت خسارت» in prose; reimbursement (simulator) → «جبران خسارت».
- **Bond → «ودیعه»** (claim bond: «ودیعه‌ی درخواست»; anti-spam bond: «ودیعه‌ای 10 USD8 برای جلوگیری از اسپم»). «ودیعه» is the everyday Persian word for a refundable deposit held as guarantee, and stays distinct from «سپرده» (a pool deposit). Forfeited bond: «ضبط می‌شود».
- **Escrow / escrowed → «امانت» / «امانی»** («توکن بیمه‌شده‌ی امانی»، «بوسترهای امانی»، «دارایی امانی خود را برداشت کنید»; boosters to escrow: «بوستر برای امانت‌گذاری»).
- **Cooldown → «دوره‌ی انتظار»** (start cooldown: «شروع دوره‌ی انتظار»; in cooldown: «در دوره‌ی انتظار»; "7-day cooldown": «دوره‌ی انتظار 7 روزه»). A literal «خنک‌سازی» means nothing to users.
- **Insurance Score → «امتیاز بیمه»** (score: «امتیاز»); available score → «امتیاز قابل استفاده»; score to spend → «امتیاز بیمه‌ی مصرفی».
- **Booster → «بوستر»** (NFT name; widely used Persian loanword).
- **White Hat Economy → «اقتصاد کلاه‌سفید»**: Persian security community says «هکر کلاه‌سفید / کلاه‌سیاه», so the program name reads naturally when translated.
- **Timelock → «قفل زمانی»** (first docs mention adds "(Timelock)"); contract name in the table stays "Timelock".

| English | فارسی |
| --- | --- |
| Cover Pool / Cover Pools | استخر پوشش / استخرهای پوشش |
| Cover Pool limit / Insurance Payout Limit | سقف استخر پوشش / سقف پرداخت بیمه |
| Cover Pool LP / depositor | LPهای استخر پوشش / سپرده‌گذار |
| Pool Filled / deposit cap / capacity | ظرفیت پرشده / سقف واریز / ظرفیت |
| Uncapped | بدون سقف |
| Insured Token | توکن بیمه‌شده |
| Insured (yes/no) | بیمه‌شده — «بله، با محدودیت» |
| Insurance Score | امتیاز بیمه |
| Score Rate | نرخ امتیاز («{rate} به ازای هر {unit} در روز») |
| Score weight / payout weight | وزن امتیاز / وزن پرداخت |
| Booster | بوستر |
| Claim (noun) | درخواست خسارت / درخواست |
| File a claim (button) | ثبت درخواست |
| File insurance claims (title) | ثبت درخواست خسارت بیمه |
| Simulate claim | شبیه‌سازی خسارت |
| Cancel claim | لغو درخواست |
| Claimer / claimant | متقاضی |
| Claim window | مهلت ثبت درخواست |
| Claim bond | ودیعه‌ی درخواست |
| Claim verification (service) | (سرویس) راستی‌آزمایی درخواست |
| Settle / settlement | تسویه |
| Settlement window / settlement root | مهلت تسویه / ریشه‌ی تسویه |
| Permissionless (settlement) | بدون نیاز به مجوز |
| Dispute / dispute window | اعتراض / مهلت اعتراض |
| Finalize payout | نهایی‌سازی پرداخت |
| Accept / decline payout | پذیرش پرداخت / رد پرداخت |
| Return tokens (back to the claimer) | پس‌گرفتن توکن‌ها (never «بازگرداندن», which reads as giving them away) |
| Payout / payout window | پرداخت / مهلت پرداخت |
| Reimbursement | جبران خسارت |
| Loss value / loss cap | ارزش زیان / سقف خسارت |
| Max coverage | سقف پوشش |
| Resolved (claim) | تعیین تکلیف شده |
| Unresolved claim | درخواست تعیین‌تکلیف‌نشده (not «درخواست بازی», which also reads "game request") |
| Claim Open / Claim Closed (timeline stage) | ثبت درخواست باز است / ثبت درخواست بسته شد |
| Settle Open / Payout Open / Payout Closed | تسویه باز است / پرداخت باز است / پرداخت بسته شد |
| Claim Open (table button with timer) | مهلت ثبت درخواست (… مانده) |
| Holding requirement (composed help) | «باید {symbol} را دست‌کم از این زمان در کیف پول خود نگه داشته باشید: {holding}» |
| Escrow / escrowed | امانت / امانی |
| Forfeit | واگذار کردن (tokens, score); ضبط شدن (bond) |
| Incident | حادثه |
| Holding requirement / holding window | شرط نگهداری / بازه‌ی نگهداری |
| Holding period (score maturity) | دوره‌ی نگهداری |
| Underlying | دارایی پایه |
| TWAP / TEE | TWAP / TEE |
| Attestation | گواهی (attestation) |
| White Hat Economy | اقتصاد کلاه‌سفید |
| Timelock / Timelock Queues | قفل زمانی / صف‌های قفل زمانی |
| Queued / Executed / Cancelled | در صف / اجراشده / لغوشده |
| Admin | ادمین |
| Beta / private beta | بتا / بتای خصوصی |
| Exit (cover-pool withdrawal) / exit queue | خروج / صف خروج |
| Withdraw / withdrawal | برداشت |
| Cooldown | دوره‌ی انتظار |
| Deposit (verb / noun) | واریز / سپرده |
| Shares | سهم |
| Earnings / rewards | درآمد |
| Balance | موجودی |
| Amount | مقدار (tokens) / مبلغ (money) |
| Approve (ERC-20) | مجوز … را تأیید کنید / مجوز |
| Confirm in wallet | در کیف پول خود تأیید کنید |
| Mint / Redeem | ضرب / بازخرید |
| Redemption quote | نرخ بازخرید |
| Treasury / treasury yield | خزانه / بازده خزانه |
| Yield | بازده |
| APY | بازده سالانه |
| 7D / 30D | 7 روز / 30 روز |
| TVL | ارزش کل قفل‌شده |
| Vault | صندوق |
| Stablecoin | استیبل‌کوین |
| Onchain / Offchain / Open source | آن‌چین / آف‌چین / متن‌باز |
| Audit | آدیت |
| Not deployed on {network} | روی {network} در دسترس نیست |
| Refresh / Retry | به‌روز کردن / تلاش دوباره |
| Retry Data (button) | دریافت دوباره‌ی داده‌ها |
| Loading | در حال بارگذاری |
| DeFi Insurance | بیمه‌ی DeFi |
| Philosophical Roots | ریشه‌های فلسفی |
| Transparency | شفافیت |
| System Stats | آمار سیستم |
| FAQs | پرسش‌های متداول |
| Legal | حقوقی (legal.md itself stays English) |
| Docs | مستندات |
| About X (tooltip aria-label) | درباره‌ی X |
| Check (booster button) | بررسی |
| Cookie & analytics | کوکی و تحلیل بازدید |
