# Transparencia {#transparency}

Estos son los supuestos de confianza y los riesgos del protocolo USD8. La mayoría son habituales en los protocolos DeFi, pero preferimos dejarlos claros desde el principio.

## Administrador y Timelock {#admin--timelock}
Al diseñar el protocolo, redujimos al mínimo los privilegios del administrador: la mayoría de las acciones críticas pasan por el Timelock, que da a los usuarios tiempo adicional para reaccionar ante cualquier cambio que se avecine.

El administrador puede realizar ajustes del sistema como 
- Destinar la tesorería de USD8 a estrategias aprobadas previamente, aunque no puede añadir estrategias directamente 
- Gestionar las pausas, los pesos de los ingresos, la comisión del protocolo y los límites de depósito de los pools de cobertura

El Timelock gestiona los ajustes sensibles del sistema
- Añadir o retirar administradores, o sustituir el Timelock
- Configurar pools, tokens asegurados, puntuación, oráculos, plazos de los incidentes y de las salidas, fianzas de reclamación y firmantes del TEE
- Gestionar las estrategias de Treasury y el reparto de los ingresos.
- Llamar a endBetaMode, lo que desactiva para siempre las actualizaciones y las correcciones de liquidación de la beta


## Durante la beta {#during-beta}
La beta incluye algunas medidas de seguridad provisionales que dan privilegios adicionales al administrador y al Timelock.

- El administrador o el Timelock pueden corregir la raíz de liquidación, lo que además añade un plazo de impugnación de 3 días al proceso de reclamación

- El Timelock puede actualizar Registry, USD8, Treasury y DefiInsurance

Ambas desaparecerán cuando termine la beta.


## Seguro DeFi {#defi-insurance}
El seguro DeFi es gratuito para todos los usuarios de USD8/sUSD8, pero el importe de la indemnización puede variar según la puntuación de seguro de los reclamantes y el límite de tamaño del pool de cobertura. 

Por eso diseñamos un proceso en el que cada usuario puede aceptar o rechazar la indemnización si no cumple sus expectativas.


## Pool de cobertura {#cover-pool}
Los pools de cobertura son más arriesgados porque se usan para cubrir reclamaciones. Nuestro equipo evalúa con cuidado cada token que aseguramos para reducir el riesgo todo lo posible; consulta [¿Cómo reducen el riesgo para los LP de los pools de cobertura?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk). 

Los LP de los pools de cobertura deben conocer este riesgo.


## TEE {#tees}
El sistema USD8 calcula la cobertura con TEE offchain, así que hoy depende de servidores que operamos nosotros. Aun así, planeamos pasar más adelante a un sistema trustless basado en redes de zk-coprocesadores.


## Servicios externos {#external-services}
Para funcionar, USD8 depende de algunos servicios externos, como 

- Oráculos de Chainlink 
- Proveedores de RPC
- Proveedores de servidores/TEE (aunque planeamos pasar más adelante a una red trustless de zk-coprocesadores)
- Fuentes de rendimiento DeFi como Aave, Morpho, etc.

Cualquier problema en estos servicios también podría afectar a USD8.
