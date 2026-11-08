# USD8 glossary — Simplified Chinese (zh, zh-CN)

English -> 中文 (one rendering per term, used the same way in app strings, docs and injected docs/consent text). Translate the idea, not the words: reorder or merge clauses freely, but keep every fact, number, condition and risk.

## Terms

- APY -> 年化收益率 (prose and standalone labels); short window labels: 7D APY -> 7日年化, 30D APY -> 30日年化; "high APY" -> 高年化/较高的年化收益率
- 7D / 30D -> 7日 / 30日
- TVL -> 总锁仓
- Cover Pool -> 承保池 (e.g. wstETH承保池, USD8承保池)
- Cover Pool LP / depositor -> 承保池LP / 存款人
- Pool Filled (capacity used) -> 容量使用率; deposit cap -> 存款上限; capacity -> 容量
- Insured Token -> 受保代币 (NOT 承保代币: 承保 = the pool's side, 受保 = the covered asset); Insured (yes/no) -> 受保
- Insurance Score -> 保险积分 ("score" alone -> 积分); Available score -> 可用积分; Score Rate -> 积分速率
- Booster -> 加成卡 (boost -> 加成)
- Claim (noun) -> 理赔; file a claim -> 申请理赔; claimer/claimant -> 申请人 / 理赔申请人
- Claim Open (incident phase / table button) -> 开放申请 / 开放申请中 (NOT 理赔进行中, which reads as "a claim is being processed" rather than "you can file now")
- "300% boosted score rate" -> 积分累积速率提升至300% (NOT 300%加成, which reads as +300% = 4x; the flag "x300%" means 3x)
- Payout -> 赔付; finalize payout -> 确认赔付; accept/decline payout -> 接受/放弃赔付
- Reimbursement (simulator) -> 赔付
- Max coverage -> 最高赔付比例; coverage -> 保障 / 保障额度
- Insurance Payout Limit / Cover Pool limit -> 保险赔付上限 / 承保池赔付上限
- Incident -> 理赔事件 ("事件" alone only where the context is already clear)
- Bond / claim bond -> 保证金 / 理赔保证金; anti-spam bond -> 防滥用保证金
- Escrow / escrowed -> 托管 / 已托管; withdraw escrow -> 取回托管资产
- Return tokens -> 取回代币; Cancel claim -> 撤销理赔
- Settle / settlement -> 结算; settlement root -> 结算根; settlement window -> 结算窗口
- Dispute / dispute window -> 争议 / 争议期
- Withdraw -> 提取; Withdraw Earnings -> 提取收益; cooldown -> 冷却期; Start Cooldown -> 开始冷却; in cooldown -> 冷却中
- Exit queue -> 退出队列
- Deposit -> 存入 / 存款
- Mint / Redeem -> 铸造 / 赎回
- Private beta -> 内测 (invitation code -> 内测邀请码); protocol Beta mode (docs, header link) -> Beta / Beta阶段
- Timelock -> 时间锁 (contract name in the address table stays "Timelock"); Timelock Queues -> 时间锁队列
- Admin -> 管理员
- Treasury (yield/revenue) -> 金库 (USD8金库收益); contract name stays "Treasury"; vault -> 金库
- Underlying (asset) -> 底层资产
- Oracle -> 预言机; Strategy -> 策略; Attestation -> 证明
- Stablecoin -> 稳定币; Yield -> 收益
- White Hat Economy -> 白帽经济
- Philosophical Roots -> 理念溯源; Transparency -> 透明度; System Stats -> 系统数据; FAQs -> 常见问题; Legal -> 法律条款 (legal.md itself stays English)

Keep in English: USD8, sUSD8, USDC, wstETH and other token symbols; DeFi (normalise "Defi"), LP, TEE, TWAP, RPC, NFT, zk; protocol/company names (Morpho, Aave, Brevis, OpenZeppelin, Chainlink, Telegram, X, Github); contract/function names (Registry, Treasury, DefiInsurance, endBetaMode); addresses, URLs, code, numbers ('.' decimals, no thousands separators, $500 style amounts).

## Typography (site owner's rule)

- NO space between a Chinese character or full-width punctuation and a Latin word, a digit or a {placeholder}: 持有USD8或sUSD8、最高80%、在{network}上、7天冷却期、$500的受保代币.
- Keep a normal space between two adjacent Latin tokens: 10 USD8、{amount} {symbol}、Aave aUSDC、USDC 1:1.
- Full-width punctuation in Chinese sentences: ，。：；！？、（）“”. Ellipsis …
- Use 你, never 您.
