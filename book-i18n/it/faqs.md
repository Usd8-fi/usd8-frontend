<h1 id="faqs" class="faq-title">FAQ</h1>

## Quindi con USD8 e sUSD8 ho un'assicurazione gratuita? {#so-i-get-free-insurance-from-usd8--susd8}

Sì, è questo il vantaggio di USD8 rispetto alle altre stablecoin. Maturi punteggio assicurativo a ogni blocco: più USD8/sUSD8 detieni e più a lungo li tieni, più punteggio accumuli.

Il ritmo di accumulo cambia da token a token: attualmente 1 USD8 ti fa guadagnare 1 punto al giorno, mentre 1 sUSD8 ne fa guadagnare 0.1.


## Da dove arrivano gli indennizzi? {#where-does-the-insurance-payout-come-from}

Gli indennizzi arrivano dai [Cover Pool](./cover-pools.md), vault di token aperti in cui chiunque può depositare. Oggi ce ne sono due: [uno con wstETH e uno con USD8](https://usd8.fi/#cover-pools).

Chi deposita viene ricompensato con un rendimento elevato, finanziato dal rendimento della tesoreria di USD8. Tuttavia, i depositi possono essere usati per pagare le richieste di risarcimento se un token assicurato perde più del 20% rispetto al sottostante, e ogni incidente può impiegare fino al 50% del saldo di ciascun Cover Pool. Alto rischio, alto rendimento.


## Quando posso usare il mio punteggio assicurativo per una richiesta? {#when-can-i-use-my-insurance-score-for-a-claim}

Il punteggio assicurativo diventa disponibile 7 giorni dopo essere stato maturato, e per una richiesta di risarcimento si può usare solo il punteggio disponibile.
  
## Avevo USD8 ma ora non più: sono ancora assicurato? {#i-had-usd8-before-but-not-now-am-i-still-insured}

Sì. Dovresti aver accumulato un po' di punteggio assicurativo, e il punteggio non scade. Puoi presentare richieste di risarcimento purché il tuo punteggio sia stato maturato da almeno 7 giorni.

## Quanto ricevo di indennizzo? {#how-much-payout-do-i-get}

Dipende da: 1. il tuo punteggio assicurativo rispetto a quello di chi presenta richieste nello stesso momento; 2. il limite di dimensione del Cover Pool.

Più punteggio assicurativo hai, più peso ha la tua richiesta. L'indennizzo massimo è l'80%: con un punteggio basso potresti ricevere meno, ma se l'indennizzo finale ti sembra troppo basso puoi sempre rifiutarlo e conservare il punteggio per il futuro.



## Cosa serve per presentare una richiesta di risarcimento? {#whats-needed-when-filing-a-claim}

- il token assicurato per cui chiedi il risarcimento
- punteggio assicurativo
- una cauzione di 10 USD8, rimborsata dopo la richiesta se soddisfi i requisiti
- Booster (facoltativi)




## Come riducete il rischio per chi fornisce liquidità ai Cover Pool? {#how-do-you-reduce-the-cover-pool-lp-risk}

Gli asset dei Cover Pool possono essere usati per coprire le richieste di risarcimento: per questo sono più rischiosi e offrono un rendimento più alto. Per ridurre il rischio dei Cover Pool, il nostro team:
- valuta in modo indipendente ogni protocollo prima di offrire l'assicurazione
- esamina gli audit di terze parti di ciascun protocollo
- modifica o revoca la copertura di ciascun protocollo in base a un monitoraggio continuo

Non ci aspettiamo richieste frequenti, ma la possibilità esiste sempre.



## Cosa cambia durante la beta? {#whats-different-in-beta}
La beta prevede alcune misure di sicurezza temporanee, che intendiamo rimuovere in seguito: durante la beta l'admin e il Timelock hanno diritti e privilegi speciali.
- L'admin o il Timelock possono contestare la liquidazione degli indennizzi di un incidente inviando una nuova settlement root. Per questo la procedura di risarcimento include anche una finestra di contestazione di 3 giorni, che verrà eliminata dopo la beta.
- Il Timelock può aggiornare (upgrade) Registry, USD8, Treasury e DefiInsurance; dopo la beta prevediamo di eliminare questa possibilità.


## USD8 ha un token di governance? {#does-usd8-has-a-governance-token}
Per il momento no.

## Quali sono tutti i rischi di USD8? {#show-all-the-risk-involved-in-usd8}
Li trovi elencati nella pagina [Trasparenza](./transparency.md).

## Come guadagna USD8? {#how-does-usd8-make-money}
USD8 ha diverse fonti di ricavo:
- una parte del rendimento della tesoreria di USD8
- il 20% che resta dopo gli indennizzi: i richiedenti ottengono una copertura massima dell'80%, e il restante 20% costituisce la commissione di USD8
- una parte delle perdite recuperate tramite la [White Hat Economy](white-hat-economy.md)


## Come posso contribuire a USD8? {#how-can-i-contribute-to-usd8}

I contributi della community sono benvenuti: progettazione dei meccanismi, partnership, marketing e altro ancora. Per condividere proposte, critiche o idee, [apri una issue nel repository usd8-core](https://github.com/Usd8-fi/usd8-core/issues) oppure unisciti al nostro [gruppo Telegram](https://t.me/+e84i2oYk1ao1MTk1) per discuterne con il team. Chi contribuisce può ottenere dei [Booster](defi-insurance.md#boosters).

  
  

## Chi c'è dietro USD8? {#who-is-behind-usd8}

USD8 è sviluppato da [@codephobic](https://x.com/codephobic), ricercatore di sicurezza con oltre 7 anni di esperienza nell'audit dei principali protocolli DeFi e L2.
  
