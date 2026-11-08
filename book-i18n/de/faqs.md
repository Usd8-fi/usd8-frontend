<h1 id="faqs" class="faq-title">FAQ</h1>

## Bekomme ich durch USD8 und sUSD8 also eine kostenlose Versicherung? {#so-i-get-free-insurance-from-usd8--susd8}

Ja, das ist der Vorteil von USD8 gegenüber anderen Stablecoins. Sie erhalten mit jedem Block Versicherungsscore: Je mehr USD8/sUSD8 Sie halten und je länger, desto mehr Score bekommen Sie.

Der Score wächst unterschiedlich schnell: Derzeit bringt jeder USD8 1 Score pro Tag, jeder sUSD8 dagegen 0.1 Score pro Tag.


## Woher kommt die Auszahlung der Versicherung? {#where-does-the-insurance-payout-come-from}

Die Auszahlungen stammen aus den [Cover Pools](./cover-pools.md), offenen Token-Vaults, in die jeder einzahlen kann. Derzeit gibt es zwei: [einen mit wstETH und einen mit USD8](https://usd8.fi/#cover-pools).

Einzahler erhalten eine hohe Rendite, finanziert aus der Treasury-Rendite von USD8. Fällt jedoch ein versicherter Token gegenüber seinem Basiswert um mehr als 20 %, können ihre Einlagen zur Zahlung von Erstattungen herangezogen werden – pro Vorfall bis zu 50 % des Guthabens jedes Cover Pools. Hohes Risiko, hohe Rendite.


## Wann kann ich meinen Versicherungsscore für einen Antrag nutzen? {#when-can-i-use-my-insurance-score-for-a-claim}

Versicherungsscore wird 7 Tage nach dem Erwerb verfügbar, und nur verfügbarer Score kann für einen Antrag eingesetzt werden.
  
## Ich hatte früher USD8, jetzt aber nicht mehr – bin ich trotzdem versichert? {#i-had-usd8-before-but-not-now-am-i-still-insured}

Ja. Sie sollten Versicherungsscore angesammelt haben, und dieser verfällt nicht. Sie können Anträge stellen, solange Ihr Score mindestens 7 Tage alt ist.

## Wie hoch ist meine Auszahlung? {#how-much-payout-do-i-get}

Das hängt ab von 1. Ihrem Versicherungsscore im Vergleich zu den anderen, die gleichzeitig Anträge stellen, und 2. dem Größenlimit des Cover Pools.

Je mehr Versicherungsscore Sie haben, desto stärker fällt Ihr Antrag ins Gewicht. Die maximale Auszahlung beträgt 80 %. Mit einem niedrigen Score erhalten Sie möglicherweise weniger – ist Ihnen die endgültige Auszahlung zu niedrig, können Sie sie aber jederzeit ablehnen und Ihren Versicherungsscore für später behalten.



## Was brauche ich für einen Antrag? {#whats-needed-when-filing-a-claim}

- den versicherten Token, für den Sie die Erstattung beantragen
- Versicherungsscore
- eine Kaution von 10 USD8, die nach dem Antrag erstattet wird, sofern Sie berechtigt waren
- Booster (optional)




## Wie senken Sie das Risiko für Cover-Pool-LPs? {#how-do-you-reduce-the-cover-pool-lp-risk}

Assets in Cover Pools können zur Zahlung von Erstattungen herangezogen werden. Das macht sie riskanter – deshalb bieten sie eine höhere Rendite. Um das Risiko der Cover Pools zu senken, geht unser Team so vor:
- Es prüft jedes Protokoll unabhängig, bevor es versichert wird.
- Es wertet die Audits Dritter für jedes Protokoll aus.
- Es passt die Deckung für jedes Protokoll auf Basis laufender Überwachung an oder entzieht sie.

Erstattungsfälle dürften selten vorkommen, ausgeschlossen sind sie aber nie.



## Was ist in der Beta anders? {#whats-different-in-beta}
In der Beta gibt es noch einige Sicherheitsvorkehrungen – sozusagen Stützräder –, die wir danach entfernen wollen. Während der Beta haben Admin und Timelock besondere Rechte und Befugnisse:
- Admin oder Timelock können die Abrechnung der Auszahlungen eines Vorfalls anfechten, indem sie einen neuen Settlement-Root einreichen. Dadurch kommt eine 3-tägige Anfechtungsfrist zum Antragsprozess hinzu, die nach der Beta entfällt.
- Der Timelock kann Registry, USD8, Treasury und DefiInsurance upgraden. Nach der Beta wollen wir die Upgradefähigkeit entfernen.


## Hat USD8 einen Governance-Token? {#does-usd8-has-a-governance-token}
Derzeit nicht.

## Welche Risiken birgt USD8? {#show-all-the-risk-involved-in-usd8}
Eine vollständige Übersicht finden Sie unter [Transparenz](./transparency.md).

## Wie verdient USD8 Geld? {#how-does-usd8-make-money}
USD8 hat mehrere Einnahmequellen:
- einen Teil der Treasury-Rendite von USD8
- die übrigen 20 % der Auszahlung: Da Antragsteller höchstens 80 % Deckung erhalten, sind die restlichen 20 % die Gebühr von USD8
- einen Teil der Verluste, die über die [White Hat Economy](white-hat-economy.md) zurückgeholt werden


## Wie kann ich zu USD8 beitragen? {#how-can-i-contribute-to-usd8}

Wir freuen uns über Beiträge der Community zu Mechanismusdesign, Partnerschaften, Marketing und mehr. Für Vorschläge, Kritik oder Ideen [eröffnen Sie ein Issue im usd8-core-Repository](https://github.com/Usd8-fi/usd8-core/issues) oder besprechen Sie sie mit dem Team in unserer [Telegram-Gruppe](https://t.me/+e84i2oYk1ao1MTk1). Wer mitwirkt, kann [Booster](defi-insurance.md#boosters) verdienen.

  
  

## Wer steht hinter USD8? {#who-is-behind-usd8}

USD8 wird von [@codephobic](https://x.com/codephobic) entwickelt – einem Security Researcher mit über 7 Jahren Erfahrung in der Prüfung führender DeFi-Protokolle und L2s.
