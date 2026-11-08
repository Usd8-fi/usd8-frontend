# Assicurazione DeFi {#defi-insurance}

- chi detiene USD8 e sUSD8 matura punteggio assicurativo a ogni blocco
- con il punteggio assicurativo puoi presentare richieste di risarcimento per diversi token DeFi assicurati, inclusi USD8 e sUSD8
- più punteggio hai, più alto è l'indennizzo: fino all'80% del valore, entro il limite del Cover Pool
- il punteggio non è trasferibile e non scade mai
- gli indennizzi vengono pagati dai [Cover Pool](./cover-pools.md)

<div class="example-box">
<p>Es. supponiamo che aUSDC di Aave sia un token assicurato con una copertura massima dell'80%</p>
<ol>
<li>il valore di aUSDC in USDC scende da 1 a 0.3</li>
<li>chi ha punteggio assicurativo può ricevere fino a 0.8 USDC di valore in asset del Cover Pool, cedendo in cambio i propri aUSDC</li>
</ol>
</div>

## Come funziona una richiesta di risarcimento {#claim-process}

Una richiesta di risarcimento si svolge in 3 fasi, che combinano passaggi onchain e offchain (TEE), e richiede circa 9-12 giorni durante la beta e 6-9 giorni dopo. È importante rispettare tutte le scadenze.


### 1 Presentare una richiesta {#1-file-a-claim}

Chiunque può presentare una richiesta di risarcimento se:
1. negli ultimi 1-6 giorni il prezzo TWAP a 24 ore di un token assicurato è sceso di oltre il 20% tra due finestre consecutive;
2. il richiedente ha punteggio assicurativo non speso, maturato almeno 7 giorni prima del calo di prezzo;
3. il richiedente deteneva il token assicurato da almeno 7 giorni prima del calo di prezzo.

È richiesta anche una cauzione di 10 USD8, rimborsata per intero se le condizioni 2 e 3 sono soddisfatte. Non devi indicare quando è avvenuto il calo: è il nostro TEE a individuarlo e a stabilirne il blocco esatto.


Importante: la finestra per le richieste si chiude 3 giorni dopo la prima richiesta valida; da quel momento non se ne possono più presentare per quel token assicurato.


### 2 Liquidare le richieste {#2-settle-claims}
Chiunque può liquidare le richieste inviando un'attestazione del TEE, che con un algoritmo open source calcola il punteggio assicurativo e l'indennizzo di ogni richiedente. I risultati sono interamente verificabili.

L'indennizzo di ciascun richiedente dipende da:

1. il punteggio assicurativo del richiedente rispetto al punteggio totale di tutti i richiedenti
2. il limite del Cover Pool
3. la copertura massima del token assicurato

<div class="example-box">
<p>Es. ci sono 2 richiedenti: A ha un punteggio di 100 e B di 200, ed entrambi hanno vincolato token assicurati per un valore di $500, con una copertura massima dell'80%. Il Cover Pool contiene attualmente asset per $2250.</p>
<ol>
<li>il limite del Cover Pool è attualmente fissato al 50%, quindi in totale si possono usare $1125; l'80% di questa cifra, cioè $900, è il budget per coprire le richieste. Poiché A ha metà del punteggio di B, A può ricevere fino a $300 e B fino a $600</li>
<li>Sia A sia B hanno vincolato token assicurati per $500: con la copertura massima dell'80%, il risarcimento per la loro perdita è limitato a $400.</li>
<li>A riceve un indennizzo di $300, B di $400</li>
</ol>
</div>

La finestra di liquidazione resta aperta al massimo 3 giorni; appena la liquidazione è avvenuta, gli utenti possono finalizzare i propri indennizzi. Se non viene liquidata, i richiedenti possono ritirare i token vincolati e nessun punteggio assicurativo viene speso.

Durante la beta, dopo la liquidazione l'admin ha altri 3 giorni per verificarla ed eventualmente contestarla con una nuova liquidazione firmata dal TEE. È una misura di sicurezza per garantire che la liquidazione non contenga bug malevoli.


### 3 Finalizzare gli indennizzi {#3-finalize-payouts}
In questa fase i richiedenti hanno 3 giorni per accettare l'indennizzo. Chi lo accetta:

1. rinuncia ai token assicurati vincolati e al punteggio assicurativo
2. riceve uno o più asset del Cover Pool per un valore totale in USD pari all'indennizzo spettante

Chi non accetta l'indennizzo può ritirare i token vincolati e conservare il proprio punteggio assicurativo.

Che i richiedenti finalizzino o meno, la cauzione viene restituita purché ne siano soddisfatte le condizioni.

Importante: la finestra per gli indennizzi dura 3 giorni; scaduto questo termine, tutte le richieste in sospeso si considerano non accettate e i richiedenti possono ritirare i token vincolati.

## TEE {#tee}
USD8 usa un'enclave sicura di Amazon che esegue offchain un algoritmo open source per calcolare e firmare gli indennizzi. Chiunque può attivare il TEE e inviare il risultato onchain, dove la firma del TEE viene verificata prima che il risultato finale sia accettato. Poiché l'algoritmo è open source, chiunque può verificare pubblicamente il risultato.

In futuro prevediamo di passare a una rete di zk-coprocessor come [Brevis](https://brevis.network/) per superare il [walkaway test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).


## Booster {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="Illustrazione dell'NFT Booster di USD8" /><br/><br/>
I [Booster](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) sono NFT che puoi aggiungere quando presenti una richiesta di risarcimento: ognuno aumenta dell'1% il tuo punteggio assicurativo totale. I Booster idonei vengono bruciati quando accetti l'indennizzo; gli altri ti vengono restituiti. Puoi cumulare più Booster. I Booster non sono in vendita: vengono coniati solo per i primi utenti che aiutano USD8 a crescere. Seguici su [X](https://x.com/usd8_fi) e [Telegram](https://t.me/+e84i2oYk1ao1MTk1).

Inserisci un indirizzo Ethereum per verificare i Booster

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Verifica</button>
<div id="booster-result" class="booster-result"></div>
</div>
