# USD8 glossary — Russian (ru)

Source of truth for product terms in the Russian docs (`book-i18n/ru/`). Reuse these exact forms in the app UI.

## Product terms (English -> Russian)

- Cover Pool -> пул покрытия (pl. пулы покрытия; title case in headings/buttons: «Пул покрытия»)
- Cover Pool LP -> вкладчик пула покрытия (pl. вкладчики пулов покрытия); «поставщик ликвидности (LP)» only where the text is about LPs in general
- Insurance Score -> страховые баллы (plural for the amount a user holds/spends: «Ваши страховые баллы», «Бесплатные страховые баллы»; singular «страховой балл» only for the concept/weight); "score" alone -> баллы
- Score Rate -> начисление баллов; Score Earned -> начислено баллов
- Available score -> доступные баллы
- Booster -> бустер (pl. бустеры)
- Claim (noun) -> заявка; File a Claim -> подать заявку / «Подача заявки»
- Claimer -> заявитель
- Payout -> выплата; Finalize Payouts -> завершение выплат
- Settle / Settlement -> урегулировать / урегулирование; settlement root -> корень урегулирования (settlement root)
- Insured Token -> застрахованный токен
- White Hat Economy -> экономика белых хакеров (title: «Экономика белых хакеров»)
- Timelock -> таймлок in prose; keep "Timelock" as the contract name (address table, contract lists)
- Admin -> администратор
- Escrow -> эскроу; escrowed tokens -> токены в эскроу; to escrow -> внести в эскроу
- Bond -> залог
- Exit queue -> очередь на выход; Exit epoch -> эпоха выхода
- Withdraw -> вывод средств / вывести
- Cooldown -> период ожидания (add «(cooldown)» once in docs only)
- Beta -> бета (в период беты, после беты)
- Incident -> инцидент
- Max coverage -> максимальное покрытие
- Insurance Payout Limit -> лимит страховых выплат
- Treasury -> казначейство (keep "Treasury" when naming the contract)
- Deposit cap -> лимит депозитов
- Strategy -> стратегия
- DeFi Insurance -> DeFi-страхование (contract name stays "DefiInsurance"/"DeFi Insurance")
- Stablecoin -> стейблкоин
- Onchain / Offchain -> ончейн / офчейн (adjectives: ончейн-часть, офчейн-TEE)
- Open-sourced -> с открытым кодом / открытый код
- Yield -> доходность; earnings paid to a depositor -> доход
- APY -> «Доходность» as a UI label; «годовая доходность (APY)» on first mention in docs prose, then «доходность». Not left as bare «APY» in UI
- 7D / 30D (APY window toggle) -> 7Д / 30Д; window label «Доходность (30Д)»; prose «за 7 дн.»
- TVL -> Объём пула (pool card label)
- Pool name -> «Пул покрытия wstETH», «Пул покрытия USD8» (asset symbol after the noun; wstETH spelled exactly)
- Approve (ERC-20) -> разрешение / «Разрешите использование {symbol} в кошельке» (not «одобрение»)
- Start Cooldown (button) -> «Запросить вывод»; the waiting phase itself -> период ожидания
- Loss Cap (simulator) -> лимит возмещения
- Dispute window -> окно оспаривания
- System Stats -> Статистика системы; Addresses -> Адреса; Timelock Queues -> Очереди таймлока
- FAQs -> Частые вопросы; Transparency -> Прозрачность; Legal -> Правовая информация
- Check (booster checker button) -> Проверить
- Private-beta boost ("x300%", "300% boosted" = 3x the normal rate) -> «×3», «по тройной ставке (300% от обычной)»; never «на 300%» / «повышенной на 300%» (that reads as 4x)
- Booster lifecycle wording: boosters are ADDED to a claim (добавить к заявке) and BURNED only when the payout is accepted (сжигаются при принятии выплаты); never «сжечь при подаче заявки»

## Keep in English

USD8, sUSD8, USDC, wstETH and all token symbols; TEE, TWAP, LP, NFT, RPC, L2, zk; protocol/company names (Aave, Morpho, Chainlink, Brevis, OpenZeppelin, Github, Telegram, X); contract and function names (Registry, Treasury, DefiInsurance, endBetaMode); addresses, URLs, numbers.

## Style notes

- Address the user with «вы» (lower-case), neutral professional tone, no slang ("клейм", "пул ликвидности" for Cover Pool are avoided).
- Numbers keep the English decimal point (0.3, 0.1) and no thousands separators — never localize numbers in money contexts. Percent sign attached: 20%, 80%. Dollar amounts as $500.
- Ranges use an en dash: 9–12 дней, 1–6 дней.
- Use Russian «ёлочки» for quotes; keep page titles in quotes when referenced in running text: раздел «Прозрачность».
- Headings in sentence case (only the first word capitalized).
- Time units in compact UI: «дн.», «ч», «мин» for every count (no _one/_other agreement problems); full words only where lib.json durations pick plural forms via Intl.PluralRules (_one/_few/_many/_other).
- Never put a placeholder after a preposition that needs an oblique case (из/для/о + {pool}); use «Закрыть окно вывода: {pool}» style instead. Counted nouns in strings with only _one/_other keys go after a colon («Доступно долей: {amount}»).
- Status/progress text uses short native phrasing («Проверяем…», «ждём урегулирования») rather than nominalised calques («Проверка …», «ожидание присоединения …»).
- Translate the idea, not the line: reorder or merge clauses freely, but keep every fact, number, condition and risk caveat.
