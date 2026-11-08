# Cover Pool {#cover-pools}

I Cover Pool sono vault pubblici in cui chiunque può depositare e da cui può prelevare in qualsiasi momento. Ogni Cover Pool:

- accetta in deposito un token specifico, ad es. wstETH
- paga un rendimento (APY) in USD8, finanziato dal rendimento della tesoreria di USD8
- ha una dimensione massima

<div class="example-box">
  Attenzione: se un token assicurato subisce un calo di prezzo pari o superiore al 20%, gli asset del Cover Pool verranno usati per coprire le richieste di risarcimento.
</div>


## Token assicurati {#insured-tokens}

I token assicurati vengono valutati e selezionati con cura, e rivisti costantemente. USD8 riconosce gli audit di sicurezza indipendenti o le certificazioni delle seguenti fonti:

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Certificazione SEAL di Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Prelievo {#withdraw}

Il prelievo prevede un periodo di attesa di 7 giorni e si può richiedere in qualsiasi momento, purché non ci siano richieste di risarcimento attive.

Se nel frattempo vengono presentate nuove richieste, il prelievo resta sospeso fino alla risoluzione dell'incidente, il che può richiedere altri 9-12 giorni durante la beta (6-9 giorni dopo la beta) dalla prima richiesta. In questo periodo tutti gli asset in attesa restano esposti agli indennizzi.

Gli asset in periodo di attesa non generano rendimento e continuano a coprire le richieste. Terminata l'attesa, puoi prelevarli in qualsiasi momento: da lì in poi non coprono più alcuna richiesta e non generano più rendimento.


## Limite di indennizzo {#insurance-payout-limit}

L'indennizzo totale che il Cover Pool può pagare per ciascun incidente ha un limite, attualmente fissato al 50%: per ogni incidente si può pagare al massimo il 50% della dimensione attuale del Cover Pool.
