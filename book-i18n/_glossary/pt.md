# Brazilian Portuguese (pt, pt-BR) glossary — USD8 docs + app UI

Style: Brazilian Portuguese, "você" throughout, informal but precise product voice (like Nubank / Mercado Bitcoin). Translated by meaning, not word for word: clauses may be reordered, sentences merged or split; facts, numbers, conditions and risk caveats stay identical. Sentence case in labels and headings ("Conectar carteira", "Pools de cobertura"); capitalize only proper names. One rendering per term across app strings, docs and injected widget/consent text.

Keep in English: USD8, sUSD8, token symbols (USDC, wstETH, aUSDC …), protocol/company names (Aave, Morpho, Chainlink, Brevis, OpenZeppelin, Github, Telegram, X), TEE, TWAP, RPC, LP, NFT, APY, TVL, onchain/offchain, trustless, smart contracts, contract and function names (Registry, Treasury, DefiInsurance, endBetaMode), contract labels in the Addresses table ("wstETH Cover Pool", "USD8 Price Oracle" — timelock-queue.js reads them), addresses, URLs, code.

Typography: numbers come from code and keep English formatting (0.3, never 0,3). Percent without a space ("20%", Brazilian convention). Ranges with an en dash ("9–12 dias"). Dollar amounts in docs prose: "US$ 500" (Brazilian convention; a bare "$" can be read as R$). Straight double quotes in docs.

## Key decisions

- **APY → "APY"** (masculine, "o APY"). Brazilian crypto apps and media (Binance, Mercado Bitcoin, Foxbit, InfoMoney cripto) show APY/APR untranslated; the banking form "% a.a." / "rentabilidade ao ano" would look like a fixed-income product and does not combine with the 7D/30D window. Prose about the money itself uses "rendimento".
- **7D / 30D → "7D" / "30D"**: D reads naturally as "dias" in Portuguese (cf. "D+1", "D+30" in Brazilian banking) and Brazilian chart toggles use 7D/30D; kept short for the toggle buttons. Single label: "APY 30D".
- **TVL → "TVL"**: standard in Brazilian DeFi; no short native equivalent ("valor total bloqueado" only as an explanation).
- **Claim → "pedido de indenização"** (short "pedido"); file a claim → "pedir indenização" (button "Pedir indenização"). "Sinistro" is the loss event in Brazilian insurance, and would clash with "incidente"; "reivindicação" is a calque. "Pedir/solicitar indenização" is how Brazilian insurers phrase it.
- **Payout → "indenização"**: the Brazilian insurance term for the amount paid out. Reimbursement (simulator) also "indenização" for consistency.
- **Insurance Score → "score de seguro"** (short "score", masculine): Brazilians know "score" from Serasa/credit score; "pontuação" sounds like a loyalty programme. Fixed quantities in prose: "1 ponto de score por dia".
- **Cover Pool → "pool de cobertura"** (masculine, pl. "pools de cobertura"); named pools "Pool de cobertura de wstETH". "Pool" is standard Brazilian crypto vocabulary (pool de liquidez); never "fundo de cobertura" (= hedge fund). In the tiny SVG box of the APY tooltip the pool target is just "Pool" (the full term does not fit 84 px).
- **Cooldown → "período de espera"**; the "Start Cooldown" button is **"Solicitar saque"** — how Brazilians describe the step that starts the wait (request withdrawal, then withdraw); the adjacent text names the "Período de espera de 7 dias". In cooldown → "em período de espera"; ready → "saque liberado".
- **Withdraw → "sacar" / "saque"**; withdraw escrow / return tokens → "retirar (os tokens em custódia)" / button "Retirar tokens" ("devolver" would read as the user giving tokens away).
- **Bond → "caução"** (feminine): the Brazilian term for a refundable guarantee deposit.
- **Escrow → "custódia" / "em custódia"**.
- **Score maturity / holding period (landing) → "período de carência"**: exactly the Brazilian insurance term for the wait before cover can be used.
- **Booster, Timelock, White Hat (Economia White Hat)** stay as proper names.

| English | Português (Brasil) |
| --- | --- |
| Cover Pool / Cover Pools | pool de cobertura / pools de cobertura (o pool) |
| Cover Pool limit | limite do pool de cobertura |
| Cover Pool LP | LP dos pools de cobertura (pl. LPs) |
| Insurance Score | score de seguro (short: score) |
| Score to spend | score de seguro a usar |
| Available score | score disponível |
| Score Rate | taxa de score ("{rate} por USD8 por dia") |
| Score Weight | peso do score |
| Booster / Boosters | Booster / Boosters |
| Claim (noun) | pedido de indenização (short: pedido) |
| File a claim | pedir indenização |
| Simulate claim | simular indenização |
| Cancel claim | cancelar pedido |
| Claimer / claimant | solicitante |
| Claim window | prazo para pedidos |
| Claim Open / Closed (stage) | Pedidos abertos / Pedidos encerrados |
| Claim bond | caução do pedido |
| Claim verification service | serviço de verificação de pedidos |
| Settle / Settlement | liquidar / liquidação (settlement root: raiz de liquidação) |
| Settlement window | prazo de liquidação |
| Dispute / dispute window | contestar / prazo de contestação |
| Payout | indenização |
| Finalize payout | concluir indenização |
| Accept / decline payout | aceitar / recusar indenização |
| Payout window | prazo de indenização |
| Insurance Payout Limit | limite de indenização do seguro |
| Reimbursement | indenização |
| Loss cap | teto de cobertura |
| Loss value | valor da perda |
| Max coverage | cobertura máxima (column: Cobertura máx.) |
| Insured Token | token segurado |
| Insured (yes/no) | Segurado — "SIM, com limites" |
| Incident | incidente |
| Holding requirement / window | requisito de posse / período de posse |
| Holding period (score) | período de carência |
| Bond | caução |
| Escrow / escrowed | custódia / em custódia |
| Forfeit | abrir mão de / perder (bond) |
| Return tokens | retirar tokens |
| Withdraw / withdrawal | sacar / saque |
| Withdraw Earnings | sacar rendimentos |
| Cooldown | período de espera |
| Start Cooldown (button) | Solicitar saque |
| Exit queue | fila de saída |
| Deposit / deposit cap | depositar, depósito / limite de depósito |
| Pool Filled | ocupação do pool |
| Shares | cotas |
| Earnings / rewards | rendimentos |
| Yield | rendimento |
| Treasury (generic) / contract | tesouraria / Treasury |
| Balance | saldo |
| Amount | quantidade (tokens) / valor (money) |
| Approve | aprovar / aprovação |
| Mint / Redeem | emitir / resgatar (emissão / resgate) |
| Redemption quote | cotação de resgate |
| Backed 1:1 by USDC | lastreado 1:1 em USDC (lastro) |
| Supply | oferta |
| Underlying asset | ativo subjacente |
| Vault | vault (o vault) |
| Wallet / Connect Wallet | carteira / Conectar carteira |
| Stablecoin | stablecoin (a stablecoin) |
| Hack / hacker | hack / hacker |
| White Hat Economy | Economia White Hat |
| Order enforcement | imposição da ordem |
| Distressed debt | dívidas estressadas |
| Timelock / Timelock Queues | Timelock / Filas do Timelock |
| Admin | admin |
| Private beta / during beta | beta privado / durante o beta (o beta) |
| Oracle | oráculo |
| Attestation | atestação |
| Strategy | estratégia |
| Upgrade | upgrade (fazer upgrade) |
| DeFi Insurance | seguro DeFi (title: Seguro DeFi) |
| Philosophical Roots | Raízes filosóficas |
| Transparency | Transparência |
| System Stats | Estatísticas do sistema |
| FAQs | Perguntas frequentes |
| Legal | Jurídico (legal.md itself stays English) |
| Docs | Documentação |
| Check (Booster button) | Verificar |
| Retry | Tentar novamente / Recarregar (score, data) |

## Composed strings

- Avoid verbs/adjectives that must agree with a runtime number: label forms ("Disponível: {amount}", "Considerados: {count}", "Disponível para saque: {amount} {symbol}") and impersonal phrases ("fecha em {minutes}", "executável em {n} h").
- lib.json durations ("7 dias", "1 hora") slot into "disponível em {duration}", "após {duration}", "Período de espera de {length}"; pt-BR plural categories are one/many/other ("many" = millions, written like "other").
- Claim timeline time-left labels (fileClaim.time.*): "restam {days} e {hours}" / "restam {hours} e {minutes}" (compound subject, always plural; also reads correctly as "restam 0 dias e 0 horas" under completed stages, where "fecha em …" contradicted "Pedidos encerrados"); minutes-only "fecha em {minutes}" (active window only, avoids "resta/restam 1 minuto" agreement).
- Dialog close-button aria labels say "Fechar a janela de …" ("Fechar depósito/pedido" reads as "finalize the deposit/claim" in Brazilian Portuguese).
- "300% boosted rate" (beta notice) → "taxa turbinada de 300%" (mirrors the English and the "x300%" flag; "turbinada em 300%" would mean +300%, i.e. 4x).
- fileClaim.holdingRequirement.* ends with a full stop and is followed by a space in tokenAmountHelp/boostersHelp ("por, no mínimo, {holding} A elegibilidade …").


## Update: private beta boost

The English source now says "3x for private beta" and "at 3x the normal rate … at the end of the beta". Current wording lives in `src/locales/pt/landing.json` (`usd8.flag`) and `notices.json` (`site.message`); it supersedes any "300%"/"x300%" wording above.
