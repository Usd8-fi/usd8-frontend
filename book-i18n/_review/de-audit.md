# German (de) translation audit — independent review

## 1. Verdict

**READY WITH NOTES.** Confidence that a native German user finds it accurate and natural: **high**.

The earlier translation was already of good quality: formal "Sie" throughout, idiomatic product German (Antrag stellen, Erstattung, Kaution, Wartezeit, Rendite p. a.), correct dative durations, and no numbers, conditions or caveats lost in the claim, bond, cooldown or payout copy. I found one substantive meaning problem (the private-beta boost could be read as 4× instead of 3×), one tense/certainty shift in the FAQ, and a handful of style issues.

## 2. Counts

- Strings reviewed: 501 app JSON strings (15 namespaces) + 29 shared strings (docs UI, docs widgets, cookie banner) = 530
- Strings changed: 14 (13 app JSON + 1 shared)
- Docs: all 8 pages + SUMMARY compared paragraph by paragraph against `book-src/`; 7 paragraphs/list blocks changed (SUMMARY 1, faqs 4, transparency 1, white-hat-economy 1). No dropped or added sentences, facts, numbers or examples found.

## 3. CRITICAL / MAJOR issues

| Sev. | Location | Old → New | Why (back-translation) |
| --- | --- | --- | --- |
| MAJOR (money-adjacent) | `notices.json` `site.message` | „…erhalten Sie auf USD8-Bestände einen Boost von 300 % auf die Versicherungsscore-Rate und zum Abschluss 3 Booster" → „…erhalten Sie auf Ihre USD8-Bestände die dreifache Versicherungsscore-Rate (300 %) und zum Abschluss der Beta 3 Booster" | Old: "a boost of 300% on the score rate". In German that reads as rate + 300 % = 4×. The English "300% boosted" means 3×. New: "triple the insurance score rate (300%)… 3 Boosters at the end of the beta". |
| MAJOR (money-adjacent) | `landing.json` `usd8.flag` | „x300 % in der Private Beta" → „3× in der Private Beta" | "x300 %" is not a German notation and is ambiguous next to the Score Rate. "3×" is unambiguous and shorter than the English (21 → 22 chars). |
| MAJOR | `faqs.md` „Wie senken Sie das Risiko für Cover-Pool-LPs?" list | „wird unser Team … prüfen / auswerten / anpassen" → „geht unser Team so vor: Es prüft … Es wertet … aus. Es passt … an oder entzieht sie." | Old was future tense ("our team **will** vet…"), which implies the vetting is not done yet. The English describes current practice ("our team vets…"). |

No CRITICAL issues found: bond, holding window, loss cap (80 %), fees (20 %), payout limit (50 %), the >20 % drop rule, 7-day cooldown/score maturity, deadlines (3 days), escrow, dispute window and "not refunded" conditions all match the English.

MINOR fixes (style/consistency):
- `coveredProtocols.actions.daysHoursLeft`: „noch {days} T {hours} Std." → „noch {days} Tg. {hours} Std." (a bare "T" is not a German abbreviation for days)
- `landing.pool.apyHelpLabel / apyWindowLabel / filledHelpLabel / earningsHelpLabel`, `transactions.pool.closeDeposit / closeWithdraw / closeWithdrawEarnings` (aria labels): pool names now take an article ("im wstETH Cover Pool", "aus dem …"). Before, it read "von wstETH Cover Pool" or "in wstETH Cover Pool", which is ungrammatical.
- `fileClaim.payout.vsLossValue`: „Auszahlung im Verhältnis zum Verlust" → „Auszahlung vs. Verlustwert" (metric label; 1.8× → 1.3× English length; restores "value")
- `lib.pool.waitingForEstimate`, `transactions.usd8.waitingForQuote`: „Warte auf …" → „Warten auf …" (no first-person "ich warte")
- Shared `CONSENT_TEXT.message`: „in zusammengefasster Form … Analytics wird erst geladen" → „in aggregierter Form … Google Analytics laden wir erst, wenn Sie zustimmen" (more natural; matches the English "We only load analytics")
- SUMMARY + faqs.md title „FAQs" → „FAQ" (matches the footer and glossary)
- faqs.md / transparency.md „Sicherheits-Stützräder" → „Sicherheitsvorkehrungen – sozusagen Stützräder –" (the compound was a calque)
- faqs.md „10 USD8 Kaution, die…" → „eine Kaution von 10 USD8, die…"
- white-hat-economy.md: „die fehlende Ebene aus Anreizen und Durchsetzung, ohne die böswillige Aktivitäten … gedeihen konnten" → „das Fehlen einer Ebene, die Anreize ausrichtet und Regeln durchsetzt – erst dadurch konnten böswillige Aktivitäten … gedeihen". The old "ohne die" ("without which") construction was awkward and could be misread.

## 4. Back-translation of money-critical strings

| Key / location | German | Literal English back-translation | Matches? |
| --- | --- | --- | --- |
| fileClaim `form.claimBondHelp` | Für einen Antrag ist eine Anti-Spam-Kaution von 10 USD8 erforderlich. Sind Sie nicht berechtigt, erhalten Sie sie nicht zurück. | A 10 USD8 anti-spam bond is required for a claim. If you are not eligible, you do not get it back. | yes |
| fileClaim `form.tokenAmountHelp` (+ `holdingRequirement.blocks`) | Mindesthaltedauer für sGHO: 50,400 Blöcke vor dem Vorfall. Maßgeblich ist Ihr niedrigstes Guthaben in diesem Zeitraum – später erworbene Token zählen also nicht. Liegt es bei null, sind Sie nicht berechtigt und Ihre Antragskaution verfällt. | Minimum holding period for sGHO: 50,400 blocks before the incident. Your lowest balance in this period is what counts, so tokens acquired later do not count. If it is zero, you are not eligible and your claim bond is forfeited. | yes |
| fileClaim `form.boostersHelp` | Optional. Für Booster gilt dieselbe Mindesthaltedauer wie für den versicherten Token: … Nur berechtigte Booster erhöhen das Auszahlungsgewicht; sie werden bei Annahme verbrannt. Überzählige Booster erhalten Sie zurück, bei Ablehnung alle. | Optional. Boosters have the same minimum holding period as the insured token: … Only eligible boosters increase payout weight; they are burned on acceptance. You get excess boosters back, and all of them if you decline. | yes |
| fileClaim `form.scoreHelp` | Der Score, den Sie einsetzen möchten. Die Abrechnung begrenzt ihn auf Ihren verfügbaren Score; verbraucht wird er nur, wenn Sie eine berechtigte Auszahlung annehmen. | The score you want to spend. Settlement caps it at your available score; it is only used up if you accept an eligible payout. | yes |
| fileClaim `requirement` | Voraussetzung: sGHO verliert gegenüber seinem Basiswert mehr als 20 % an Wert, gemessen am TWAP-Kurs unmittelbar vor und nach dem Rückgang. | Requirement: sGHO loses more than 20% of its value against its underlying, measured by the TWAP price immediately before and after the drop. | yes |
| fileClaim `payout.ineligible` | Sie haben keinen Anspruch auf eine Auszahlung, und Ihre Kaution von 10 USD8 wird nicht erstattet. Holen Sie Ihre Token zurück, um den Antrag abzuschließen. | You have no entitlement to a payout, and your 10 USD8 bond will not be refunded. Retrieve your tokens to close the claim. | yes |
| fileClaim `metric.bondNotRefunded` | Keine Erstattung: Bedingungen nicht erfüllt | No refund: conditions not met | yes |
| fileClaim `weight.summary` | Maximales Auszahlungsgewicht: X (inkl. 2 Booster) – Y des vorläufigen Gewichts aller Hinterlegungen. Das endgültige Gewicht hängt von der Prüfung der Haltedauer ab. | Maximum payout weight: X (incl. 2 boosters) – Y of the provisional weight of all escrows. The final weight depends on the holding-period check. | yes |
| fileClaim `noClaimInIncident` | Sie haben in diesem Vorfall keinen Antrag gestellt. Die Antragsfrist ist abgelaufen, die Abrechnung kann aber jeder auslösen. | You have not filed a claim in this incident. The claim window has closed, but anyone can trigger settlement. | yes |
| fileClaim `statusDescription.payoutExpired` | Auszahlungsfrist abgelaufen – bitte holen Sie Ihre Hinterlegung zurück. | Payout window expired – please retrieve your escrow. | yes |
| landing `claims.intro` | Fällt ein versicherter Token gegenüber seinem Basiswert um mehr als 20 %, können Sie mit Ihrem Versicherungsscore eine Erstattung beantragen. | If an insured token falls more than 20% against its underlying, you can use your insurance score to claim reimbursement. | yes |
| landing `claims.availableHelp` (+ lib duration) | Score wird nach 7 Tagen nutzbar, abzüglich des bereits für Anträge verbrauchten Scores. | Score becomes usable after 7 days, minus score already spent on claims. | yes |
| landing `coverPools.help` | … Fällt einer um 20 % oder mehr und wird ein Vorfall eröffnet, zahlen die Pool-Assets berechtigte Erstattungen aus – pro Vorfall begrenzt auf einen festen Anteil des Pools. Für Abhebungen gilt eine Wartezeit von 7 Tagen; Assets, die auf ihre Abhebung warten, haften weiterhin für Erstattungen. | … If one falls 20% or more and an incident is opened, pool assets pay valid claims – capped per incident at a fixed share of the pool. Withdrawals have a 7-day waiting period; assets waiting to be withdrawn remain liable for claims. | yes |
| landing `coverPools.warning` | … Erleidet ein versicherter Token einen Verlust, können Pool-Einlagen zur Auszahlung von Erstattungen verwendet werden. | … If an insured token suffers a loss, pool deposits may be used to pay claims. | yes |
| landing `pool.earningsHelp` | Erträge werden in USD8 ausgezahlt, nicht in wstETH. Sie haften nicht für Versicherungsfälle und können jederzeit abgehoben werden. | Earnings are paid in USD8, not wstETH. They are not liable for insurance cases and can be withdrawn any time. | yes |
| landing `asset.coverageHelp` | Die Deckung ist durch die in den Cover Pools verfügbaren Mittel begrenzt. | Coverage is limited by the funds available in the Cover Pools. | yes |
| notices `site.message` (new) | … erhalten Sie auf Ihre USD8-Bestände die dreifache Versicherungsscore-Rate (300 %) und zum Abschluss der Beta 3 Booster. | … you get triple the insurance score rate (300%) on your USD8 holdings and 3 Boosters at the end of the beta. | yes (was ambiguous) |
| transactions `pool.withdrawAvailability` (+ adjective) | 12 Anteile verfügbar. 7-tägige Wartezeit, sofern keine Anträge offen sind – andernfalls erst, wenn alle Anträge abgeschlossen sind. | 12 shares available. 7-day waiting period if no claims are open; otherwise only once all claims are finalized. | yes |
| transactions `pool.mayDecrease` | Kann sinken, falls der Pool Erstattungen auszahlt, bevor Ihre Abhebung abgewickelt ist. | May go down if the pool pays claims before your withdrawal settles. | yes |
| app `pool.cooldownStarted` | Wartezeit gestartet. Dieser Betrag erzielt ab sofort keine Rendite mehr und kann sich noch verringern, falls der Pool Erstattungen auszahlt, bevor Ihre Abhebung abgewickelt ist. | Waiting period started. This amount earns no more yield from now on and may still decrease if the pool pays claims before your withdrawal settles. | yes |
| simulateClaim `intro` | … Bei der Abrechnung berechnet die TEE alles neu – die endgültige Auszahlung kann daher abweichen. | … At settlement the TEE recalculates everything, so the final payout may differ. | yes |
| simulateClaim `insuredToken.help` | … Seine maximale Deckung bestimmt die Deckungsgrenze. Ein Cover Pool, der genau diesen Token hält, wird bei dessen Vorfall nicht herangezogen. | … Its max coverage sets the loss cap. A Cover Pool holding exactly this token is not used for its incident. | yes |
| coveredProtocols `columns.maxCoverageHelp` | Aktuelle, onchain festgelegte Höchsterstattung je gelistetem Token. Die tatsächliche Auszahlung hängt vom Versicherungsscore des Nutzers und den Limits der Cover Pools ab. | Current onchain-set maximum reimbursement per listed token. The actual payout depends on the user's insurance score and the Cover Pools' limits. | yes |
| terms `disagreeNote` | Wenn Sie ablehnen, wird Ihre Wallet getrennt. Dafür ist weder eine Signatur noch eine Transaktion nötig. | If you decline, your wallet is disconnected. Neither a signature nor a transaction is needed for that. | yes |
| docs defi-insurance §1 conditions | … in den letzten 1–6 Tagen zwischen zwei aufeinanderfolgenden 24-Stunden-TWAPs um mehr als 20 % gefallen … mindestens 7 Tage vor dem Kursrückgang erworben … vor dem Kursrückgang mindestens 7 Tage lang gehalten | … fell more than 20% between two consecutive 24h TWAPs in the last 1–6 days … earned at least 7 days before the drop … held for at least 7 days before the drop | yes |
| docs cover-pools payout limit | Pro Vorfall werden höchstens 50 % der aktuellen Größe des Cover Pools ausgezahlt. | Per incident at most 50% of the Cover Pool's current size is paid out. | yes |
| docs faqs revenue | … Da Antragsteller höchstens 80 % Deckung erhalten, sind die restlichen 20 % die Gebühr von USD8 | … Since claimants receive at most 80% coverage, the remaining 20% is USD8's fee | yes |
| shared `CONSENT_TEXT.message` (new) | … Google Analytics laden wir erst, wenn Sie zustimmen. Eine Ablehnung schränkt die App nicht ein. | … We load Google Analytics only once you agree. Declining does not restrict the app. | yes |

## 5. Term decisions changed

- **Private-beta boost** → „dreifache … Rate (300 %)" / „3×" (never „Boost von 300 %"), so the 3× promise cannot be read as 4×.
- **FAQs** → „FAQ" in the docs title and sidebar, matching the footer and the glossary table.
- **Day abbreviation in timed buttons** → „Tg." (was „T"); the chart toggles keep 7T/30T.
- **Pool names in sentences** take the masculine article („im {pool}", „aus dem {pool}").
- Kept after review: **Cover Pool** in English. It is the contract and pool name in the Addresses table, and German DeFi users know "Pool"; „Deckungspool" would be a coined word. **Rendite p. a.** for APY, **Antrag/Erstattung**, **Wartezeit** for cooldown, **Versicherungsscore**. Glossary updated.

## 6. Left for human judgement

- „kleiner Pool" (EN "small, capped pool") and „Rendite ↑" (EN "High APY ↑") in the SVG yield illustration drop "capped"/"high". The SVG text slots fit only about 15 characters, and the German forms would overflow, so they stay as they are. Decorative only; the full meaning is in the aria label and tooltip.
- English source inconsistency (not a translation issue): cover-pool copy says a drop of "20% or more" (landing help, docs warning), while the claim rules say "more than 20%". German mirrors each English sentence. The owner may want to unify the English.
- "zum Abschluss der Beta" interprets the English "at the end" as the end of the beta. Confirm that this is the intended meaning.
