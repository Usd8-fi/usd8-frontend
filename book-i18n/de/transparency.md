# Transparenz {#transparency}

Hier finden Sie die Vertrauensannahmen und Risiken des USD8-Protokolls. Die meisten davon sind in DeFi-Protokollen üblich; wir legen sie unseren Nutzern bewusst von vornherein offen.

## Admin & Timelock {#admin--timelock}
Die Admin-Rechte haben wir beim Design so weit wie möglich beschränkt. Die meisten kritischen Aktionen laufen über den Timelock, der Nutzern zusätzlich Zeit gibt, auf anstehende Änderungen zu reagieren.

Der Admin darf Systemeinstellungen vornehmen, etwa
- Treasury-Mittel von USD8 in vorab genehmigte Strategien einsetzen, aber nicht selbst Strategien hinzufügen
- Pausierung, Einnahmengewichtungen, Protokollgebühr und Einzahlungsobergrenzen der Cover Pools verwalten

Der Timelock verwaltet sensible Systemeinstellungen:
- Admins hinzufügen/entfernen oder den Timelock ersetzen
- Pools, versicherte Token, Scoring, Oracles, Fristen für Vorfälle und Abhebungen, Antragskautionen und TEE-Signer konfigurieren
- Treasury-Strategien und die Verteilung der Einnahmen verwalten
- endBetaMode aufrufen und damit Upgrades und Abrechnungskorrekturen aus der Beta dauerhaft abschalten


## Während der Beta {#during-beta}
In der Beta gibt es einige zusätzliche Sicherheitsvorkehrungen – sozusagen Stützräder –, die Admin und Timelock erweiterte Befugnisse geben:

- Admin oder Timelock können den Settlement-Root korrigieren; dadurch kommt eine 3-tägige Anfechtungsfrist zum Antragsprozess hinzu

- Der Timelock kann Registry, USD8, Treasury und DefiInsurance upgraden

Beides entfällt, sobald die Beta endet.


## DeFi-Versicherung {#defi-insurance}
Die DeFi-Versicherung ist für alle USD8/sUSD8-Nutzer kostenlos. Die Höhe der Auszahlung kann jedoch je nach Versicherungsscore der Antragsteller und Größenlimit des Cover Pools variieren.

Deshalb haben wir den Prozess so gestaltet, dass Nutzer die Auszahlung frei annehmen oder ablehnen können, falls sie nicht ihren Erwartungen entspricht.


## Cover Pool {#cover-pool}
Cover Pools sind riskanter, weil aus ihnen die Erstattungen gezahlt werden. Unser Team prüft jeden einzelnen versicherten Token sorgfältig, um das Risiko so weit wie möglich zu senken – siehe [Wie senken Sie das Risiko für Cover-Pool-LPs?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk).

Cover-Pool-LPs sollten sich dieses Risikos bewusst sein.


## TEEs {#tees}
Das USD8-System berechnet die Deckung offchain in TEEs. Das aktuelle System hängt also von Servern ab, die wir betreiben. Künftig wollen wir jedoch auf ein vertrauensloses Setup mit zk-Coprozessor-Netzwerken umsteigen.


## Externe Dienste {#external-services}
USD8 ist für seinen Betrieb auf einige externe Dienste angewiesen, etwa

- Chainlink-Oracles
- RPC-Anbieter
- Server-/TEE-Anbieter (künftig wollen wir jedoch auf ein vertrauensloses zk-Coprozessor-Netzwerk umsteigen)
- DeFi-Renditequellen wie Aave, Morpho usw.

Probleme bei diesen Diensten können sich auch auf USD8 auswirken.
