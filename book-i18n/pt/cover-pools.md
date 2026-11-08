# Pools de cobertura {#cover-pools}

Os pools de cobertura são vaults públicos em que qualquer pessoa pode depositar e sacar a qualquer momento. Cada pool de cobertura:

- aceita um token específico como depósito, por exemplo wstETH
- paga um APY em USD8, financiado pelo rendimento da tesouraria do USD8
- tem tamanho limitado

<div class="example-box">
  Atenção: os ativos do pool de cobertura serão usados para pagar indenizações se qualquer token segurado sofrer uma queda de preço igual ou superior a 20%.
</div>


## Tokens segurados {#insured-tokens}

Os tokens segurados são avaliados, selecionados e ajustados com cuidado e de forma contínua. O USD8 aceita auditorias de segurança independentes ou certificações das seguintes fontes:

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Certificação SEAL da Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Saque {#withdraw}

O saque tem um período de espera de 7 dias e pode ser solicitado a qualquer momento em que não haja pedidos de indenização ativos. 

Se surgirem novos pedidos nesse período, o processo de saque fica pausado até o incidente ser resolvido, o que pode levar mais 9–12 dias durante o beta (6–9 dias depois do beta), contados a partir do primeiro pedido. Durante esse tempo, todos os ativos em período de espera continuam expostos ao pagamento das indenizações. 

Os ativos em período de espera não rendem e continuam cobrindo os pedidos. Terminado o período de espera, os ativos podem ser sacados a qualquer momento; a partir daí, eles não cobrem mais nenhum pedido nem rendem.


## Limite de indenização do seguro {#insurance-payout-limit}

Há um limite para o total de indenizações pagas pelo pool de cobertura em cada incidente, hoje definido em 50%: ou seja, a indenização máxima de cada incidente fica limitada a 50% do tamanho atual do pool de cobertura.
