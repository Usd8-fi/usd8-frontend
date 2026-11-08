<h1 id="faqs" class="faq-title">Preguntas frecuentes</h1>

## ¿De verdad USD8 y sUSD8 me dan un seguro gratis? {#so-i-get-free-insurance-from-usd8--susd8}

Sí, esa es la ventaja de USD8 frente a otras stablecoins. Ganas puntuación de seguro en cada bloque: cuanto más USD8/sUSD8 tengas y durante más tiempo, más puntuación acumulas.

El ritmo varía según el token: actualmente 1 USD8 te da 1 punto al día y 1 sUSD8, 0.1 puntos al día.


## ¿De dónde sale el dinero de las indemnizaciones? {#where-does-the-insurance-payout-come-from}

Las indemnizaciones se pagan con los [pools de cobertura](./cover-pools.md), vaults de tokens abiertos en los que cualquiera puede depositar. Hoy hay dos: [uno con wstETH y otro con USD8](https://usd8.fi/#cover-pools).

Quienes depositan reciben un APY alto, financiado con el rendimiento de la tesorería de USD8. A cambio, sus depósitos pueden usarse para pagar reclamaciones si un token asegurado cae más de un 20 % frente a su activo subyacente, y cada incidente puede usar hasta el 50 % del saldo de cada pool de cobertura. Alto riesgo, alta rentabilidad.


## ¿Cuándo puedo usar mi puntuación de seguro en una reclamación? {#when-can-i-use-my-insurance-score-for-a-claim}

La puntuación de seguro pasa a estar disponible 7 días después de ganarla, y en una reclamación solo puedes usar puntuación disponible.
  
## Antes tenía USD8 pero ahora no, ¿sigo asegurado? {#i-had-usd8-before-but-not-now-am-i-still-insured}

Sí. Tendrás puntuación de seguro acumulada, y no caduca. Puedes presentar reclamaciones siempre que tu puntuación tenga al menos 7 días.

## ¿Cuánto me pagarán? {#how-much-payout-do-i-get}

Depende de 1. tu puntuación de seguro frente a la de los demás que reclaman a la vez y 2. el límite de tamaño del pool de cobertura.

Cuanta más puntuación de seguro tengas, más peso tendrá tu reclamación. La indemnización máxima es del 80 % y, si tu puntuación es baja, podrías recibir menos. Aun así, si la indemnización final te parece demasiado baja, siempre puedes rechazarla y conservar tu puntuación de seguro para más adelante.



## ¿Qué necesito para presentar una reclamación? {#whats-needed-when-filing-a-claim}

- el token asegurado por el que reclamas
- puntuación de seguro
- una fianza de 10 USD8, que se reembolsa tras la reclamación si cumplías los requisitos
- Boosters (opcional)




## ¿Cómo reducen el riesgo para los LP de los pools de cobertura? {#how-do-you-reduce-the-cover-pool-lp-risk}

Los activos de un pool de cobertura pueden destinarse a cubrir reclamaciones, lo que los hace más arriesgados; por eso ofrecen un APY más alto. Para reducir el riesgo de los pools de cobertura, nuestro equipo 
- evalúa por su cuenta cada protocolo antes de asegurarlo
- revisa las auditorías externas de cada protocolo
- ajusta o retira la cobertura de cada protocolo según la supervisión continua

No esperamos que haya reclamaciones a menudo, pero la posibilidad siempre existe.



## ¿Qué cambia durante la beta? {#whats-different-in-beta}
La beta incluye algunas medidas de seguridad provisionales que planeamos retirar después; mientras dure, el administrador y el Timelock tienen derechos y privilegios especiales.
- El administrador o el Timelock pueden impugnar la liquidación de las indemnizaciones de un incidente enviando una nueva raíz de liquidación. Esto añade además un plazo de impugnación de 3 días al proceso de reclamación, que desaparecerá después de la beta.
- El Timelock puede actualizar Registry, USD8, Treasury y DefiInsurance; tras la beta planeamos eliminar esta posibilidad de actualización.


## ¿USD8 tiene token de gobernanza? {#does-usd8-has-a-governance-token}
Por ahora no.

## ¿Cuáles son todos los riesgos de USD8? {#show-all-the-risk-involved-in-usd8}
Los detallamos en [Transparencia](./transparency.md).

## ¿Cómo gana dinero USD8? {#how-does-usd8-make-money}
USD8 tiene varias fuentes de ingresos: 
- una parte del rendimiento de la tesorería de USD8
- el 20 % sobrante de cada indemnización: como los reclamantes reciben como máximo un 80 % de cobertura, el 20 % restante queda para USD8 como comisión.
- una parte de las pérdidas recuperadas gracias a la [Economía White Hat](white-hat-economy.md)


## ¿Cómo puedo contribuir a USD8? {#how-can-i-contribute-to-usd8}

Las contribuciones de la comunidad son bienvenidas: diseño de mecanismos, alianzas, marketing y mucho más. Si tienes propuestas, críticas o ideas, [abre un issue en el repositorio usd8-core](https://github.com/Usd8-fi/usd8-core/issues) o únete a nuestro [grupo de Telegram](https://t.me/+e84i2oYk1ao1MTk1) para comentarlas con el equipo. Quienes contribuyen pueden ganar [Boosters](defi-insurance.md#boosters).

  
  

## ¿Quién está detrás de USD8? {#who-is-behind-usd8}

USD8 lo ha creado [@codephobic](https://x.com/codephobic), investigador de seguridad con más de 7 años de experiencia auditando los principales protocolos DeFi y L2. 
