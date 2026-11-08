# Turkish (tr) translation audit

## 1. Verdict

**READY.** Confidence that a native Turkish crypto user would find it accurate and natural: **high**.

The translation is idiomatic and adapted, not word-for-word. Money and risk conditions are kept exactly: numbers, at least/at most, if/unless, may/will and every caveat. I found no CRITICAL or MAJOR errors. All changes were minor polish.

## 2. Counts

- Strings reviewed: 505 app strings (15 namespaces) and 29 shared strings (UI_TEXT 2, WIDGET_TEXT 21, CONSENT_TEXT 6).
- Docs reviewed: 9 pages, compared paragraph by paragraph against `book-src/` (no dropped or added sentences, facts, numbers or examples).
- App strings changed: 2. Shared strings changed: 0. Docs paragraphs changed: 3.

## 3. CRITICAL / MAJOR issues

None found.

Minor fixes:

| Where | Old → New | Why |
| --- | --- | --- |
| `fileClaim.holdingRequirement.blocks` | "Bu süre, olaydan önceki en az {blocks} bloktur." → "Elde tutma süresi: olaydan önceki en az {blocks} blok." | This fragment is inserted into both `tokenAmountHelp` and `boostersHelp`. In `boostersHelp` the sentence before it is about the holding *requirement*, not a *period*, so "Bu süre" ("this period") had nothing to refer to. The new wording reads correctly in both strings and avoids repeating "olaydan önce". |
| `fileClaim.holdingRequirement.unavailable` | "Bu süre protokolde tanımlıdır…" → "Elde tutma süresi protokolde tanımlı…" | Same reason. |
| `philosophy.md` §Order Enforcement | "…eylemleri daha da azaltır" → "…azaltabilir" | The English says "could … leading to"; "azaltır" ("reduces") stated it as a certainty. |
| `defi-insurance.md` §Boosters | "erken dönem kullanıcılara basılır" → "kullanıcılar için basılır" | "minted to users": "-e basılmak" read oddly, like "printed onto users". |
| `cover-pools.md` §Insured Tokens | "sürekli olarak yeniden gözden geçirilir" → "sürekli olarak güncellenir" | "adjusted on an ongoing basis": the old wording said "reviewed", but the list is actually changed over time. |

Composed strings checked with real values: `tokenAmountHelp`/`boostersHelp` + `holdingRequirement.*`; `withdrawAvailability` + `cooldownWithLength("7 günlük")`/`cooldown`; `balances.summary` + `inCooldownWithTiming` + `lib.cooldown.readyIn` (1/2/5/21); `claims.availableHelp` + duration or `score.holdingPeriod` ("elde tutma süresinden sonra"); `score.cooldownIn`; `effectiveScoreAfterBoosters` + `scoreCommitted`; `weight.summary` + `weight.boosters_*`; the APY toggle row "7G 30G Yıllık Getiri"; `yieldIllustration.label` with both targets. All are grammatical. No `{placeholder}` carries a Turkish suffix, and USD8 never takes an assimilating suffix (-de/-den).

## 4. Back-translations of money-critical strings

| Key | Turkish | Literal back-translation | Match |
| --- | --- | --- | --- |
| fileClaim.requirement | Talep için {symbol} değerinin, dayanak varlığına göre %20'den fazla düşmüş olması gerekir. Düşüş, hemen öncesindeki ve sonrasındaki TWAP fiyatları karşılaştırılarak ölçülür. | For a claim, {symbol}'s value must have fallen more than 20% against its underlying. The drop is measured by comparing the TWAP prices immediately before and after. | yes |
| fileClaim.form.tokenAmountHelp (+blocks) | …{symbol} varlığını olaydan önce belirli bir süre boyunca elinizde tutmuş olmalısınız. Elde tutma süresi: olaydan önceki en az {blocks} blok. Talep hakkınız bu süre içindeki en düşük bakiyenize göre belirlenir; sonradan edindiğiniz token'lar sayılmaz. Bu bakiye sıfırsa talep hakkınız olmaz ve talep depozitonuz iade edilmez. | You must have held {symbol} for a period before the incident. Holding period: at least N blocks before the incident. Eligibility is set by your lowest balance in that period; tokens acquired later don't count. If that balance is zero you have no claim right and your claim bond is not refunded. | yes |
| fileClaim.form.claimBondHelp | Talepte bulunmak için 10 USD8 tutarında bir spam önleme depozitosu gerekir. Talep hakkınız yoksa depozito iade edilmez. | A 10 USD8 anti-spam deposit is required to file. If you are not eligible, the deposit is not refunded. | yes |
| fileClaim.form.scoreHelp | Harcamak istediğiniz puan. Uzlaştırmada bu miktar kullanılabilir puanınızla sınırlanır ve puan yalnızca uygun bir ödemeyi kabul ederseniz harcanır. | The score you want to spend. Settlement limits it to your available score, and score is spent only if you accept an eligible payout. | yes |
| fileClaim.form.boostersHelp | İsteğe bağlı. Booster'lar da … aynı olay öncesi elde tutma şartını karşılamalıdır. … Yalnızca uygun Booster'lar ödeme ağırlığını artırır ve ödeme kabul edildiğinde yakılır. Fazla Booster'lar iade edilir; ödemeyi reddederseniz tüm Booster'lar size geri döner. | Optional. Boosters must meet the same pre-incident holding requirement… Only eligible Boosters raise payout weight and are burned when the payout is accepted. Excess ones are returned; if you decline, all Boosters come back to you. | yes |
| fileClaim.payout.ineligible | Ödeme almaya hak kazanmadınız ve {bond} USD8 depozitonuz iade edilmeyecek. Talebi kapatmak için token'larınızı geri alın. | You did not qualify for a payout and your {bond} USD8 deposit will not be refunded. Take back your tokens to close the claim. | yes |
| fileClaim.metric.bondNotRefunded | İade edilmeyecek: şartlar karşılanmadı | Will not be refunded: conditions not met | yes |
| fileClaim.noClaimInIncident | Bu olayda talebiniz yok. Talep süresi kapandı ancak uzlaştırma herkese açık: İsteyen herkes uzlaştırabilir. | You have no claim in this incident. The claim period closed, but settlement is open to all: anyone can settle. | yes |
| fileClaim.statusDescription.settlementExpired | uzlaştırma süresi kapandı, lütfen emanetinizi geri çekin. | settlement window closed, please withdraw your escrow. | yes |
| fileClaim.statusDescription.payoutExpired | ödeme süresi kapandı, lütfen emanetinizi geri çekin. | payout window closed, please withdraw your escrow. | yes |
| fileClaim.weight.summary | Azami ödeme ağırlığı: {weight}{boosters} — geçici emanet ağırlığı içindeki payı: {share}; nihai ağırlık, elde tutma şartının sağlanıp sağlanmadığına bağlıdır. | Max payout weight … its share of provisional escrow weight: {share}; final weight depends on whether the holding requirement is met. | yes |
| simulateClaim.intro | …tazminatınızı tahmin edin. Uzlaştırmada her şey TEE içinde yeniden hesaplanır; bu nedenle nihai ödeme farklı olabilir. | Estimate your reimbursement… Settlement recalculates everything in the TEE, so the final payout may differ. | yes |
| simulateClaim.lossValue.help | …düşüşten önceki 7 günlük ortalama fiyatla hesaplanan değeri. Kayıp sınırı bu değerin bir yüzdesidir. | Value at the 7-day average price before the drop. The loss cap is a percentage of this value. | yes |
| coveredProtocols.columns.maxCoverageHelp | Listelenen her token için zincir üstünde tanımlı güncel azami tazminat oranı. Gerçek ödeme, kullanıcının sigorta puanına ve teminat havuzu limitlerine bağlıdır. | Current onchain max reimbursement rate per token. Actual payout depends on the user's score and cover pool limits. | yes |
| landing.claims.intro | Sigortalı bir token dayanak varlığına göre %20'den fazla değer kaybederse, sigorta puanınızı kullanarak tazminat talebinde bulunun. | If an insured token loses more than 20% against its underlying, file a claim using your score. | yes |
| landing.claims.availableHelp | Kazandığınız puan {duration} sonra kullanılabilir hâle gelir; taleplerde harcadığınız puan bundan düşülür. | Earned score becomes usable after {duration}; score spent on claims is deducted. | yes |
| landing.coverPools.help | …havuz, sigortalı token'ları güvence altına alır: Bunlardan biri %20 veya daha fazla düşer ve bir olay açılırsa geçerli talepler havuz varlıklarından ödenir; her olayda kullanılabilecek tutar havuzun belirli bir payıyla sınırlıdır. Çekimlerde 7 günlük bekleme süresi vardır ve çekilmeyi bekleyen varlıklar da talepleri karşılamaya devam eder. | …if one drops 20% or more and an incident opens, valid claims are paid from pool assets; the amount per incident is capped at a share of the pool. Withdrawals have a 7-day cooldown, and assets waiting to withdraw keep covering claims. | yes |
| landing.coverPools.warning | …Sigortalı bir token kayba uğrarsa havuza yatırılan varlıklar talepleri ödemek için kullanılabilir. | …if an insured token suffers a loss, assets deposited in the pool may be used to pay claims. | yes |
| landing.pool.earningsHelp | Kazançlar {asset} olarak değil, USD8 olarak ödenir. Kazançlar sigorta taleplerinden etkilenmez ve istediğiniz zaman çekilebilir. | Earnings are paid in USD8, not {asset}. They are not affected by insurance claims and can be withdrawn any time. | yes |
| landing.pool.filledHelp | …%100'e ulaştığında, biri çekim yapana kadar yeni yatırım kabul etmez. | At 100% it accepts no new deposits until someone withdraws. | yes |
| transactions.pool.withdrawAvailability (+7-day) | {amount} pay kullanılabilir. Bekleyen talep yoksa çekim 7 günlük bekleme süresi sonunda yapılabilir; varsa tüm talepler sonuçlandıktan sonra. | N shares available. With no pending claims you can withdraw at the end of a 7-day cooldown; otherwise after all claims are finalized. | yes |
| transactions.pool.mayDecrease | Çekiminiz tamamlanmadan havuz tazminat öderse azalabilir. | May decrease if the pool pays claims before your withdrawal completes. | yes |
| app.pool.cooldownStarted | Bekleme süresi başladı. Bu tutar artık getiri kazanmaz ve çıkışınız tamamlanmadan havuz tazminat öderse azalabilir. | Cooldown started. This amount no longer earns and may decrease if the pool pays claims before your exit completes. | yes |
| lib.pool.depositsPausedForIncident | #{incident} numaralı sigorta olayı aktif olduğu için yatırma işlemleri geçici olarak durduruldu. Olay sonuçlandıktan sonra tekrar deneyin. | Deposits are temporarily paused because incident #N is active. Try again after it is finalized. | yes |
| notices.site.message | …elde tuttukları USD8 için %300 artırılmış oranla sigorta puanı kazanır ve beta sonunda 3 Booster alır. | …earn insurance score at a 300% boosted rate on USD8 they hold and receive 3 Boosters at the end of the beta. | yes |
| terms.disagreeNote | Kabul etmezseniz cüzdanınızın bağlantısı kesilir. Herhangi bir imza veya işlem gerekmez. | If you don't agree, your wallet is disconnected. No signature or transaction is needed. | yes |
| CONSENT_TEXT.message | USD8, sitenin genel kullanımını anlamak için isteğe bağlı Google Analytics çerezleri kullanır. Analiz araçlarını yalnızca siz kabul ettikten sonra yükleriz. Reddetmeniz uygulamanın kullanımını etkilemez. | USD8 uses optional GA cookies to understand overall site use. We load analytics only after you accept. Rejecting does not affect using the app. | yes |

The docs' critical passages also match the English: claim conditions 1-3 and the 10 USD8 bond, the 3-day claim/settlement/payout windows, the $2250 → $1125 → $900 → $300/$400 example, the beta admin dispute, the 7-day cooldown and the 9-12 / 6-9 day pause, the 50% per-incident limit, and the 80%/20% fee.

## 5. Term decisions reviewed

No terms were changed. I kept all of these on purpose; the glossary now records the reasons.

- **Mint → "Bas"** (kept). "Basmak" is the verb Turkish crypto media use for minting stablecoins. "Mint Et" is NFT slang and would clash with the formal "İtfa Et". The button is unambiguous in context: it sits on the USD8 card next to "İtfa Et" and opens a dialog titled "USD8 Bas".
- **TVL → "Toplam Yatırılan"** (kept). The label is accurate (the pool's deposited total), plain Turkish, and in line with ja/ko/ru. An acronym would read worse in the three-column pool card.
- **Cover Pool → "Teminat Havuzu"** (kept over "Sigorta Havuzu"). "Teminat" is the insurance word for cover, and "teminat havuzu" is the existing Turkish term for a covered-bond cover pool. "Sigorta Havuzu" would suggest the insured party's pool and blur with "sigorta puanı"/"sigortalı token". Possible reading as "collateral pool" is harmless, since the pool's assets do back the claims.
- **Suffixes:** all apostrophe and vowel-harmony forms are correct (USD8'in, USDC'den, TEE'miz, LP'leri, L2'leri, Timelock'un, oracle'ları, NFT'lerdir). No suffix is attached to a `{placeholder}`.
- **Glossary update:** the holding-requirement row now records the "Elde tutma süresi: …" fragment pattern.

## 6. For human judgement

- `landing.usd8.flag` "Kapalı betada x300%" copies the English badge. It breaks the Turkish %-before-number rule, but "x%300" looks odd in Turkish. Keep it, or use "Kapalı betada %300".
- If the owner wants zero chance of "Bas" being read as "Press", change only `landing.usd8.mint` to "USD8 Bas".
- `tr-shared.json` is unchanged, so the copies already merged into `docs-theme.js`/`analytics.js` need no update.
