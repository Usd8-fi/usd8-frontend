# DeFi保險 {#defi-insurance}

- 持有USD8與sUSD8，每個區塊都能獲得保險積分
- 保險積分可用來為多種受保DeFi代幣申請理賠，也包括USD8和sUSD8本身
- 積分越多，理賠金越多：最高可獲賠價值的80%，並以承保池理賠上限為限
- 積分不可轉讓，也永不過期
- 理賠金來自[承保池](./cover-pools.md)

<div class="example-box">
<p>舉例：假設Aave aUSDC是受保代幣，最高理賠比例為80%</p>
<ol>
<li>aUSDC兌USDC的價格從1跌到0.3</li>
<li>持有保險積分的使用者可以交出aUSDC，每個aUSDC最多可從承保池換回價值0.8 USDC的資產</li>
</ol>
</div>

## 理賠流程 {#claim-process}

理賠分為3個步驟，結合鏈上與鏈下（TEE）流程：Beta階段全程約需9–12天，Beta結束後約需6–9天。請務必留意每個截止時間，以免錯過。


### 第1步：申請理賠 {#1-file-a-claim}

符合以下條件時，任何人都可以申請理賠：
1. 某個受保代幣相鄰兩個24小時TWAP價格之間的跌幅超過20%，且下跌發生在過去1–6天內。
2. 申請人持有尚未使用的保險積分，且這些積分在價格下跌前至少7天就已取得。
3. 申請人在價格下跌前已持有該受保代幣至少7天。

申請時另須繳交10 USD8保證金，只要符合條件2和3就會全額退還。你不必指出價格是何時下跌的：我們的TEE會自行找出這次下跌，並精確定位到發生的區塊。


重要提示：第一筆有效理賠送出3天後，申請期即告結束，之後就不能再為該受保代幣申請理賠。


### 第2步：結算理賠 {#2-settle-claims}
任何人都可以送出TEE出具的證明來結算理賠。TEE以開源演算法計算每位申請人的保險積分與理賠金，結果完全可驗證。

每位申請人的理賠金取決於：

1. 申請人的保險積分佔所有申請人總積分的比例
2. 承保池理賠上限
3. 該受保代幣的最高理賠比例

<div class="example-box">
<p>舉例：有A、B兩位申請人，A有100積分，B有200積分，兩人各託管了價值$500的受保代幣，最高理賠比例為80%。目前承保池中有價值$2250的資產。</p>
<ol>
<li>承保池理賠上限目前設為50%，因此總共可動用$1125，其中的80%（也就是$900）作為理賠預算。A的積分是B的一半，所以A最多可獲賠$300，B最多$600</li>
<li>A和B託管的受保代幣都價值$500，以80%的最高理賠比例計算，兩人的損失理賠上限都是$400。</li>
<li>最後A獲賠$300，B獲賠$400</li>
</ol>
</div>

結算期最長3天，一旦完成結算，使用者就可以確認理賠金。若始終沒有人結算，申請人可以取回託管的代幣，不會消耗任何保險積分。

Beta階段：結算完成後，管理員還有額外3天可以核查，並可提交一份由TEE簽署的新結算結果來提出爭議。這是一項安全措施，用來防範結算中出現惡意漏洞。


### 第3步：確認理賠金 {#3-finalize-payouts}
在這個階段，申請人有3天時間決定是否接受理賠金。若選擇接受，申請人將：

1. 交出託管的受保代幣與保險積分
2. 獲得承保池資產，總美元價值等於應得的理賠金

若申請人選擇不接受，可以取回託管的代幣，並保留保險積分。

無論申請人是否確認理賠金，只要符合保證金條件，保證金都會退還。

重要提示：理賠金領取期為3天，逾期未處理的理賠一律視為不接受，申請人可以取回託管的代幣。

## TEE {#tee}
USD8在鏈下使用Amazon的安全隔離環境（secure enclave）執行開源演算法，計算並簽署理賠結果。任何人都可以觸發TEE並把結果送上鏈，鏈上合約會先驗證TEE的簽章，才接受最終結果。由於演算法開源，任何人都能公開驗證結果。

未來我們計劃改用[Brevis](https://brevis.network/)等zk協處理器網路，以通過[「撤離測試」（walkaway test）](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html)。


## 加成卡 {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="USD8加成卡NFT圖案" /><br/><br/>
[加成卡（Booster）](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d)是一種NFT，申請理賠時可以加入，每張可讓你的保險積分總額提高1%。符合條件的加成卡會在你接受理賠金時銷毀，其餘的會退還給你。多張加成卡可以疊加。加成卡不對外販售，只會鑄造給協助USD8成長的早期使用者。歡迎追蹤我們的[X](https://x.com/usd8_fi)和[Telegram](https://t.me/+e84i2oYk1ao1MTk1)。

輸入以太坊地址，查詢加成卡

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">查詢</button>
<div id="booster-result" class="booster-result"></div>
</div>
