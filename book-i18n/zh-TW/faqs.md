<h1 id="faqs" class="faq-title">常見問題</h1>

## 持有USD8和sUSD8就能獲得免費保險？ {#so-i-get-free-insurance-from-usd8--susd8}

沒錯，這正是USD8相較於其他穩定幣的優勢。你每個區塊都會獲得保險積分，持有USD8/sUSD8越多、越久，累積的積分就越多。

不同代幣的積分累積速度不同：目前每1 USD8每天可獲得1積分，每1 sUSD8每天可獲得0.1積分。


## 保險理賠金從哪裡來？ {#where-does-the-insurance-payout-come-from}

理賠金來自[承保池](./cover-pools.md)，也就是任何人都能存入的開放式代幣金庫。目前共有兩個：[一個存放wstETH，一個存放USD8](https://usd8.fi/#cover-pools)。

存款人可獲得較高的年化報酬率，資金來自USD8金庫收益。但若某個受保代幣相對其底層資產下跌超過20%，他們的存款可能會被用來支付理賠，每起理賠事件最多可動用每個承保池餘額的50%。高風險，高報酬。


## 保險積分什麼時候可以用來申請理賠？ {#when-can-i-use-my-insurance-score-for-a-claim}

保險積分在獲得7天後才會轉為可用積分，只有可用積分才能用於理賠。
  
## 我以前持有USD8，現在沒有了，還有保障嗎？ {#i-had-usd8-before-but-not-now-am-i-still-insured}

有的。你應該已經累積了一些保險積分，而積分永不過期。只要積分取得滿7天，就可以用來申請理賠。

## 我能拿到多少理賠金？ {#how-much-payout-do-i-get}

取決於兩點：1. 你的保險積分與同期其他申請人相比如何；2. 承保池的規模上限。

保險積分越多，你的理賠權重就越高。理賠金最高為損失價值的80%；如果積分較少，實際拿到的可能低於這個比例。不過，若最後的理賠金太低，你隨時可以選擇不接受，把保險積分留到日後使用。



## 申請理賠需要準備什麼？ {#whats-needed-when-filing-a-claim}

- 你要申請理賠的受保代幣
- 保險積分
- 10 USD8保證金，若符合理賠資格，理賠結束後退還
- 加成卡（選用）




## 如何降低承保池LP的風險？ {#how-do-you-reduce-the-cover-pool-lp-risk}

承保池資產可能被用來支付理賠，風險較高，因此年化報酬率也較高。為了降低承保池的風險，我們的團隊會：
- 在為每個協議提供保險前進行獨立審查
- 審閱每個協議的第三方稽核報告
- 持續監控，並據此調整或撤銷對各協議的保障

理賠預期不會經常發生，但可能性始終存在。



## Beta階段有什麼不同？ {#whats-different-in-beta}
Beta階段設有一些安全「輔助輪」，我們計劃在Beta結束後移除。Beta期間，管理員／時間鎖擁有特殊權限：
- 管理員或時間鎖可以提交新的結算根，對某起理賠事件的理賠結算提出爭議。這也讓理賠流程多出3天爭議期，Beta結束後將取消。
- 時間鎖可以升級Registry、USD8、Treasury和DefiInsurance合約；我們計劃在Beta結束後移除可升級性。


## USD8有治理代幣嗎？ {#does-usd8-has-a-governance-token}
目前沒有。

## USD8有哪些風險？能全部列出來嗎？ {#show-all-the-risk-involved-in-usd8}
當然，請參閱[透明度](./transparency.md)。

## USD8如何獲利？ {#how-does-usd8-make-money}
USD8有幾種收入來源：
- 部分USD8金庫收益
- 理賠剩下的20%：申請人最多只能獲得80%的理賠，剩下的20%就是USD8的費用
- 透過[白帽經濟](white-hat-economy.md)追回的部分損失


## 如何為USD8做出貢獻？ {#how-can-i-contribute-to-usd8}

我們歡迎社群在機制設計、合作拓展、行銷等各方面貢獻心力。如有提案、批評或想法，歡迎[在usd8-core儲存庫開issue](https://github.com/Usd8-fi/usd8-core/issues)，或加入我們的[Telegram群組](https://t.me/+e84i2oYk1ao1MTk1)與團隊討論。貢獻者有機會獲得[加成卡](defi-insurance.md#boosters)。

  
  

## USD8由誰打造？ {#who-is-behind-usd8}

USD8由[@codephobic](https://x.com/codephobic)打造。他是一名安全研究員，擁有7年以上稽核頂尖DeFi協議與L2的經驗。
