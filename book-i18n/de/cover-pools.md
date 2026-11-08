# Cover Pools {#cover-pools}

Cover Pools sind öffentliche Vaults, in die jeder jederzeit einzahlen und aus denen jeder jederzeit abheben kann. Ein Cover Pool

- akzeptiert einen bestimmten Token als Einzahlung, z. B. wstETH
- zahlt eine Rendite in USD8, finanziert aus der Treasury-Rendite von USD8
- hat eine begrenzte Größe

<div class="example-box">
  Warnung: Erleidet ein versicherter Token einen Kursrückgang von 20 % oder mehr, werden die Assets der Cover Pools zur Zahlung von Erstattungen verwendet.
</div>


## Versicherte Token {#insured-tokens}

Versicherte Token werden sorgfältig bewertet, ausgewählt und laufend angepasst. USD8 erkennt unabhängige Sicherheitsaudits oder Zertifikate folgender Anbieter an:

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [SEAL-Zertifizierung der Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Abhebung {#withdraw}

Für Abhebungen gilt eine Wartezeit von 7 Tagen. Sie können jederzeit beantragt werden, solange keine Anträge aktiv sind.

Werden während der Wartezeit neue Anträge gestellt, ruht die Abhebung, bis der Vorfall abgeschlossen ist – ab dem ersten Antrag können das während der Beta weitere 9–12 Tage sein (nach der Beta 6–9 Tage). In dieser Zeit haften alle Assets in der Wartezeit weiterhin für Auszahlungen an Antragsteller.

Assets in der Wartezeit erzielen keine Rendite, haften aber weiterhin für Erstattungen. Nach Ablauf der Wartezeit können sie jederzeit abgehoben werden; sie haften dann nicht mehr für Erstattungen und erzielen auch keine Rendite mehr.


## Auszahlungslimit der Versicherung {#insurance-payout-limit}

Für die Gesamtauszahlung pro Vorfall aus dem Cover Pool gilt ein Limit von derzeit 50 %: Pro Vorfall werden höchstens 50 % der aktuellen Größe des Cover Pools ausgezahlt.
