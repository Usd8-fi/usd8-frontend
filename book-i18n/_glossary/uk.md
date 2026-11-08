# Глосарій USD8 — українська (uk)

One rendering per term, used the same way in the app JSON (`src/locales/uk/`), the docs (`book-i18n/uk/`) and the injected docs/consent strings (`book-i18n/_review/uk-shared.json`). Real Ukrainian, not a Russian calque: дохідність (not доходность), скарбниця (not казначейство), злам (not злом), завдяки (not дякуючи), строк for legal time limits.

Style: «ви» (lowercase), neutral product tone; «» quotes; apostrophe ’ (U+2019); en dash in ranges (9–12 днів); sentence case in headings. Numbers keep English formatting ('.' decimals, no thousands separators, $500, 20%).

## Key decisions

- **APY → «Річна дохідність»** (labels and tooltips); first docs mention «річна дохідність (APY)», then «дохідність». Ukrainian banks and finance apps speak of «% річних»/«дохідність»; bare «APY» reads as an untranslated leftover, and «річна» keeps a 7D/30D figure from being misread as a 7- or 30-day return.
- **7D / 30D toggle → «7Д» / «30Д»**: the short chart-period convention in Ukrainian trading UIs; fits the small buttons. Label without toggle: «Річна дохідність (30Д)». Tooltip: «за даними 30 дн.».
- **TVL → «Обсяг пулу»**: the pool card label; plain Ukrainian, no English acronym. «Pool Filled» → «Заповненість».
- **Cover Pool → «пул покриття»** (pl. пули покриття; «Пул покриття wstETH», «Пул покриття USD8»). «Покриття» is the standard insurance term for coverage; «пул» is established in DeFi.
- **Insurance Score → «страхові бали»** (plural for an amount; «бал» = point is native Ukrainian). «бали» alone for score. Score Rate → «Нарахування балів»; Score Earned → «Нараховано балів»; available score → «доступні бали».
- **Claim → «заявка»** (подати заявку, подання заявки); claimant → «заявник». «Вимога»/«позов» sound legal-adversarial; «заявка» is what Ukrainian insurers' apps use for a payout request.
- **Settle / Settlement → «врегулювати / врегулювання»**: the Ukrainian insurance term («врегулювання збитків»). Settlement root → «корінь врегулювання (settlement root)».
- **Windows → «строк»** (строк подання заявок, строк врегулювання, строк виплати, строк оскарження): legal Ukrainian for a deadline period; «вікно» is a calque.
- **Cooldown → «період очікування»**; Start Cooldown (button) → «Запросити виведення» (what the user actually does; short). Holding period / requirement → «період утримання» / «вимога щодо утримання».
- **Treasury → «скарбниця»** (native word, used for DAO treasuries); contract name stays «Treasury».

## Term list

| English | Українська |
| --- | --- |
| Cover Pool / Cover Pools | пул покриття / пули покриття |
| Cover Pool LP / depositor | LP пулів покриття / вкладник |
| Insurance Score | страхові бали (concept: страховий бал) |
| Score to spend | страхові бали до списання |
| Booster | бустер (NFT-бустер) |
| Claim / file a claim | заявка / подати заявку |
| Claimant | заявник |
| Claim bond / anti-spam bond | застава за заявку / застава (захист від спаму) |
| Escrow / escrowed | ескроу / в ескроу (внести в ескроу, забрати з ескроу) |
| Settle / settlement | врегулювати / врегулювання |
| Dispute (window) | оскаржити / строк оскарження |
| Payout / finalize payout | виплата / завершити виплату |
| Accept / decline payout | прийняти виплату / відмовитися від виплати |
| Return tokens | повернути токени |
| Reimbursement / loss cap | відшкодування / ліміт відшкодування |
| Insured token | застрахований токен |
| Max coverage | максимальне покриття (column: Макс. покриття) |
| Insurance Payout Limit / Cover Pool limit | ліміт страхових виплат / ліміт пулу покриття |
| Incident | інцидент |
| Underlying asset | базовий актив |
| Deposit / deposit cap | внести, депозит / ліміт депозитів |
| Withdraw / withdrawal | вивести / виведення |
| Earnings | дохід |
| Yield | дохідність = rate/APY («річна дохідність», «дохідність вища»); дохід = the income itself («дохід скарбниці», «приносять дохід», «джерело доходу») |
| Shares | частки |
| Exit queue | черга на виведення |
| Cooldown | період очікування |
| Mint / Redeem | випустити, випуск / погасити, погашення |
| Approve (ERC-20) | дозвіл («Підтвердьте дозвіл на {symbol} у гаманці») |
| Treasury | скарбниця (contract: Treasury) |
| Vault | сховище |
| Timelock / Timelock Queues | таймлок (gen. таймлоку; contract: Timelock) / Черги таймлоку |
| Admin | адміністратор |
| Beta / private beta | бета / приватна бета |
| White Hat Economy | економіка білих хакерів |
| Stablecoin | стейблкоїн |
| Onchain / offchain | ончейн / офчейн |
| Open source | відкритий код |
| Hack | злам |
| Philosophical Roots | Філософське підґрунтя |
| System Stats / Addresses | Статистика системи / Адреси |
| FAQs / Transparency / Legal | Поширені запитання / Прозорість / Правова інформація |
| Check (booster button) | Перевірити |

Keep in English: USD8, sUSD8, USDC, wstETH and all token symbols; TEE, TWAP, RPC, LP, NFT, L2, zk; Morpho, Aave, Sky, Chainlink, Brevis, OpenZeppelin, Github, Telegram, X; contract and function names (Registry, Treasury, DefiInsurance, endBetaMode) and the contract names in the address table; addresses, URLs, code.

## Grammar notes for composed strings

- lib.json durations are accusative because every host reads «через {duration}» (1 годину, 2 години, 5 годин); plural forms one/few/many/other via Intl.PluralRules. Duration adjectives are genitive («7-денного») because the host is «після {cooldown}» → «після 7-денного періоду очікування».
- `fileClaim.holdingRequirement.*` are genitive continuations of «щонайменше впродовж …» in `tokenAmountHelp`/`boostersHelp`; block counts go after a colon («блоків: {blocks}») to avoid number agreement.
- Other namespaces only have _one/_other: counted values sit after a colon («Доступно: {amount}», «Зараховано: {count}») or use abbreviations that never agree (дн., год, хв).
- Placeholders after a preposition requiring an oblique case are avoided («Закрити виведення: {pool}»).
- `landing.yieldIllustration.label` ends «надходить у {target}»; targets are written in the accusative (= nominative here): «сховище sUSD8», «пул покриття».
