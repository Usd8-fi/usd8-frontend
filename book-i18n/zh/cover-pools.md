# 承保池 {#cover-pools}

承保池是公开的金库，任何人都可以随时存入和提取。每个承保池：

- 只接受某一种代币存入，例如wstETH
- 以USD8发放年化收益，资金来自USD8的金库收益
- 设有规模上限

<div class="example-box">
  警告：一旦有受保代币价格下跌20%或以上，承保池资产将被用于支付理赔。
</div>


## 受保代币 {#insured-tokens}

受保代币均经过审慎评估和筛选，并会持续调整。USD8认可以下机构出具的独立安全审计或认证：

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Security Alliance的SEAL认证](https://frameworks.securityalliance.dev/certs/overview/) 


## 提取 {#withdraw}

提取需经过7天冷却期，在没有进行中的理赔时可随时申请。

如果冷却期间出现新的理赔，提取流程将暂停，直到该理赔事件处理完毕。从首笔理赔算起，这可能还需要9–12天（Beta阶段；Beta结束后为6–9天）。在此期间，所有处于冷却期的资产仍需承担保险赔付。

冷却中的资产不产生收益，但仍为理赔提供保障。冷却期结束后，资产可随时提取，此后既不再承担理赔，也不再产生收益。


## 保险赔付上限 {#insurance-payout-limit}

每次理赔事件从承保池支出的赔付总额设有上限，目前为50%，即单次事件的赔付最多不超过当前承保池规模的50%。
