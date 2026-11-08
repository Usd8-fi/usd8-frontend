# pt-BR translation audit — USD8 site

## 1. Verdict

**READY WITH NOTES** — confidence **high** that a Brazilian crypto user finds it accurate and natural. The translation was already strong: no number, condition, negation or scope errors on money/risk content. Fixes were one terminology slip, two composed strings whose rendered meaning was misleading, ambiguous accessibility labels, and a few small style points.

## 2. Counts

- App strings reviewed: 516 (15 namespaces) + 30 shared strings (UI_TEXT, WIDGET_TEXT, CONSENT_TEXT) — all read against English, plus 8 docs pages read paragraph by paragraph against `book-src/` (including the current uncommitted `cover-pools.md` "Diligence" fix, already reflected).
- Strings changed: 12 (coveredProtocols 2, fileClaim 3, notices 1, transactions 5, landing 1). Shared strings: 0.
- Docs paragraphs/list items changed: 3 (defi-insurance.md 1, faqs.md 1, white-hat-economy.md 1).
- No dropped or added sentences, facts, examples or numbers in the docs.

## 3. CRITICAL / MAJOR issues

No CRITICAL issues.

| Sev | Key / file | Old → New | Why |
|---|---|---|---|
| MAJOR | fileClaim.time.daysHoursLeft, hoursMinutesLeft | "fecha em {days} e {hours}" → "restam {days} e {hours}" (same for hours/minutes) | Completed timeline stages call these with 0/0, which rendered as "Pedidos encerrados — fecha em 0 dias e 0 horas" ("Claims closed — closes in 0 days 0 hours"), a contradiction about a deadline. "restam …" (compound subject, always plural) works for active and completed stages. |
| MAJOR | notices.site.message | "taxa turbinada **em** 300%" → "taxa turbinada **de** 300%"; "no final" → "no fim do beta" | "turbinada em 300%" back-translates as "boosted by 300%" (i.e. 4x), which conflicts with the "x300%" flag. "de 300%" mirrors the English "300% boosted rate". "no final" didn't say *end of what*; English "at the end" means the end of the beta. |
| MAJOR | fileClaim.close.fileClaim; transactions.usd8.closeMint/closeRedeem, pool.closeDeposit/closeWithdraw/closeWithdrawEarnings | "Fechar depósito no {pool}" → "Fechar a janela de depósito no {pool}" (and the same for the other five) | Screen-reader labels for the X button. "Fechar depósito/pedido/saque" can be read as "finalize/place the deposit/claim/withdrawal" in pt-BR. |
| MAJOR (terminology) | coveredProtocols.columns.maxCoverageHelp | "Reembolso máximo …" → "Indenização máxima … O valor efetivamente pago depende …" | The glossary fixes reimbursement/payout = "indenização". Mixing "reembolso" and "indenização" in one tooltip implied two different amounts. |

MINOR changes:
- coveredProtocols.columns.insuredTokenHelp — rewrote the stiff legal phrasing ("pode ser objeto de um pedido") as "Ativo pelo qual é possível pedir indenização…".
- landing.susd8.title "USD8 rendendo" → "USD8 com rendimento".
- defi-insurance.md:25 — "os preços TWAP de 24 h consecutivos … mostraram uma queda" → "o preço TWAP de 24 h de um token segurado caiu mais de 20% entre duas janelas consecutivas, nos últimos 1 a 6 dias". This states "adjacent 24hr TWAP" clearly.
- faqs.md — the score accrues "gera" instead of "rende", so it isn't confused with yield.
- white-hat-economy.md — "Ações judiciais e autoridades policiais" → "Ações judiciais e acionamento das autoridades" (Law Enforcement as an action).

## 4. Back-translation of money-critical strings

| Key | Translation | Literal back-translation | Match |
|---|---|---|---|
| fileClaim.requirement | {symbol} precisa perder mais de 20% do valor em relação ao ativo subjacente, medido pelo preço TWAP imediatamente antes e depois da queda. | {symbol} must lose more than 20% of value relative to the underlying, measured by TWAP price immediately before and after the drop. | yes |
| fileClaim.form.tokenAmountHelp | Você precisa ter mantido {symbol} por, no mínimo, {holding} A elegibilidade considera o seu menor saldo nesse período… Se esse saldo for zero, você não tem direito à indenização e perde a caução do pedido. | You must have held {symbol} for at least {holding} Eligibility considers your lowest balance in that period… If that balance is zero, you have no right to the payout and you lose the claim bond. | yes |
| fileClaim.form.claimBondHelp | Para enviar o pedido, é exigida uma caução antispam de 10 USD8. Ela não é devolvida se você não tiver direito à indenização. | To submit the claim a 10 USD8 anti-spam bond is required. It is not returned if you are not entitled to a payout. | yes |
| fileClaim.form.scoreHelp | …Na liquidação, esse valor é limitado ao seu score disponível, e o score só é gasto se você aceitar uma indenização a que tenha direito. | At settlement it is capped to your available score; score is spent only if you accept a payout you're entitled to. | yes |
| fileClaim.form.boostersHelp | Opcional… Só os Boosters elegíveis aumentam o peso na indenização, e eles são queimados quando você aceita. Os excedentes são devolvidos. Se você recusar, todos são devolvidos. | Optional… Only eligible boosters raise payout weight, burned when you accept. Excess returned. If you decline, all returned. | yes |
| fileClaim.payout.ineligible | Você não tem direito a indenização, e sua caução de {bond} USD8 não será devolvida. Retire seus tokens para encerrar o pedido. | You're not entitled to a payout, and your {bond} USD8 bond won't be returned. Withdraw your tokens to close the claim. | yes |
| fileClaim.metric.bondNotRefunded | Não será devolvida: condições não cumpridas | Will not be returned: conditions not met | yes |
| fileClaim.noClaimInIncident | …O prazo para novos pedidos já fechou, mas a liquidação é aberta: qualquer pessoa pode liquidar. | Filing deadline closed, but settlement is open: anyone can settle. | yes |
| fileClaim.statusDescription.payoutExpired | o prazo de indenização fechou; retire seus tokens em custódia. | payout window closed; withdraw your escrowed tokens. | yes |
| app.pool.cooldownStarted | Período de espera iniciado. Esse valor para de render e pode diminuir se o pool pagar indenizações antes de o seu saque ser concluído. | Waiting period started. This amount stops earning and may decrease if the pool pays claims before your withdrawal completes. | yes |
| transactions.pool.startCooldown | Solicitar saque | Request withdrawal | yes (see §5) |
| transactions.pool.withdrawAvailability | Cotas disponíveis: {amount}. {cooldown}, se não houver pedidos de indenização pendentes; caso contrário, só depois que todos forem finalizados. | Shares available: X. 7-day waiting period, if no pending claims; otherwise only after all are finalized. | yes |
| transactions.pool.mayDecrease | Pode diminuir se o pool pagar indenizações antes de o seu saque ser concluído. | May decrease if the pool pays claims before your withdrawal completes. | yes |
| transactions.exitProgress.waitingForClaims | Período de espera concluído; aguardando a finalização dos pedidos de indenização | Waiting period done; waiting for claims to be finalized | yes |
| landing.coverPools.help | …se um deles cair 20% ou mais e um incidente for aberto, os ativos do pool pagam os pedidos válidos, até uma fração limitada do pool por incidente. Os saques têm período de espera de 7 dias, e os ativos aguardando saque continuam cobrindo pedidos. | …if one drops 20% or more and an incident opens, pool assets pay valid claims, up to a capped share per incident. 7-day waiting period; assets awaiting withdrawal still cover claims. | yes |
| landing.coverPools.warning | …se um token segurado sofrer perdas, os depósitos do pool podem ser usados para pagar indenizações… | …if an insured token suffers losses, pool deposits may be used to pay claims… | yes |
| landing.pool.earningsHelp | Os rendimentos são pagos em USD8, não em {asset}. Eles não ficam expostos a pedidos de indenização e podem ser sacados a qualquer momento. | Earnings paid in USD8, not {asset}. Not exposed to claims; withdrawable anytime. | yes |
| landing.claims.availableHelp | O score fica disponível para uso após {duration}, descontado o que você já usou em pedidos de indenização. | Score becomes usable after {duration}, minus what you already used on claims. | yes |
| coveredProtocols.columns.maxCoverageHelp | Indenização máxima definida hoje onchain para cada token listado. O valor efetivamente pago depende do score… e dos limites dos pools de cobertura. | Max payout currently set onchain per token. Amount actually paid depends on score and cover pool limits. | yes (fixed) |
| simulateClaim.intro | …A liquidação recalcula tudo no TEE, então o valor final pode ser diferente. | Settlement recalculates everything in the TEE, so the final amount may differ. | yes |
| lib.pool.depositsPausedForIncident | Os depósitos ficam temporariamente indisponíveis enquanto o incidente de seguro #{incident} estiver ativo… | Deposits are temporarily unavailable while incident #N is active… | yes |
| docs cover-pools §Saque | …pode ser solicitado a qualquer momento em que não haja pedidos ativos… pausado… mais 9–12 dias durante o beta (6–9 depois)… ativos em período de espera continuam expostos… | Same facts, numbers and caveats | yes |
| docs cover-pools §Limite | …limitada a 50% do tamanho atual do pool de cobertura | capped at 50% of current pool size | yes |
| docs defi-insurance §1 | caução de 10 USD8, devolvida integralmente se as condições 2 e 3 forem cumpridas; prazo fecha 3 dias após o primeiro pedido válido | Same | yes |
| docs defi-insurance §2 example | US$ 2250 → 50% = US$ 1125 → 80% = US$ 900; A até US$ 300, B até US$ 600; teto US$ 400; A recebe 300, B 400 | Same numbers | yes |
| docs faqs §money | 20% do que sobra das indenizações… no máximo 80% de cobertura, os 20% restantes ficam com o USD8 como taxa | Same | yes |
| shared CONSENT_TEXT.message | …Só carregamos as ferramentas de análise depois que você aceita, e recusar não afeta o funcionamento do app. | Analytics load only after you accept; rejecting doesn't affect the app. | yes |

## 5. Term decisions (reviewed; none changed)

- **APY / TVL / 7D / 30D kept in English** — agreed. Brazilian exchanges and DeFi front ends (Binance BR, Mercado Bitcoin, Foxbit) show "APY"; "% a.a." reads as fixed income. 7D/30D are the usual chart toggles and match "D+30" banking usage.
- **"Solicitar saque" for Start Cooldown** — agreed over "Iniciar período de espera": it's the familiar Brazilian two-step pattern (request a withdrawal, then withdraw), and it's as short as the English (15 vs 14 characters; the alternative is 1.8x). Risk check: nothing nearby suggests funds leave immediately. The same dialog shows "Período de espera de 7 dias, se não houver pedidos…", the success toast says the amount stops earning and may decrease, and the confirm prompt says "Confirme a solicitação de saque".
- **"pedido de indenização" for claim** — agreed. It's the standard pt-BR insurer wording ("sinistro" is the loss event; "reivindicação" is a calque). It's used consistently across app, docs and shared strings.
- **"caução" for bond** — agreed. It's the standard term for a refundable guarantee deposit, and feminine agreement is correct everywhere ("devolvida", "não será devolvida").
- Glossary additions (composed-string notes only): the time-left label pattern, "Fechar a janela de …" for close labels, and the 300% wording.

## 6. Left for human judgement

- `landing.yieldIllustration.smallPool` = "pool pequeno" leaves out "capped" because the SVG text is about 88 px wide. "pool pequeno e limitado" would overflow.
- "Imposição da ordem" (order enforcement, philosophy/white-hat pages) is faithful but a bit academic. "Garantia da ordem" is a softer alternative if the owner prefers.
- The English itself is inconsistent: ">= 20%" (cover-pools docs, landing help) vs "more than 20%" (app requirement, claims intro). The translation mirrors each source string as written.
