# Italian (it) glossary — USD8 docs and app UI

English -> Italiano (use exactly these forms everywhere). Translate the idea, not word by word; keep facts, numbers, conditions and risks.

## Kept in English (and why)
Cover Pool -> Cover Pool (product name; masculine, invariable plural: "il Cover Pool", "i Cover Pool"; UI pool names "Cover Pool wstETH", "Cover Pool USD8"). Reviewed: kept as a proper product name (Italian DeFi users read English pool names; "fondo di copertura" would mean hedge fund). es/fr/pt use "pool de cobertura/couverture"; the Italian equivalent would be "pool di copertura", but `libI18n.test.js` pins "Il Cover Pool è pieno…", so switching needs that test updated too.
Addresses-table contract labels stay English ("wstETH Cover Pool", "USD8 Cover Pool", "USD8 Price Oracle"): owner rule for contract names; timelock-queue.js reads them as contract names.
Pool name in a sentence: all pool names are masculine and start with a consonant, so "del/nel/dal {pool}" is safe ("Informazioni sui tuoi guadagni nel {pool}").
Booster / Boosters -> Booster (NFT name; invariable: "i Booster")
Timelock -> Timelock (contract name; masculine: "il Timelock"); Timelock Queues -> Code del Timelock
White Hat Economy -> White Hat Economy (proper name); generic "white hat economy" in prose -> "economia white hat"
APY -> APY in labels/metrics (standard in Italian crypto apps: Binance, Coinbase, Bitpanda show "APY"; "rendimento annuo" is too long for a metric label). In prose prefer "rendimento" ("I rendimenti possono essere elevati"), or "rendimento (APY)" on first mention.
7D / 30D toggle -> 7G / 30G (G = giorni, the compact form used by Italian trading UIs); "{window} APY" -> "APY {window}" (APY 30G); full form in aria/help: "APY a 7 giorni"
TVL -> TVL (universal in Italian DeFi)
settlement root -> settlement root (technical)
Bounty -> bounty

## Translated
Insurance Score -> punteggio assicurativo (sentence case in UI: "Il tuo punteggio assicurativo")
Available score -> punteggio disponibile
Score rate -> tasso di punteggio; "{rate} per {unit} al giorno"; earned -> maturato
Claim (noun) -> richiesta di risarcimento (short UI form: "richiesta"); File a Claim (title) -> Richiedi un risarcimento; button "Presenta richiesta"; section "Richieste di risarcimento"
Claimer -> richiedente
Payout -> indennizzo; Reimbursement -> rimborso; Insurance Payout Limit -> limite di indennizzo
Finalize Payouts -> finalizzare gli indennizzi; Accept payout -> accettare l'indennizzo
Settle / Settlement -> liquidare / liquidazione (insurance sense)
Insured Token -> token assicurato (pl. token assicurati); Max coverage -> copertura massima
Escrow / escrowed -> vincolare / vincolato ("Token assicurato vincolato", "Cauzione vincolata", "Booster da vincolare")
Return tokens (escrow back to the claimer) -> ritirare i token ("Ritira i token") — never "restituisci", which reads as the user giving tokens back
Bond -> cauzione (refunded -> rimborsata; forfeited -> persa)
Withdraw -> prelievo / prelevare; Withdraw Earnings -> Preleva guadagni; cooldown -> periodo di attesa ("Avvia periodo di attesa")
Pool shares -> quote del pool
Mint / Redeem -> conia / riscatta (conio / riscatto)
Supply (of USD8) -> circolante
Cover Pool LP -> chi fornisce liquidità ai Cover Pool
Incident -> incidente; Dispute -> contestare / contestazione
Treasury -> tesoreria (the contract name "Treasury" stays English)
Pool Filled -> Riempimento pool; "{percent}% capacity filled" -> "Capacità utilizzata: {percent}%"
deployed (on a network) -> disponibile ("USD8 non è disponibile su {network}"), not "distribuito"
Beta -> beta; Admin -> admin
System Stats -> Statistiche di sistema; Addresses -> Indirizzi; FAQs -> FAQ; Transparency -> Trasparenza; Philosophical Roots -> Radici filosofiche; DeFi Insurance -> Assicurazione DeFi; Legal -> Note legali
Check (booster checker button) -> Verifica

Keep in English: USD8, sUSD8, token symbols (USDC, wstETH, aUSDC...), protocol/company names (Aave, Morpho, Chainlink, Brevis, OpenZeppelin...), TEE, contract/function names (Registry, Treasury, DefiInsurance, endBetaMode), addresses, URLs, code.

## Style
- Informal "tu" for the reader, "noi" for the team; gender-neutral where easy ("Ti diamo il benvenuto", "Non hai diritto all'indennizzo" instead of "non sei idoneo").
- Sentence case for headings and labels (only first word and proper names capitalised).
- Numbers keep English formatting (0.8, $2250, 20%) — never localise decimal separators.
- Never put an article or articulated preposition directly before a placeholder whose value is unknown ("al {percent}%" breaks for 8% -> "all'8%"): use a colon label ("Capacità utilizzata: {percent}%") or put the placeholder first.
- Counted phrases must not depend on agreement with a number from code: use "ancora {minutes}" (not "mancano {minutes}"), "Conteggiati: {count}", "prelievo tra {count} giorni".
- Quote UI labels with “ ” (e.g. Premi “Ricarica dati”); executableFrom uses a colon label because {date} is an English toUTCString().
- Typographic apostrophe ’ in app JSON (dell’incidente); docs keep the straight ' (mdBook does not convert quotes).
- Close-button aria labels say what is closed: "Chiudi la finestra di deposito nel {pool}", never "Chiudi il deposito" (reads as closing the position).
- Private beta boost: "300% boosted" = 3x the base rate -> "tasso triplicato (300%)"; never "potenziato del 300%" (= +300%, i.e. 4x). The flag keeps "x300%".
- Plurals: Italian CLDR has a "many" form (1000000); lib.json writes `_many` as "{count} di giorni".


## Update: private beta boost

The English source now says "3x for private beta" and "at 3x the normal rate … at the end of the beta". Current wording lives in `src/locales/it/landing.json` (`usd8.flag`) and `notices.json` (`site.message`); it supersedes any "300%"/"x300%" wording above.
