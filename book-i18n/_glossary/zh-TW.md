# USD8 glossary — Traditional Chinese, Taiwan (zh-TW)

English -> 繁體中文（台灣）. One rendering per term, used the same way in app strings (`src/locales/zh-TW`), docs (`book-i18n/zh-TW`) and the injected docs/consent text (`_review/zh-TW-shared.json` → docs-theme.js / analytics.js). Write it the way a Taiwanese DeFi product writer would: translate the idea, reorder or merge clauses freely, but keep every fact, number, condition and risk. Seeded from the reviewed zh text with OpenCC s2twp, then rewritten for Taiwan usage (see "Avoid" below).

## Terms

- APY -> 年化報酬率 (prose, help text, loading labels); short labels: 7D APY -> 7日年化, 30D APY -> 30日年化; "high APY" -> 高年化 / 較高的年化報酬率
- 7D / 30D -> 7日 / 30日
- TVL -> 總鎖倉價值
- Cover Pool -> 承保池 (wstETH承保池, USD8承保池)
- Cover Pool LP / depositor -> 承保池LP / 存款人
- Pool Filled -> 容量使用率; deposit cap -> 存款上限; capacity -> 容量
- Insured Token -> 受保代幣 (受保 = the covered asset; 承保 = the pool's side); Insured (yes/no) -> 受保
- Insurance Score -> 保險積分 ("score" alone -> 積分); Available score -> 可用積分; Score Rate -> 積分速率
- Booster -> 加成卡 (boost -> 加成); Check Boosters -> 查詢加成卡
- Claim (noun) -> 理賠; file a claim -> 申請理賠; claimant -> 申請人
- Claim Open (incident phase / table button) -> 開放申請 / 開放申請中
- "300% boosted score rate" -> 積分累積速率提升至300% (NOT 300%加成, which reads as +300% = 4x; the flag "x300%" means 3x)
- Payout (money received) -> 理賠金; payout as a process/stage -> 給付; finalize payout -> 確認理賠金; accept / decline payout -> 接受 / 放棄理賠金; Reimbursement (simulator) -> 理賠金 (預估理賠金)
- Max coverage -> 最高理賠比例; coverage -> 保障 / 保障額度
- Insurance Payout Limit / Cover Pool limit -> 保險理賠上限 / 承保池理賠上限
- Incident -> 理賠事件 (counter: 一起/每起理賠事件)
- Bond / claim bond -> 保證金 / 理賠保證金; anti-spam bond -> 防濫用保證金; pay a bond -> 繳交
- Escrow / escrowed -> 託管 / 已託管; withdraw escrow -> 取回託管的資產
- Return tokens -> 取回代幣; Cancel claim -> 撤銷理賠
- Finalized (claims) -> 結案 (理賠結案, 未結案理賠); finalized block -> 最終確認區塊
- Settle / settlement -> 結算; settlement root -> 結算根
- Time windows -> 期 / 期間, never 視窗: claim window -> 申請期; settlement window -> 結算期; payout window -> 理賠金領取期; dispute window -> 爭議期; holding window -> 持有期間 (視窗 only for UI dialogs: 關閉…視窗)
- Withdraw -> 提領; Withdraw Earnings -> 提領收益; cooldown -> 冷卻期; Start Cooldown -> 開始冷卻; in cooldown -> 冷卻中
- Exit queue -> 退出佇列
- Deposit -> 存入 (action) / 存款 (balance)
- Mint / Redeem -> 鑄造 / 贖回; approve (token) -> 授權
- Connect / disconnect wallet -> 連接錢包 / 中斷連接; account -> 帳戶
- Private beta -> 封測 / 封閉測試 (invitation code -> 封測邀請碼); protocol Beta mode (docs, header link) -> Beta / Beta階段
- Timelock -> 時間鎖 (contract name in the address table stays "Timelock"); Timelock Queues -> 時間鎖佇列; schedule -> 排程
- Admin -> 管理員; permissions -> 權限
- Treasury (yield/revenue) -> 金庫 (USD8金庫收益); contract name stays "Treasury"; vault -> 金庫
- Underlying (asset) -> 底層資產
- Oracle -> 預言機; Strategy -> 策略; Attestation -> 證明; signer -> 簽署者; signature -> 簽章
- Audit -> 稽核 (Audit Report -> 稽核報告); vet -> 審核 / 審查
- Stablecoin -> 穩定幣; Yield -> 收益; position -> 部位
- Parameters -> 參數; configure -> 設定; real-time -> 即時; detect -> 偵測; timeout -> 逾時; response -> 回應
- Game theory -> 賽局理論; incentives -> 誘因 (激勵 for "激勵設計")
- White Hat Economy -> 白帽經濟
- Philosophical Roots -> 理念溯源; Transparency -> 透明度; System Stats -> 系統資訊; FAQs -> 常見問題; Legal -> 法律條款 (legal.md itself stays English); Docs -> 文件; App -> 應用程式
- Privacy notice -> 隱私權聲明; Risk Disclaimer -> 風險聲明
- People: Sir Thomas Gresham -> 湯瑪斯·格雷欣爵士; Murray Rothbard -> 莫瑞·羅斯巴德

Keep in English: USD8, sUSD8, USDC, wstETH and other token symbols; DeFi (normalise "Defi"), LP, TEE, TWAP, RPC, NFT, zk, Cookie; protocol/company names (Morpho, Aave, Brevis, OpenZeppelin, Chainlink, Telegram, X, Github, Google Analytics); contract/function names (Registry, Treasury, DefiInsurance, endBetaMode); addresses, URLs, code, numbers ('.' decimals, no thousands separators, $500 style amounts).

## Avoid (mainland wording OpenCC leaves behind)

賬戶/到賬 -> 帳戶/入帳; 獲取 -> 取得; 當前 -> 目前; 實時 -> 即時; 檢測 -> 偵測; 超時 -> 逾時; 響應 -> 回應; 配置 -> 設定; 引數 -> 參數; 許可權 -> 權限; 型別 -> 類型; 上鍊 -> 上鏈; 天后 -> 天後; 銷燬 -> 銷毀; 審計 -> 稽核; 渠道 -> 管道; 郵箱 -> 電子郵件; 倉庫 -> 儲存庫; 運營 -> 營運; 市場營銷 -> 行銷; 合作伙伴 -> 合作夥伴; 博弈論 -> 賽局理論; 倉位 -> 部位; 舉報 -> 檢舉; 私信 -> 私訊; 反饋 -> 意見; 彈窗 -> 視窗; 滑塊 -> 滑桿; 宣告 (disclaimer) -> 聲明; 盈利 -> 獲利; 完結 -> 結案; 可選 -> 選填/選用; 暫無 -> 目前沒有; 視窗 (time window) -> 期; 簽名 (TEE) -> 簽章/簽署.

## Typography (site owner's rule)

- NO space between a Chinese character or full-width punctuation and a Latin word, a digit or a {placeholder}: 持有USD8或sUSD8、最高80%、在{network}上、7天冷卻期、$500的受保代幣.
- Keep a normal space between two adjacent Latin tokens: 10 USD8、{amount} {symbol}、Aave aUSDC、USDC 1:1.
- Full-width punctuation in Chinese sentences: ，。：；！？、（）; Taiwan quotes 「」 (nested 『』), never “”. Ellipsis …; slash between Chinese words -> ／.
- Use 你 throughout (the brand voice is direct and casual; the zh version uses 你 too), never 您.
