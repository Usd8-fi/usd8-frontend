# 承保池 {#cover-pools}

承保池是公開的金庫，任何人都可以隨時存入與提領。每個承保池：

- 只接受特定一種代幣存入，例如wstETH
- 以USD8發放年化收益，資金來自USD8的金庫收益
- 設有規模上限

<div class="example-box">
  警告：一旦有受保代幣價格下跌20%或以上，承保池資產將被用來支付理賠。
</div>


## 受保代幣 {#insured-tokens}

受保代幣都經過審慎評估與篩選，並會持續調整。USD8認可以下機構出具的獨立安全稽核或認證：

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Security Alliance的SEAL認證](https://frameworks.securityalliance.dev/certs/overview/) 


## 提領 {#withdraw}

提領須經過7天冷卻期，只要沒有進行中的理賠，隨時都可以申請。

若冷卻期間出現新的理賠，提領流程會暫停，直到該理賠事件處理完畢。從第一筆理賠起算，可能還需要9–12天（Beta階段；Beta結束後為6–9天）。這段期間，所有處於冷卻期的資產仍須承擔理賠給付。

冷卻中的資產不產生收益，但仍為理賠提供保障。冷卻期結束後，資產可隨時提領，之後既不再承擔理賠，也不再產生收益。


## 保險理賠上限 {#insurance-payout-limit}

每起理賠事件從承保池給付的理賠總額設有上限，目前為50%，也就是單一事件的理賠給付最多不超過承保池當下規模的50%。
