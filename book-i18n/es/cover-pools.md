# Pools de cobertura {#cover-pools}

Los pools de cobertura son vaults públicos en los que cualquiera puede depositar y retirar en cualquier momento. Cada pool de cobertura

- acepta como depósito un token concreto, p. ej. wstETH
- paga un APY en USD8, financiado con el rendimiento de la tesorería de USD8
- tiene un tamaño máximo

<div class="example-box">
  Advertencia: si cualquier token asegurado sufre una caída de precio igual o superior al 20 %, los activos del pool de cobertura se usarán para cubrir las reclamaciones.
</div>


## Tokens asegurados {#insured-tokens}

Los tokens asegurados se evalúan y seleccionan con cuidado, y se revisan de forma continua. USD8 acepta auditorías de seguridad o certificaciones independientes de estas fuentes:

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Certificación SEAL de Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Retiro {#withdraw}

Los retiros tienen un período de espera de 7 días y puedes solicitarlos en cualquier momento, siempre que no haya reclamaciones activas. 

Si durante ese período se presentan nuevas reclamaciones, el retiro queda en pausa hasta que se resuelva el incidente, lo que puede llevar otros 9–12 días durante la beta (6–9 días después de la beta) contados desde la primera reclamación. Mientras tanto, todos los activos en período de espera siguen expuestos a las indemnizaciones del seguro. 

Los activos en período de espera no generan rendimiento y siguen cubriendo reclamaciones. Cuando termina el período de espera, puedes retirarlos en cualquier momento; a partir de entonces ya no cubren reclamaciones ni generan rendimiento.


## Límite de indemnización del seguro {#insurance-payout-limit}

La indemnización total que puede salir del pool de cobertura en cada incidente tiene un límite, fijado actualmente en el 50 %: como máximo, cada incidente puede pagar el 50 % del tamaño que tenga en ese momento el pool de cobertura.
