<h1 id="faqs" class="faq-title">常见问题</h1>

## 持有USD8和sUSD8就能获得免费保险？ {#so-i-get-free-insurance-from-usd8--susd8}

是的，这正是USD8相比其他稳定币的优势。你每个区块都会获得保险积分，持有USD8/sUSD8越多、越久，获得的积分就越多。

不同代币的积分累积速度不同：目前每1 USD8每天可获得1积分，每1 sUSD8每天可获得0.1积分。


## 保险赔付的资金从哪里来？ {#where-does-the-insurance-payout-come-from}

赔付资金来自[承保池](./cover-pools.md)，即任何人都可以存入的开放式代币金库。目前共有两个：[一个存放wstETH，一个存放USD8](https://usd8.fi/#cover-pools)。

存款人可获得较高的年化收益率，资金来自USD8金库收益。但如果某个受保代币相对其底层资产下跌超过20%，他们的存款可能被用于支付理赔，每次理赔事件最多可动用每个承保池余额的50%。高风险，高回报。


## 保险积分什么时候可以用来申请理赔？ {#when-can-i-use-my-insurance-score-for-a-claim}

保险积分获得7天后才会变为可用，只有可用积分才能用于理赔。
  
## 我以前持有USD8，现在没有了，还受保障吗？ {#i-had-usd8-before-but-not-now-am-i-still-insured}

是的。你应该已经积累了一些保险积分，而积分永不过期。只要积分获得已满7天，就可以用来申请理赔。

## 我能获得多少赔付？ {#how-much-payout-do-i-get}

取决于两点：1. 你的保险积分与同期其他申请人的对比；2. 承保池的规模上限。

保险积分越多，你的理赔权重就越高。赔付最高为损失价值的80%；如果积分较少，实际赔付可能低于这一比例。不过，若最终赔付太低，你随时可以选择不接受，保留保险积分留待日后使用。



## 申请理赔需要准备什么？ {#whats-needed-when-filing-a-claim}

- 你要申请理赔的受保代币
- 保险积分
- 10 USD8保证金，若符合理赔条件，理赔结束后退还
- 加成卡（可选）




## 如何降低承保池LP的风险？ {#how-do-you-reduce-the-cover-pool-lp-risk}

承保池资产可能被用于支付理赔，风险更高，因此年化收益率也更高。为降低承保池风险，我们的团队会：
- 在为每个协议提供保险前独立审查
- 审阅每个协议的第三方审计报告
- 持续监控，并据此调整或撤销对各协议的保障

理赔预计不会经常发生，但可能性始终存在。



## Beta阶段有什么不同？ {#whats-different-in-beta}
Beta阶段设有一些安全“辅助轮”，我们计划在Beta结束后移除。Beta期间，管理员/时间锁拥有特殊权限：
- 管理员或时间锁可以提交新的结算根，对某次理赔事件的赔付结算提出争议。这也让理赔流程多出3天争议期，Beta结束后将取消。
- 时间锁可以升级Registry、USD8、Treasury和DefiInsurance合约；我们计划在Beta结束后移除可升级性。


## USD8有治理代币吗？ {#does-usd8-has-a-governance-token}
目前没有。

## USD8有哪些风险？能全部列出来吗？ {#show-all-the-risk-involved-in-usd8}
当然，请参阅[透明度](./transparency.md)。

## USD8如何盈利？ {#how-does-usd8-make-money}
USD8有多种收入来源：
- 部分USD8金库收益
- 赔付剩余的20%：申请人最多只能获得80%的赔付，剩下的20%即为USD8的费用
- 通过[白帽经济](white-hat-economy.md)追回的部分损失


## 如何为USD8做贡献？ {#how-can-i-contribute-to-usd8}

我们欢迎社区在机制设计、合作拓展、市场营销等各方面贡献力量。如有提案、批评或想法，请[在usd8-core仓库提交issue](https://github.com/Usd8-fi/usd8-core/issues)，或加入我们的[Telegram群组](https://t.me/+e84i2oYk1ao1MTk1)与团队交流。贡献者有机会获得[加成卡](defi-insurance.md#boosters)。

  
  

## USD8由谁打造？ {#who-is-behind-usd8}

USD8由[@codephobic](https://x.com/codephobic)打造。他是一名安全研究员，拥有7年以上审计顶级DeFi协议和L2的经验。
  
