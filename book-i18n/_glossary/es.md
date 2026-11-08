# USD8 glossary — Spanish (es)

Neutral international Spanish, informal "tú" throughout (e.g. "Puedes", "Introduce", "Síguenos"). Use the same term everywhere (docs and app UI). Translate the idea, not the words: reorder clauses, split or merge sentences as a native product writer would, without adding or dropping facts, numbers, conditions or risks.

## Capitalization

Spanish capitalizes far less than English. Generic product terms are lowercase in running text and headings use sentence case: "pool de cobertura", "Pools de cobertura" (title), "puntuación de seguro", "Tu puntuación de seguro", "seguro DeFi". Capitalize only proper names: USD8, Booster (NFT name), Timelock (when it means the contract), Economía White Hat (named program), contract names (Registry, Treasury, DefiInsurance).

## Product terms (English -> Spanish)

Cover Pool -> pool de cobertura (plural: pools de cobertura; short: el pool). Never "fondo de cobertura" (= hedge fund). A named pool: "Pool de cobertura de wstETH" / "de USD8" / "de msLOSS"; in sentences "el {pool}" ("Acerca de tus ganancias en el {pool}").
Insurance Score -> puntuación de seguro (short: "puntuación"; units: "1 punto al día")
Booster -> Booster (plural: Boosters; NFT name, kept in English and capitalized)
Claim (noun) -> reclamación; File a Claim -> Presentar una reclamación; claim for X -> reclamar por X; claimer -> reclamante
Claim window / payout window / settlement window / dispute window -> plazo de reclamación / plazo de indemnización / plazo de liquidación / plazo de impugnación ("plazo", not the literal "ventana")
Payout -> indemnización (Accept Payout -> Aceptar indemnización; Finalize Payouts -> Finalizar las indemnizaciones)
Insured Token -> token asegurado
White Hat Economy -> Economía White Hat
Timelock -> el Timelock (contract); a generic time lock -> un timelock
Cover Pool LP -> LP de los pools de cobertura
Escrow / escrowed -> depósito en garantía / en garantía ("los tokens que tienes en garantía")
Exit queue -> cola de salida; exit epoch -> época de salida
Beta -> beta ("durante la beta")
DeFi Insurance -> seguro DeFi (page title: "Seguro DeFi")
Settle / Settlement -> liquidar / liquidación (settlement root -> raíz de liquidación)
Dispute -> impugnar / impugnación
Bond -> fianza (claim bond -> fianza de reclamación)
Cooldown -> período de espera (Start Cooldown -> Iniciar período de espera)
Withdraw (noun) -> retiro; withdraw (verb) -> retirar
Max coverage -> cobertura máxima; Payout limit -> límite de indemnización
Pool Filled -> Ocupación del pool; deposit cap -> límite de depósitos
Incident -> incidente
Treasury (generic) -> tesorería; Treasury (contract name) -> Treasury
Admin -> administrador
Yield -> rendimiento; Earnings -> ganancias; Rewards -> recompensas
Supply (token) -> suministro
Vault -> vault; Strategy -> estrategia
Mint / Redeem -> acuñar / canjear
Wallet -> billetera
Philosophical Roots -> Raíces filosóficas; Transparency -> Transparencia; System Stats -> Estadísticas del sistema; Timelock Queues -> Colas del Timelock; FAQs -> Preguntas frecuentes; Legal -> Legal
Check (Boosters button) -> Comprobar

## Metrics

APY -> APY (masculine: "el APY"). Kept as the label because it is the standard term in Spanish-language DeFi apps; "TAE" is a Spain-only regulated banking term that would suggest a bank product, and "TEA" varies by country. In prose, "rendimiento" for yield and "APY" for the rate ("El APY puede ser alto").
7D / 30D toggle -> "7 d" / "30 d" (no-break space); "{window} APY" -> "APY a {window}" ("APY a 30 d").
TVL -> TVL (standard in Spanish DeFi).

## Keep in English

USD8, sUSD8, token symbols (USDC, wstETH, aUSDC...), protocol/company names (Aave, Morpho, Chainlink, Brevis, OpenZeppelin...), TEE, APY, TVL, TWAP, LP, NFT, onchain/offchain, trustless, smart contracts, contract and function names (Registry, Treasury, DefiInsurance, endBetaMode), contract table names ("wstETH Cover Pool", "USD8 Price Oracle"), addresses, URLs.

## Typography and grammar

- Numbers from code keep the "." decimal separator (0.3); never localize numbers.
- Percent with a no-break space: "20 %". Ranges with an en dash: "9–12 días". Spanish quotes «».
- Number agreement in composed strings: avoid verbs or adjectives that must agree with a number inserted at runtime ("quedan {minutes}" breaks at 1). Use label forms ("Disponible: {amount}", "Contabilizados: {count}"), noun phrases ("cierre en {minutes} min") or compound subjects ("Quedan {days} y {hours}").
- Durations from lib.json slot into "Período de espera de {length}", "disponibles en {duration}", "tras {duration}".
- Buttons: short verb phrases, ideally 22 characters or fewer ("Rechazar y recuperar tokens" rather than spelling everything out).
- Use "stablecoin" (not "moneda estable") and "hackeo"/"hackear".
- Amounts inserted at runtime go in label form so nothing agrees with the number: "Disponible para retirar: {amount} {symbol}", "En período de espera: {amount} {symbol} (termina en 3 días)", "Retiro estimado: {amount} {symbol}". Score notes keep the "+" first and agree with "puntuación" (always singular): "+{amount} de puntuación disponible en {duration}".
- Cooldown timing (lib cooldown.readyIn/readyNow) describes the cooldown, not the amount: "termina en {count} días" / "ya ha terminado".
- Private-beta boost: English "x300%" / "300% boosted" means 3× the normal rate, not +300 %. Write "x3" (badge) and "al triple de la tasa normal" (prose); never "un 300 % más" or a bare "300 %".
- lib.json also carries "_many" forms (CLDR "many" for es, e.g. 1,000,000): "{count} de días".


## Update: private beta boost

The English source now says "3x for private beta" and "at 3x the normal rate … at the end of the beta". Current wording lives in `src/locales/es/landing.json` (`usd8.flag`) and `notices.json` (`site.message`); it supersedes any "300%"/"x300%" wording above.
