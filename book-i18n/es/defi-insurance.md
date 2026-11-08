# Seguro DeFi {#defi-insurance}

- quienes tienen USD8 o sUSD8 ganan puntuación de seguro en cada bloque
- con la puntuación de seguro puedes presentar reclamaciones por diversos tokens DeFi asegurados, incluidos USD8 y sUSD8
- cuanta más puntuación, mayor indemnización: hasta el 80 % del valor, sujeto al límite del pool de cobertura
- la puntuación no es transferible y nunca caduca
- las indemnizaciones se pagan con los fondos de los [pools de cobertura](./cover-pools.md)

<div class="example-box">
<p>Ejemplo: supongamos que el aUSDC de Aave es un token asegurado con una cobertura máxima del 80 %</p>
<ol>
<li>el precio de aUSDC frente a USDC cae de 1 a 0.3</li>
<li>a cambio de su aUSDC, un usuario con puntuación de seguro recibe hasta el equivalente a 0.8 USDC en activos del pool de cobertura</li>
</ol>
</div>

## Proceso de reclamación {#claim-process}

La reclamación consta de 3 pasos que combinan procesos onchain y offchain (TEE), y dura unos 9–12 días durante la beta y 6–9 días después de ella. Es importante no dejar pasar ningún plazo. 


### 1 Presentar una reclamación {#1-file-a-claim}

Cualquiera puede presentar una reclamación si
1. el precio TWAP de 24 h de un token asegurado cayó más de un 20 % entre dos períodos consecutivos en los últimos 1–6 días
2. el reclamante tiene puntuación de seguro sin gastar que obtuvo al menos 7 días antes de la caída del precio
3. el reclamante tenía el token asegurado desde al menos 7 días antes de la caída del precio

Además, hay que depositar una fianza de 10 USD8, que se reembolsa íntegramente si se cumplen las condiciones 2 y 3. No tienes que indicar cuándo se produjo la caída: nuestro TEE la detecta y determina por sí mismo el bloque exacto.


Importante: el plazo de reclamación se cierra 3 días después de la primera reclamación válida; a partir de ese momento ya no se pueden presentar reclamaciones por ese token asegurado.


### 2 Liquidar las reclamaciones {#2-settle-claims}
Cualquiera puede liquidar una reclamación enviando una atestación del TEE, que calcula la puntuación de seguro y la indemnización de cada reclamante con un algoritmo de código abierto. Los resultados son totalmente verificables. 

La indemnización de cada reclamante se calcula en función de

1. su puntuación de seguro frente a la puntuación total de todos los reclamantes
2. el límite del pool de cobertura
3. la cobertura máxima del token asegurado

<div class="example-box">
<p>Ejemplo: hay 2 reclamantes, A con 100 de puntuación y B con 200, y ambos depositaron en garantía $500 en tokens asegurados con una cobertura máxima del 80 %. El pool de cobertura tiene ahora $2250 en activos.</p>
<ol>
<li>el límite del pool de cobertura está fijado actualmente en el 50 %, así que se pueden usar $1125 en total, y el 80 % de esa cantidad ($900) es el presupuesto para cubrir reclamaciones. Como A tiene la mitad de puntuación que B, A puede reclamar hasta $300 y B hasta $600</li>
<li>A y B depositaron en garantía $500 en tokens asegurados cada uno; con una cobertura máxima del 80 %, lo que pueden reclamar por su pérdida tiene un tope de $400.</li>
<li>A recibirá $300 de indemnización y B, $400</li>
</ol>
</div>

El plazo de liquidación permanece abierto un máximo de 3 días; en cuanto se liquida, los usuarios pueden finalizar sus indemnizaciones. Si no se liquida, los reclamantes pueden retirar los tokens que tienen en garantía y no se gasta puntuación de seguro.

Durante la beta, el administrador dispone de 3 días más tras la liquidación para verificarla e impugnarla con una nueva liquidación firmada por el TEE. Es una medida de seguridad para asegurarnos de que no haya errores de liquidación que puedan aprovecharse de forma maliciosa.


### 3 Finalizar las indemnizaciones {#3-finalize-payouts}
En esta fase, los reclamantes tienen 3 días para aceptar la indemnización. Si la aceptan,

1. renuncian a los tokens asegurados que tienen en garantía y a la puntuación de seguro
2. reciben uno o varios activos del pool de cobertura por un valor total en USD igual a la indemnización que les corresponde

Si deciden no aceptarla, pueden retirar los tokens que tienen en garantía y conservar su puntuación de seguro.

Tanto si la finalizan como si no, la fianza se devuelve siempre que se cumplan sus condiciones.

Importante: el plazo de indemnización es de 3 días; pasado ese plazo, todas las reclamaciones pendientes se consideran no aceptadas y los reclamantes pueden retirar los tokens que tienen en garantía.

## TEE {#tee}
USD8 usa un enclave seguro de Amazon que ejecuta offchain un algoritmo de código abierto para calcular y firmar las indemnizaciones. Cualquiera puede activar el TEE y enviar el resultado onchain, donde se verifica la firma del TEE antes de aceptar el resultado final. Como el algoritmo es de código abierto, cualquiera puede verificar públicamente el resultado. 

Más adelante planeamos pasar a una red de zk-coprocesadores como [Brevis](https://brevis.network/) para superar el [walkaway test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).


## Boosters {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="Ilustración del NFT Booster de USD8" /><br/><br/>
Los [Boosters](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) son NFT que puedes añadir al presentar una reclamación; cada uno aumenta un 1 % tu puntuación de seguro total. Los Boosters elegibles se queman cuando aceptas la indemnización; el resto se te devuelve. Puedes acumular varios. Los Boosters no se venden: solo se acuñan para los primeros usuarios que ayudan a USD8 a crecer. Síguenos en [X](https://x.com/usd8_fi) y [Telegram](https://t.me/+e84i2oYk1ao1MTk1).

Introduce una dirección de Ethereum para ver sus Boosters

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Comprobar</button>
<div id="booster-result" class="booster-result"></div>
</div>
