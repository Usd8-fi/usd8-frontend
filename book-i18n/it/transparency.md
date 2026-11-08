# Trasparenza {#transparency}

Ecco le ipotesi di fiducia e i rischi del protocollo USD8. Sono per lo più comuni ai protocolli DeFi, ma scegliamo di dichiararli apertamente ai nostri utenti.

## Admin e Timelock {#admin--timelock}
In fase di progettazione abbiamo ridotto il più possibile i privilegi dell'admin: le azioni più critiche passano dal Timelock, che lascia agli utenti più tempo per reagire alle modifiche in arrivo.

L'admin può gestire impostazioni di sistema come:
- impiegare la tesoreria di USD8 in strategie pre-approvate, senza però poter aggiungere direttamente nuove strategie
- gestire la pausa, i pesi dei ricavi, la commissione del protocollo e i limiti di deposito dei Cover Pool

Il Timelock gestisce le impostazioni di sistema sensibili:
- aggiungere/rimuovere admin o sostituire il Timelock
- configurare pool, token assicurati, punteggio, oracoli, tempistiche di incidenti e uscite, cauzioni delle richieste di risarcimento e firmatari TEE
- gestire le strategie della tesoreria (Treasury) e la distribuzione dei ricavi
- chiamare endBetaMode, che disattiva in modo permanente gli upgrade e le correzioni delle liquidazioni previste in beta


## Durante la beta {#during-beta}
La beta prevede alcune misure di sicurezza temporanee in più, che danno all'admin e al Timelock privilegi extra.

- L'admin o il Timelock possono correggere la settlement root; per questo la procedura di risarcimento include anche una finestra di contestazione di 3 giorni

- Il Timelock può aggiornare (upgrade) Registry, USD8, Treasury e DefiInsurance

Entrambe le misure verranno eliminate al termine della beta.


## Assicurazione DeFi {#defi-insurance}
L'assicurazione DeFi è gratuita per tutti gli utenti di USD8/sUSD8, ma l'importo dell'indennizzo può variare in base al punteggio assicurativo dei richiedenti e al limite di dimensione del Cover Pool.

Per questo abbiamo previsto una procedura che lascia agli utenti la libertà di accettare o rifiutare l'indennizzo, se non è all'altezza delle aspettative.


## Cover Pool {#cover-pool}
I Cover Pool sono più rischiosi perché servono a coprire le richieste di risarcimento. Per ridurre il più possibile il rischio, il nostro team valuta con cura ogni singolo token che assicuriamo; vedi [Come riducete il rischio per chi fornisce liquidità ai Cover Pool?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk).

Chi fornisce liquidità ai Cover Pool deve essere consapevole del rischio.


## TEE {#tees}
Il sistema USD8 usa TEE offchain per calcolare la copertura: oggi, quindi, si basa su server gestiti da noi. In futuro prevediamo però di passare a una configurazione trustless basata su reti di zk-coprocessor.


## Servizi esterni {#external-services}
Per funzionare, USD8 si affida ad alcuni servizi esterni, come:

- gli oracoli Chainlink
- i provider RPC
- i provider di server/TEE (in futuro prevediamo comunque di passare a una rete trustless di zk-coprocessor)
- le fonti di rendimento DeFi come Aave, Morpho ecc.

Eventuali problemi di questi servizi potrebbero avere ripercussioni anche su USD8.
