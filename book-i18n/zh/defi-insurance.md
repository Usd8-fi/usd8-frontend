# DeFi保险 {#defi-insurance}

- 持有USD8和sUSD8，每个区块都能获得保险积分
- 保险积分可用于为多种受保DeFi代币申请理赔，USD8和sUSD8本身也在其中
- 积分越多，赔付越多：最高可赔付80%的价值，并以承保池赔付上限为限
- 积分不可转让，永不过期
- 赔付资金来自[承保池](./cover-pools.md)

<div class="example-box">
<p>举例：假设Aave aUSDC是一种受保代币，最高赔付比例为80%</p>
<ol>
<li>aUSDC兑USDC的价格从1跌至0.3</li>
<li>持有保险积分的用户可以交出aUSDC，每个aUSDC最多可从承保池换回价值0.8 USDC的资产</li>
</ol>
</div>

## 理赔流程 {#claim-process}

理赔分为3个步骤，链上与链下（TEE）流程相结合：Beta阶段全程约需9–12天，Beta结束后约需6–9天。请务必留意各个截止时间，不要错过。


### 第1步：申请理赔 {#1-file-a-claim}

满足以下条件时，任何人都可以申请理赔：
1. 某个受保代币相邻两个24小时TWAP价格之间的跌幅超过20%，且下跌发生在过去1–6天内。
2. 申请人持有未使用的保险积分，且这些积分在价格下跌前至少7天就已获得。
3. 申请人在价格下跌前已持有该受保代币至少7天。

申请时还需缴纳10 USD8保证金，只要满足条件2和3即可全额退还。你无需指明价格下跌的时间：我们的TEE会自行找出这次下跌，并精确定位到具体区块。


重要提示：首笔有效理赔提交3天后，理赔窗口即关闭，此后不能再为该受保代币申请理赔。


### 第2步：结算理赔 {#2-settle-claims}
任何人都可以提交TEE出具的证明来结算理赔。TEE使用开源算法计算每位申请人的保险积分和赔付金额，结果完全可验证。

每位申请人的赔付金额取决于：

1. 申请人的保险积分占全部申请人总积分的比例
2. 承保池赔付上限
3. 该受保代币的最高赔付比例

<div class="example-box">
<p>举例：有A、B两位申请人，A有100积分，B有200积分，两人各托管了价值$500的受保代币，最高赔付比例为80%。当前承保池中有价值$2250的资产。</p>
<ol>
<li>承保池赔付上限目前为50%，因此总共可动用$1125，其中80%即$900作为理赔预算。A的积分是B的一半，所以A最多可获赔$300，B最多$600</li>
<li>A和B托管的受保代币都价值$500，按80%的最高赔付比例，两人因损失可获的赔付上限均为$400。</li>
<li>最终A获赔$300，B获赔$400</li>
</ol>
</div>

结算窗口最长开放3天，结算完成后，用户即可确认赔付。如果最终没有结算，申请人可以取回托管的代币，不会消耗任何保险积分。

Beta阶段：结算后管理员还有额外3天时间进行核查，并可提交一份由TEE签名的新结算结果来发起争议。这是一项安全措施，用于防范结算中出现恶意漏洞。


### 第3步：确认赔付 {#3-finalize-payouts}
在这一阶段，申请人有3天时间决定是否接受赔付。如果选择接受，申请人将：

1. 放弃其托管的受保代币和保险积分
2. 获得承保池资产，总美元价值等于应得赔付

如果申请人选择不接受赔付，可以取回托管的代币，并保留保险积分。

无论申请人是否确认赔付，只要满足保证金条件，保证金都会退还。

重要提示：赔付窗口为3天，逾期未处理的理赔一律视为不接受，申请人可以取回托管的代币。

## TEE {#tee}
USD8在链下使用Amazon安全飞地（secure enclave）运行开源算法，计算并签署赔付结果。任何人都可以触发TEE并将结果提交上链，链上合约验证TEE签名后才会接受最终结果。由于算法开源，任何人都可以公开验证结果。

未来我们计划迁移到[Brevis](https://brevis.network/)等zk协处理器网络，以通过[“撤离测试”（walkaway test）](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html)。


## 加成卡 {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="USD8加成卡NFT图案" /><br/><br/>
[加成卡（Booster）](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d)是一种NFT，申请理赔时可以添加，每张可为你的保险积分总额带来1%的加成。符合条件的加成卡会在你接受赔付时销毁，其余的将退还给你。多张加成卡可以叠加。加成卡不对外出售，只铸造给帮助USD8成长的早期用户。欢迎关注我们的[X](https://x.com/usd8_fi)和[Telegram](https://t.me/+e84i2oYk1ao1MTk1)。

输入以太坊地址，查询加成卡

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">查询</button>
<div id="booster-result" class="booster-result"></div>
</div>
