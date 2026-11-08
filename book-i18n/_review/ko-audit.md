# ko (Korean) — independent audit

## 1. Verdict

**READY WITH NOTES**. Confidence is **medium-high** that a Korean native user will find it accurate and natural.

The app strings were already an idea-level translation in polite 합니다체 with correct particles. Every particle after a Latin word, number or link was checked by regex and read in context: USD8을/USD8이/USD8로, USDC가, wstETH를, `$900가`, `80%가`, `X DM으로`, `[Telegram](…)을`. There are no 을(를)-style hedges, and placeholders are only followed by safe particles (에/에서/의/부터/까지).

The docs had two **stale meaning errors**. In both, the English source had changed since the translation was made: Booster burning, and the bond refund condition in the FAQ. One app string could be misread as +300% (the beta boost). All three are fixed.

## 2. Counts

- Strings reviewed: 493 app strings across 15 namespaces (Korean has only the plural category `other`, so lib.json correctly has no `_one` rows), plus 29 shared strings (docs picker, widgets, consent). Total: 522.
- Strings changed: 9 in app JSON and 1 shared string (consent message).
- Docs: all 8 pages compared paragraph by paragraph with `book-src/`, including the current working copies of `defi-insurance.md`, `faqs.md` and `cover-pools.md`. Docs paragraphs changed: 3.

## 3. CRITICAL / MAJOR issues

| Sev | Key / file | Old → New | Why (back-translation) |
|---|---|---|---|
| CRITICAL | `book-i18n/ko/defi-insurance.md:78` (Boosters) | 청구할 때 소각해 총 보험 점수를 1% 높일 수 있는 NFT로… → 청구할 때 추가할 수 있는 NFT로, 1개당 총 보험 점수가 1%씩 높아집니다. 요건을 충족한 부스터는 보상금을 수락할 때 소각되고, 나머지는 반환됩니다… | Old: "NFTs you **burn when filing** to raise your score by 1%". Current English: "add when filing… **Eligible Boosters are burned when you accept the payout; the rest are returned**." The old text told users their Boosters are gone the moment they file. It now also matches the app's `fileClaim.form.boostersHelp`. |
| CRITICAL | `book-i18n/ko/faqs.md:37` | 10 USD8 보증금(청구가 끝나면 환불) → 10 USD8 보증금(청구 자격이 인정되면 청구가 끝난 뒤 환불) | Old: "bond, refunded after the claim" (unconditional). Current English: "refunded after the claim **if you were eligible**". An ineligible claimant forfeits the bond. |
| MAJOR | notices `site.message` | 보험 점수를 300% 부스트된 비율로 적립 → 보험 점수 적립률이 300%(3배)로 높아지며 | "Boosted by 300%" reads as +300% (4×). The beta rate is 3× the base. New: "the score rate rises to 300% (3×)". |
| MAJOR | landing `usd8.flag` | 비공개 베타 한정 x300% → 비공개 베타 한정 3배 적립 | "x300%" is not a Korean notation and is ambiguous. New: "3× accrual, private beta only". Shorter than the English. |
| MAJOR | landing `coverPools.help` | 풀에서 받는 토큰(예: wstETH)을 예치하면… → 풀마다 정해진 예치 토큰(예: wstETH)을 예치하면… | 풀에서 받는 토큰 can be read as "the token you **receive from** the pool". New: "each pool's designated deposit token". Also: 풀의 일정 비율로 → 풀 자산의 일정 비율까지로 ("up to a capped share of pool assets"). |
| MINOR→clarity | fileClaim `form.tokenAmountHelp`, `form.boostersHelp` | `{symbol} 보유 요건: {holding} 자격은…` → `{symbol} 토큰은 {holding} 청구 자격은…`; `…같은 사고 전 보유 요건을 충족해야 합니다. {holding} 요건을…` → `…보험 대상 토큰과 마찬가지로 {holding} 이 요건을…` | The assembled sentences repeated themselves ("sGHO holding requirement: must have held since 50,400 blocks before"). Now: "sGHO tokens must have been held since at least 50,400 blocks before the incident. Claim eligibility uses the lowest balance in that window…" and "Boosters, like the insured token, must have been held since … Only boosters meeting this requirement…". Checked with both `holdingRequirement.blocks` and `.unavailable`. Same facts: lowest balance, later tokens don't count, zero balance means the bond is forfeited, burned on acceptance, excess returned, all returned on decline. |
| MINOR | app `claim.insufficientUsd8ForAmountAndBond` | 청구 수량과… → 보험 대상 수량과… | Uses the glossary term for "insured amount". |
| MINOR | landing `asset.insuredValue` | 예 (한도 내) → 예 (한도 적용) | "YES with limits". 한도 내 means "within limits". |
| MINOR | landing `footer.openSource*` | 모든 코드 오픈소스 → 모든 코드 오픈소스 공개 | Natural phrasing for "open sourced". |
| MINOR | docs `usd8.md:22` | First mention of APY moved to 연수익률(APY), as the glossary requires. | Style only. |
| MINOR | shared `CONSENT_TEXT.message` | 사이트 전반의 이용 현황을 파악하기 위해 선택적으로… → 사이트 이용 현황을 집계해 파악하기 위해 선택 사항인… | "aggregate site usage" and "optional cookies" are now rendered precisely. 선택적으로 had attached "optional" to the verb. |

No number, unit, deadline, percentage or negation was wrong anywhere else.

## 4. Money-critical back-translations

| Key / place | Translation | Literal back-translation | Match |
|---|---|---|---|
| fileClaim.requirement | 하락 직전과 직후의 TWAP 가격을 비교해 {symbol}의 가치가 기초 자산 대비 20% 넘게 떨어진 경우에만 청구할 수 있습니다. | You can claim only if {symbol}'s value fell more than 20% vs its underlying, comparing TWAP right before and after the drop. | yes |
| landing.claims.intro | 보험 대상 토큰이 기초 자산 대비 20% 넘게 하락하면 보험 점수를 사용해 청구할 수 있습니다. | If an insured token drops more than 20% vs its underlying, you can claim using your insurance score. | yes |
| landing.coverPools.help | …20% 이상 하락해 사고가 접수되면… 사고 한 건당 지급액은 풀 자산의 일정 비율까지로 제한됩니다. 출금하려면 7일의 쿨다운… 출금을 기다리는 자산도 계속 청구를 보장합니다. | …drops 20% or more and an incident opens… payout per incident is limited up to a set share of pool assets. Withdrawal needs a 7-day cooldown… assets waiting to withdraw still cover claims. | yes (keeps the English "or more") |
| landing.coverPools.warning | …보험 대상 토큰에 손실이 발생하면 풀 예치금이 보상금 지급에 사용될 수 있습니다. | …if an insured token suffers a loss, pool deposits may be used to pay claims. | yes |
| fileClaim.form.claimBondHelp | 청구하려면 스팸 방지용 보증금 10 USD8을 걸어야 합니다. 청구 자격이 없으면 이 보증금은 돌려받을 수 없습니다. | To claim you must post a 10 USD8 anti-spam bond. If not eligible, you cannot get it back. | yes |
| fileClaim.form.tokenAmountHelp (+blocks) | sGHO 토큰은 사고 발생 최소 50,400블록 전부터 보유하고 있어야 합니다. 청구 자격은 이 기간 중 최저 잔액을 기준으로… 최저 잔액이 0이면 청구 자격이 없으며 청구 보증금은 몰수됩니다. | sGHO must be held since at least 50,400 blocks before the incident. Eligibility uses the lowest balance in this window… if it is 0 you are ineligible and the bond is forfeited. | yes |
| fileClaim.form.scoreHelp | 정산 시 사용 가능 점수 이내로 조정되며, 인정된 보상금을 수락할 때만 실제로 차감됩니다. | At settlement it is capped to available score, and is deducted only when an eligible payout is accepted. | yes |
| fileClaim.form.boostersHelp | …요건을 충족한 부스터만 보상 가중치를 높이며, 보상금을 수락할 때 소각됩니다. 초과분은 반환되며, 보상금을 거절하면 부스터가 모두 반환됩니다. | Only eligible boosters raise payout weight and are burned on accepting. Excess is returned; declining returns all boosters. | yes |
| fileClaim.payout.ineligible | 보상금 지급 대상이 아니므로 {bond} USD8 보증금은 환불되지 않습니다. 토큰을 반환받아 청구를 종료하세요. | You are not eligible for payout, so your {bond} USD8 bond is not refunded. Take your tokens back to close the claim. | yes |
| fileClaim.metric.bondNotRefunded | 환불 불가: 조건 미충족 | Not refundable: conditions not met | yes |
| coveredProtocols.maxCoverageHelp | 토큰별로 현재 온체인에 설정된 최대 보상 비율입니다. 실제 보상금은 사용자의 보험 점수와 커버 풀 한도에 따라 달라집니다. | The max reimbursement rate currently set on-chain per token. Actual payout depends on the user's score and pool limits. | yes |
| landing.asset.coverageHelp | 보장 금액은 커버 풀에 있는 자산 규모로 제한됩니다. | Coverage is limited by the size of assets in the cover pools. | yes |
| landing.claims.availableHelp | 적립된 점수는 {duration} 뒤부터 사용할 수 있으며, 이미 청구에 사용한 점수는 빠집니다. | Earned score is usable after {duration}, minus score already spent on claims. | yes |
| landing.pool.earningsHelp | 수익은 {asset} 대신 USD8로 지급됩니다. 수익은 보험 보상금 지급에 사용되지 않으며 언제든지 출금할 수 있습니다. | Earnings are paid in USD8 instead of {asset}; not used for payouts; withdrawable any time. | yes |
| app.pool.cooldownStarted | …이 금액에는 더 이상 수익이 쌓이지 않으며, 출금이 정산되기 전에 풀이 보상금을 지급하면 줄어들 수 있습니다. | …this amount no longer earns, and may decrease if the pool pays claims before your exit settles. | yes |
| transactions.pool.withdrawAvailability (+7일 쿨다운) | 대기 중인 청구가 없으면 7일 쿨다운 후 출금할 수 있고, 있으면 모든 청구가 확정된 후 출금할 수 있습니다. | Without pending claims, withdraw after the 7-day cooldown; otherwise after all claims are finalized. | yes |
| lib.pool.depositsPausedForIncident | 보험 사고 #{incident} 처리 중에는 예치가 일시적으로 중단됩니다. 사고가 종결된 후 다시 시도하세요. | Deposits are temporarily paused while incident #{incident} is being handled. Retry after it is finalized. | yes |
| simulateClaim.intro | …정산 시 TEE에서 모든 값을 다시 계산하므로 최종 보상금은 달라질 수 있습니다. | …settlement recalculates everything in the TEE, so the final payout may differ. | yes |
| simulateClaim.insuredToken.help | …같은 토큰을 보유한 커버 풀은 해당 사고의 지급 재원에서 제외됩니다. | …a cover pool holding the same token is excluded from that incident's funding. | yes |
| notices.site.message | …보험 점수 적립률이 300%(3배)로 높아지며, 베타 종료 시 부스터 3개를 받습니다. | …score rate rises to 300% (3×), and you receive 3 boosters when the beta ends. | yes (fixed) |
| docs defi-insurance §1 | 2. 가격 하락 시점보다 최소 7일 전에 적립한, 아직 사용하지 않은 보험 점수… 3. 가격 하락 전 최소 7일 동안 보험 대상 토큰을 보유… 10 USD8의 보증금… 2번과 3번 조건을 충족하면 전액 돌려받습니다. | Unspent score earned at least 7 days before the drop; held the token min 7 days before; 10 USD8 bond fully refunded if conditions 2 and 3 are met. | yes |
| docs defi-insurance example | 커버 풀 한도 50% → $1125, 그중 80%인 $900… A 최대 $300, B 최대 $600… 각각 $400로 제한… A $300, B $400 | Same numbers. | yes |
| docs defi-insurance §3 | 3일 안에… 수락하면 에스크로한 보험 대상 토큰과 보험 점수를 포기하고… 보증금 조건을 충족했다면 보증금은 반환됩니다. | 3 days to accept; accepting forfeits escrowed token and score; bond returned if bond conditions are met. | yes |
| docs cover-pools Withdraw | 7일의 쿨다운… 진행 중인 청구가 없다면 언제든지 요청… 9~12일(베타 이후에는 6~9일)… 쿨다운 중인 자산에는 수익이 쌓이지 않지만 계속 청구를 보장 | Same. | yes |
| docs cover-pools Payout Limit | 사고 한 건당… 현재 50%… 사고 한 건의 최대 보상금은 현재 커버 풀 규모의 50%입니다. | Per incident capped at 50% of current pool size. | yes |
| docs faqs Where payout | …20% 넘게 하락하면… 사고 한 건에 커버 풀마다 잔액의 최대 50%까지 쓰일 수 있습니다. | …drops more than 20%… each incident may use up to 50% of each pool's balance. | yes |
| docs faqs revenue | 보상금 지급 후 남는 20% - 청구자는 최대 80%까지만 보장받으므로, 나머지 20%가 USD8의 수수료가 됩니다. | The 20% left over: claimers get max 80%, the remaining 20% is USD8's fee. | yes |

## 5. Term decisions

- Added to the glossary: the beta boost is written 적립률 300%(3배) / "3배 적립", never "300% 부스트", which reads as 4×.
- Added to the glossary: Booster wording. 청구할 때 추가 for adding Boosters to a claim, and 보상금을 수락할 때 소각 for the burn. This follows the current English docs and the app.
- No other term changes. The existing glossary (연수익률, 총 예치액, 커버 풀, 보상금, 청구 보증금, 쿨다운, 에스크로, 정산, 이의 제기) was kept and is applied consistently across the app, docs and shared strings.

## 6. For human judgement

- English source inconsistencies, translated as written in each place: "20% or more" (`coverPools.help`, docs warning: 20% 이상) vs "more than 20%" (claim rules: 20% 넘게/초과). The Booster burn timing in the English docs now matches the app (burned on acceptance). The Korean docs were updated to follow it.
- 쿨다운 and 에스크로 are loanwords. Korean DeFi users understand them, but a native reviewer may prefer 대기 기간 for cooldown in user-facing copy.
