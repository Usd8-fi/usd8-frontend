# USD8 Korean (ko) glossary

English -> Korean. Use exactly one translation per term across docs, app UI and shared docs/consent strings.

- APY -> 연수익률 (labels: "연수익률", "30일 연수익률"; first mention in docs: 연수익률(APY)). Not 연이율 (implies simple deposit interest) and not bare "APY" (owner wants finance labels translated).
- 7D / 30D -> 7일 / 30일 (no space between number and unit)
- TVL -> 총 예치액
- Cover Pool -> 커버 풀 (pool names: "wstETH 커버 풀", "USD8 커버 풀")
- Cover Pool LP -> 커버 풀 LP
- Insurance Score -> 보험 점수 (score counter: 점, e.g. 하루 1점)
- Score Rate -> 점수 적립률 ("USD8 1개당 하루 1점")
- Available score -> 사용 가능 점수 (label "내 사용 가능 점수")
- Booster / Boosters -> 부스터 (add when filing -> 청구할 때 추가; eligible ones burned on accepting the payout -> 보상금을 수락할 때 소각)
- Private-beta "300% boosted" score rate / "x300%" flag -> 적립률 300%(3배) / "3배 적립". The rate is 3x the base, not +300%; never write "300% 부스트", which reads as +300% (4x).
- Claim (noun) -> 청구
- File a Claim / File Claim (button, title) -> 청구하기; prose: 청구하다 / 청구를 제출하다
- Claim Open / Claim Closed -> 청구 접수 중 / 청구 마감
- Claimer / claimant -> 청구자
- Payout -> 보상금 (act of paying: 보상금 지급; never "청구 보상금")
- Accept Payout -> 보상금 수락; decline -> 보상금 거절
- Payout Open / Payout Closed -> 보상금 수락 가능 / 보상금 수락 마감
- Insurance Payout Limit -> 보상금 지급 한도
- Insured Token -> 보험 대상 토큰
- Max coverage -> 최대 보장률
- Cover Pool limit -> 커버 풀 한도
- Incident -> 사고 (an incident "opens" -> 사고가 접수되다; "active incident" -> 진행 중인 사고; "finalized/resolved" -> 종결)
- Bond (claim bond) -> 청구 보증금 / 보증금 (forfeited -> 몰수)
- Escrow / escrowed -> 에스크로 / 에스크로된 (user action: 에스크로하다)
- Settle / Settlement -> 정산 (permissionless -> 권한 제한 없이 누구나)
- Settlement root -> 정산 루트
- Finalize Payout(s) -> 보상금 확정
- Dispute -> 이의 제기
- Deposit / Deposit cap -> 예치 / 예치 한도; Your Deposit -> 내 예치금
- Pool Filled -> 한도 소진율 ("한도 85% 소진"; uncapped -> 한도 없음)
- Withdraw / Withdrawal -> 출금; Withdraw Earnings -> 수익 출금
- Cooldown -> 쿨다운 ("7일 쿨다운", "쿨다운 중")
- Exit queue / Exit epoch -> 출금 대기열 / 출금 에포크
- Earnings / Yield -> 수익
- Mint / Redeem -> 발행 / 상환
- Approve (token allowance) -> (토큰) 사용 승인
- Confirmed (tx) -> 확정; Finalized block -> 확정된 블록; reverted -> 리버트
- Treasury (prose) -> 트레저리 (contract name stays "Treasury")
- Vault -> 볼트
- Strategy -> 전략
- Timelock -> 타임락 (contract name in address tables stays "Timelock")
- Timelock Queues -> 타임락 대기열
- Admin -> 관리자
- Attestation -> 증명(attestation)
- White Hat Economy -> 화이트햇 경제
- Beta / Private Beta -> 베타 / 비공개 베타
- FAQs -> 자주 묻는 질문
- Transparency -> 투명성
- System Stats -> 시스템 현황
- Addresses (footer) -> 컨트랙트 주소
- Legal -> 법적 고지
- DeFi Insurance (feature) -> DeFi 보험
- zk-coprocessor -> zk 코프로세서

Keep in English: USD8, sUSD8, USDC, wstETH and other token symbols, TEE, TWAP, LP, NFT, DeFi, RPC, protocol/company/chain names (Ethereum, Aave, Morpho, Chainlink, OpenZeppelin, Brevis, Telegram, X, Github), contract and function names (Registry, Treasury, DefiInsurance, endBetaMode), addresses, URLs and numbers ('.' decimals, no thousands separators).

Style
- Translate the idea, not the words: reorder or merge clauses freely within a string/paragraph, keeping every fact, condition, number and caveat.
- Prose: polite 합니다체; instructions end in -세요. Buttons and short labels are noun phrases without a final period ("청구하기", "수익 출금"). Loading labels: "보험 점수를 불러오는 중". Dialog close labels: "... 창 닫기".
- Spacing: standard 띄어쓰기; no space between a number and its unit (7일, 13~19분, 80%, 50400블록); ranges use "~" (9~12일).
- Particles attach directly to Latin words and numbers, chosen by how the word is read: USD8/sUSD8: the digit is read the Korean way (유에스디팔, ㄹ ending) -> 은/을/이/과 and 로 (USD8을, USD8이, USD8과, USD8로 — not USD8를/USD8으로); USDC (…씨), TEE (…이), % (퍼센트) -> 는/를/가/로; X DM, Telegram, Ethereum (…엠/…램/…움) -> 은/을/이/으로.
- Never write hedges like 을(를), 이(가), (으)로. For {placeholders} whose ending is unknown (token symbols, network names, durations), rephrase so no particle follows: "{token} 잔액이 없습니다", "{symbol} 사용을 승인하세요", "{network} 네트워크로 전환", "{target}에 배분됩니다", "{duration} 뒤부터"; 의/에/에서/부터/까지/대비 are safe after any ending.
- Never localize number formats; keep "$500", "80%", "10 USD8" as written.
