# DeFi-Versicherung {#defi-insurance}

- Inhaber von USD8 und sUSD8 erhalten mit jedem Block Versicherungsscore
- Mit dem Versicherungsscore können Sie für eine Reihe versicherter DeFi-Token Erstattungen beantragen, auch für USD8 und sUSD8
- Je mehr Score, desto höher die Auszahlung: bis zu 80 % des Werts, begrenzt durch das Cover-Pool-Limit
- Der Score ist nicht übertragbar und verfällt nie
- Die Auszahlungen stammen aus den [Cover Pools](./cover-pools.md)

<div class="example-box">
<p>Beispiel: Angenommen, Aave aUSDC ist ein versicherter Token mit einer maximalen Deckung von 80 %</p>
<ol>
<li>Der Kurs von aUSDC zu USDC fällt von 1 auf 0.3</li>
<li>Ein Nutzer mit Versicherungsscore erhält im Tausch gegen seine aUSDC bis zu 0.8 USDC an Wert aus den Assets des Cover Pools</li>
</ol>
</div>

## Ablauf einer Erstattung {#claim-process}

Eine Erstattung läuft in drei Schritten ab, die Onchain- und Offchain-Prozesse (TEE) kombinieren. Während der Beta dauert sie etwa 9–12 Tage, danach 6–9 Tage. Achten Sie darauf, keine Frist zu verpassen.


### 1 Antrag stellen {#1-file-a-claim}

Jeder kann einen Antrag stellen, wenn
1. der Kurs eines versicherten Tokens in den letzten 1–6 Tagen zwischen zwei aufeinanderfolgenden 24-Stunden-TWAPs um mehr als 20 % gefallen ist,
2. der Antragsteller ungenutzten Versicherungsscore hat, der mindestens 7 Tage vor dem Kursrückgang erworben wurde, und
3. der Antragsteller den versicherten Token vor dem Kursrückgang mindestens 7 Tage lang gehalten hat.

Außerdem ist eine Kaution von 10 USD8 fällig. Sie wird vollständig erstattet, wenn die Bedingungen 2 und 3 erfüllt sind. Wann der Kursrückgang stattfand, müssen Sie nicht angeben: Unsere TEE findet den Rückgang und bestimmt den genauen Block selbst.


Wichtig: Die Antragsfrist endet 3 Tage nach dem ersten gültigen Antrag. Danach können für diesen versicherten Token keine Anträge mehr gestellt werden.


### 2 Anträge abrechnen {#2-settle-claims}
Jeder kann die Anträge abrechnen, indem er eine Attestierung der TEE einreicht. Die TEE berechnet mit einem Open-Source-Algorithmus Versicherungsscore und Auszahlung jedes Antragstellers. Die Ergebnisse sind vollständig überprüfbar.

Die Höhe der einzelnen Auszahlung richtet sich nach

1. dem Versicherungsscore des Antragstellers im Verhältnis zum Gesamtscore aller Antragsteller
2. dem Cover-Pool-Limit
3. der maximalen Deckung des versicherten Tokens

<div class="example-box">
<p>Beispiel: Es gibt 2 Antragsteller. A hat einen Score von 100, B einen Score von 200. Beide haben versicherte Token im Wert von je 500 USD mit einer maximalen Deckung von 80 % hinterlegt. Der Cover Pool enthält derzeit Assets im Wert von 2250 USD.</p>
<ol>
<li>Das Cover-Pool-Limit liegt derzeit bei 50 %, es stehen also insgesamt 1125 USD zur Verfügung. 80 % davon, also 900 USD, bilden das Budget für die Erstattungen. A hat halb so viel Score wie B, kann also bis zu 300 USD beanspruchen, B bis zu 600 USD</li>
<li>Beide haben versicherte Token im Wert von 500 USD hinterlegt. Bei einer maximalen Deckung von 80 % ist ihre Erstattung für ihren Verlust auf 400 USD begrenzt.</li>
<li>A erhält eine Auszahlung von 300 USD, B von 400 USD</li>
</ol>
</div>

Die Abrechnungsfrist beträgt höchstens 3 Tage. Sobald abgerechnet ist, können Nutzer ihre Auszahlungen abschließen. Wird nicht abgerechnet, können Antragsteller ihre hinterlegten Token zurückholen, und es wird kein Versicherungsscore verbraucht.

Während der Beta hat der Admin nach der Abrechnung zusätzlich 3 Tage Zeit, sie zu prüfen und mit einer neuen, von der TEE signierten Abrechnung anzufechten. Diese Sicherheitsmaßnahme soll sicherstellen, dass keine fehlerhaften oder manipulierten Abrechnungen durchgehen.


### 3 Auszahlungen abschließen {#3-finalize-payouts}
In diesem Schritt haben Antragsteller 3 Tage Zeit, die Auszahlung anzunehmen. Wer annimmt,

1. gibt die hinterlegten versicherten Token und den eingesetzten Versicherungsscore ab und
2. erhält Cover-Pool-Assets, deren Gesamtwert in USD der zustehenden Auszahlung entspricht.

Wer die Auszahlung nicht annimmt, kann die hinterlegten Token zurückholen und behält den Versicherungsscore.

Ob Antragsteller abschließen oder nicht: Die Kaution wird in jedem Fall zurückgezahlt, sofern die Kautionsbedingungen erfüllt sind.

Wichtig: Die Auszahlungsfrist beträgt 3 Tage. Danach gelten alle offenen Anträge als nicht angenommen, und die Antragsteller können ihre hinterlegten Token zurückholen.

## TEE {#tee}
USD8 nutzt eine Amazon Secure Enclave, die offchain einen Open-Source-Algorithmus ausführt, um Auszahlungen zu berechnen und zu signieren. Jeder kann die TEE auslösen und das Ergebnis onchain einreichen; der Contract prüft die Signatur der TEE, bevor er das Endergebnis übernimmt. Da der Algorithmus Open Source ist, kann jeder das Ergebnis öffentlich nachprüfen.

Künftig wollen wir auf ein zk-Coprozessor-Netzwerk wie [Brevis](https://brevis.network/) umsteigen, um den [Walkaway-Test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html) zu bestehen.


## Booster {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="Artwork des USD8-Booster-NFT" /><br/><br/>
[Booster](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) sind NFTs, die Sie beim Stellen eines Antrags hinzufügen können; jeder erhöht Ihren gesamten Versicherungsscore um 1 %. Berechtigte Booster werden verbrannt, wenn Sie die Auszahlung annehmen; die übrigen erhalten Sie zurück. Mehrere Booster lassen sich kombinieren. Booster sind nicht käuflich: Sie werden nur an frühe Nutzer gemintet, die USD8 beim Wachsen helfen. Folgen Sie uns auf [X](https://x.com/usd8_fi) und [Telegram](https://t.me/+e84i2oYk1ao1MTk1).

Geben Sie eine Ethereum-Adresse ein, um ihre Booster zu prüfen

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Prüfen</button>
<div id="booster-result" class="booster-result"></div>
</div>
