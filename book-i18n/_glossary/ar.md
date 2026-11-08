# Arabic (ar) glossary — USD8 docs + app UI

Style: Modern Standard Arabic, plain product voice, second person singular imperative for actions ("أدخِل", "أكِّد", "اربط"), noun forms for buttons ("تقديم مطالبة", "سحب الأرباح"). Translated by meaning: clauses reordered, sentences merged or split where natural; facts, numbers, conditions and risk caveats identical. The site renders RTL.

Keep in Latin script: USD8, sUSD8, token symbols (USDC, wstETH, aUSDC, wBTC …), brand/protocol names (Morpho, Aave, Chainlink, Brevis, OpenZeppelin, Github, Telegram, X), TEE, TWAP, RPC, NFT, LP, L2, contract/function names (Registry, Treasury, DefiInsurance, endBetaMode), addresses, URLs, code. Contract names in the Addresses table stay English (timelock-queue.js reads them).

Typography: Western digits 0-9 and "." decimals exactly as English; Arabic punctuation ، ؛ ؟ and «» quotes; ranges with an en dash ("9–12 يومًا"). Prefix ل/ب attaches to a Latin name with no space: "بـUSD8"; never put "لـ" before a placeholder that can start with an Arabic word (pool names are "مجمع تغطية …"), use "في {pool}" instead. Dollar amounts in docs prose are written "500 دولار" / "2250 دولارًا" (a bare "$500" renders as "500$" in RTL). A leading signed number is wrapped in bidi isolates: "\u2066+{amount}\u2069 …", otherwise RTL shows "1,234.5+". Gender: USD8 the coin is feminine (عملة: "USD8 غير متاحة"); the protocol is "بروتوكول USD8" (masculine).

## Key decisions

- **APY → "العائد السنوي"** (labels and prose). The usual Arabic rendering of annual percentage yield in Arabic finance/earn copy; a bare Latin "APY" inside RTL Arabic UI reads as an untranslated leftover. Windowed label: "العائد السنوي ({window})".
- **7D / 30D toggles → "7 أيام" / "30 يومًا"**: short, grammatical (3–10 take the plural أيام, 11–99 take يومًا), no unfamiliar abbreviation on a tappable button.
- **TVL → "القيمة المقفلة"** in the small stat label (short form of the standard "إجمالي القيمة المقفلة (TVL)" used by Arabic crypto media).
- **Claim → "مطالبة"** (تقديم مطالبة، صاحب المطالبة، ضمان المطالبة): the standard Arabic insurance term (مطالبة تأمينية).
- **Payout / Reimbursement → "التعويض"**: Arabic insurance wording for the money paid out on a claim.
- **Insurance Score → "نقاط التأمين"** (score alone: "النقاط"): reads as an earned balance; "درجة" would sound like a grade/rating.
- **Cover Pool → "مجمع التغطية"** (pl. مجمعات التغطية; "مجمع تغطية wstETH"): "مجمع" is the established Arabic DeFi word for pool (مجمع السيولة).
- **Booster → "معزِّز"** (pl. معززات): natural Arabic noun for a boost item.
- **Cooldown → "فترة الانتظار"** ("بدء فترة الانتظار", "في فترة الانتظار"): plain and unambiguous; "فترة التهدئة" is a calque.
- **Token → "رمز"** (pl. رموز): MSA term used by Arabic exchanges; "رمز الدعوة" (invitation code) is unambiguous in context.
- **Timelock → "القفل الزمني"**; contract name stays "Timelock" in the address table.
- **Counted durations (lib.json)** use all six Arabic plural forms: zero/one/other "{count} يوم", two "يومين" (genitive/accusative, as durations follow بعد/خلال), few "{count} أيام", many "{count} يومًا". The adjective forms are used as a nominative predicate ("فترة انتظار مدتها {length}") so two = "يومان". _one keeps "{count}" (required by the placeholder test).
- **Compact countdowns (fileClaim.time, which the code only selects as one/other)** use standard short units: "ي" (يوم)، "س" (ساعة)، "د" (دقيقة), e.g. "يتبقى 2 ي و5 س". Full words would be ungrammatical for many counts with only two forms.
- Counted strings that cannot choose a plural form put the number after a colon ("المتاح: {amount}", "مع احتساب المعززات: {count}") so Arabic number agreement never breaks.

| English | العربية |
| --- | --- |
| Cover Pool / Cover Pools | مجمع التغطية / مجمعات التغطية |
| Cover Pool limit | سقف مجمع التغطية |
| Insurance Payout Limit | سقف التعويضات التأمينية |
| Cover Pool LP | مزوّد السيولة في مجمع التغطية |
| Cover Pool budget (simulator) | ميزانية مجمعات التغطية |
| Insurance Score | نقاط التأمين |
| Available score | النقاط المتاحة |
| Score to spend | نقاط التأمين المستخدمة |
| Score Rate | معدل النقاط ("{rate} لكل {unit} يوميًا") |
| Score weight | وزن النقاط |
| Booster / Boosters | معزز / معززات |
| Claim (noun) | مطالبة |
| File a claim | تقديم مطالبة |
| Simulate claim | محاكاة مطالبة |
| Cancel claim | إلغاء المطالبة |
| Claimer / claimant | صاحب المطالبة (pl. أصحاب المطالبات) |
| Claim window | فترة المطالبات |
| Claim bond / Bond | ضمان المطالبة / ضمان (يُردّ = refunded) |
| Settle / Settlement | تسوية / التسوية |
| Settlement window | فترة التسوية |
| Settlement root | جذر التسوية (settlement root) |
| Dispute / dispute window | اعتراض / فترة الاعتراض |
| Finalize payout | إتمام التعويض |
| Accept / decline payout | قبول التعويض / رفض التعويض |
| Return tokens | استعادة الرموز |
| Payout | التعويض |
| Payout window | فترة التعويض |
| Reimbursement | التعويض (estimated: التعويض التقديري) |
| Loss cap | سقف الخسارة |
| Loss value | قيمة الخسارة |
| Insured Token | الرمز المؤمَّن (pl. الرموز المؤمَّنة) |
| Max coverage | أقصى تغطية / التغطية القصوى |
| Escrow / escrowed | احتجاز / محتجز |
| Forfeit | يتنازل عن (bond: يخسر الضمان) |
| Incident | حادثة |
| Holding requirement / window | شرط الاحتفاظ / فترة الاحتفاظ |
| Price drop | هبوط سعري |
| Attestation | شهادة (attestation) |
| White Hat Economy | اقتصاد القبعات البيضاء |
| Timelock / Timelock Queues | القفل الزمني / قوائم انتظار القفل الزمني |
| Admin | المشرف |
| Beta / private beta | النسخة التجريبية / النسخة التجريبية الخاصة |
| Exit queue | طابور الخروج |
| Withdraw / withdrawal | سحب |
| Cooldown | فترة الانتظار |
| Deposit / deposit cap | إيداع / الحد الأقصى للإيداع |
| Pool Filled | امتلاء المجمع |
| Shares | حصص |
| Earnings | الأرباح |
| Balance | الرصيد |
| Approve (ERC-20) | الموافقة على الإنفاق |
| Mint / Redeem | سكّ / استرداد |
| Redemption quote | سعر الاسترداد |
| Treasury / treasury yield | الخزينة / عائد خزينة USD8 (contract: Treasury) |
| Vault | خزنة (sUSD8 vault: خزنة sUSD8) |
| Yield | عائد |
| APY | العائد السنوي |
| TVL | القيمة المقفلة |
| Stablecoin | عملة مستقرة |
| Onchain / Offchain | على السلسلة / خارج السلسلة |
| Open source | مفتوح المصدر |
| Block / finalized block | كتلة / كتلة مؤكَّدة نهائيًا |
| Wallet / network / transaction | محفظة / شبكة / معاملة |
| Oracle | أوراكل |
| DeFi Insurance | تأمين DeFi |
| Philosophical Roots | الجذور الفلسفية |
| Transparency | الشفافية |
| System Stats | إحصاءات النظام |
| FAQs | الأسئلة الشائعة |
| Legal | الشروط القانونية (legal.md stays English) |
| Cookie settings | إعدادات ملفات تعريف الارتباط |
| Check (booster button) | تحقّق |
| Retry Data / Retry Score (header buttons) | تحديث البيانات / تحديث النقاط (short; "إعادة تحميل …" was 2x English on phones) |
| Learn More | اعرف المزيد |
