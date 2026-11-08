# 커버 풀 {#cover-pools}

커버 풀은 누구나 언제든지 예치하고 출금할 수 있는 공개 볼트입니다. 커버 풀은

- 정해진 토큰(예: wstETH)을 예치 자산으로 받습니다
- USD8 트레저리 수익을 재원으로 한 수익을 USD8로 지급합니다
- 규모에 상한이 있습니다

<div class="example-box">
  경고 - 보험 대상 토큰의 가격이 20% 이상 떨어지면 커버 풀 자산이 보상금 지급에 사용됩니다.
</div>


## 보험 대상 토큰 {#insured-tokens}

보험 대상 토큰은 신중한 평가를 거쳐 선정하며, 지속적으로 조정합니다. USD8은 다음 기관의 독립적인 보안 감사 또는 인증을 인정합니다.

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Security Alliance의 SEAL 인증](https://frameworks.securityalliance.dev/certs/overview/) 


## 출금 {#withdraw}

출금에는 7일의 쿨다운이 있으며, 진행 중인 청구가 없다면 언제든지 요청할 수 있습니다.

쿨다운 중에 새 청구가 들어오면 사고가 해결될 때까지 출금 절차가 멈춥니다. 첫 청구 시점부터 베타 기간에는 9~12일(베타 이후에는 6~9일)이 더 걸릴 수 있으며, 그동안 쿨다운 중인 자산은 모두 보험 보상금 지급에 계속 노출됩니다.

쿨다운 중인 자산에는 수익이 쌓이지 않지만 계속 청구를 보장합니다. 쿨다운이 끝난 자산은 언제든지 출금할 수 있으며, 이때부터는 청구를 보장하지 않고 수익도 쌓이지 않습니다.


## 보상금 지급 한도 {#insurance-payout-limit}

사고 한 건당 커버 풀에서 지급할 수 있는 총 보상금에는 한도가 있으며, 현재 50%로 설정되어 있습니다. 즉, 사고 한 건의 최대 보상금은 현재 커버 풀 규모의 50%입니다.
