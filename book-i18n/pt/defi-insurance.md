# Seguro DeFi {#defi-insurance}

- quem tem USD8 e sUSD8 ganha score de seguro a cada bloco
- o score de seguro pode ser usado para pedir indenização por diversos tokens DeFi segurados, incluindo USD8 e sUSD8
- quanto mais score, maior a indenização: até 80% do valor, respeitando o limite do pool de cobertura
- o score é intransferível e nunca expira
- o dinheiro das indenizações vem dos [pools de cobertura](./cover-pools.md)

<div class="example-box">
<p>Ex.: suponha que o aUSDC da Aave seja um token segurado com cobertura máxima de 80%</p>
<ol>
<li>o aUSDC cai de 1 para 0.3 em relação ao USDC</li>
<li>quem tem score de seguro recebe até 0.8 USDC em valor, em ativos do pool de cobertura, em troca do seu aUSDC</li>
</ol>
</div>

## Processo de indenização {#claim-process}

O pedido de indenização tem 3 etapas, que combinam processos onchain e offchain (TEE), e leva cerca de 9–12 dias durante o beta e 6–9 dias depois do beta. É importante não perder nenhum prazo. 


### 1 Fazer o pedido {#1-file-a-claim}

Qualquer pessoa pode pedir indenização se:
1. o preço TWAP de 24 h de um token segurado caiu mais de 20% entre duas janelas consecutivas, nos últimos 1 a 6 dias;
2. o solicitante tem score de seguro ainda não usado, ganho pelo menos 7 dias antes da queda de preço;
3. o solicitante manteve o token segurado por no mínimo 7 dias antes da queda de preço.

Também é exigida uma caução de 10 USD8, devolvida integralmente se as condições 2 e 3 forem cumpridas. Você não precisa informar quando a queda aconteceu: nosso TEE encontra a queda e identifica sozinho o bloco exato.


Importante: o prazo para pedidos fecha 3 dias após o primeiro pedido válido; depois disso, não é possível fazer nenhum novo pedido para esse token segurado.


### 2 Liquidar os pedidos {#2-settle-claims}
Qualquer pessoa pode liquidar os pedidos enviando uma atestação do TEE, que usa um algoritmo de código aberto para calcular o score de seguro e a indenização de cada solicitante. Os resultados são totalmente verificáveis. 

A indenização de cada pessoa é calculada com base em:

1. score de seguro do solicitante em relação ao score total de todos os solicitantes
2. limite do pool de cobertura
3. cobertura máxima do token segurado

<div class="example-box">
<p>Ex.: há 2 solicitantes: A tem 100 de score e B tem 200, e os dois deixaram em custódia US$ 500 em tokens segurados com cobertura máxima de 80%. Hoje o pool de cobertura tem US$ 2250 em ativos.</p>
<ol>
<li>o limite do pool de cobertura está definido hoje em 50%, então é possível usar US$ 1125 no total. Desse valor, 80% (US$ 900) é o orçamento para cobrir os pedidos. Como A tem metade do score de B, A pode receber até US$ 300 e B, até US$ 600</li>
<li>A e B deixaram em custódia US$ 500 em tokens segurados cada um; com cobertura máxima de 80%, a indenização de cada um pela perda fica limitada a US$ 400</li>
<li>A recebe US$ 300 de indenização, e B, US$ 400</li>
</ol>
</div>

O prazo de liquidação fica aberto por no máximo 3 dias; assim que a liquidação acontece, os usuários já podem concluir suas indenizações. Se não houver liquidação, os solicitantes podem retirar os tokens em custódia, e nenhum score de seguro é gasto.

Durante o beta, o admin tem mais 3 dias após a liquidação para verificar e contestar com uma nova liquidação assinada pelo TEE. É uma medida de segurança para garantir que não exista nenhum bug malicioso na liquidação.


### 3 Concluir as indenizações {#3-finalize-payouts}
Nesta etapa, os solicitantes têm 3 dias para aceitar a indenização. Quem aceitar:

1. abre mão dos tokens segurados em custódia e do score de seguro
2. recebe ativos do(s) pool(s) de cobertura com valor total em USD equivalente à indenização a que tem direito

Quem não aceitar a indenização pode retirar os tokens em custódia e mantém o score de seguro.

Aceitando ou não, a caução é devolvida desde que as condições da caução tenham sido cumpridas.

Importante: o prazo de indenização é de 3 dias; depois disso, todos os pedidos pendentes são considerados não aceitos, e os solicitantes podem retirar os tokens em custódia.

## TEE {#tee}
O USD8 usa um enclave seguro da Amazon que roda offchain um algoritmo de código aberto para calcular e assinar as indenizações. Qualquer pessoa pode acionar o TEE e enviar o resultado onchain, onde a assinatura do TEE é verificada antes de o resultado final ser aceito. Como o algoritmo é de código aberto, qualquer pessoa pode verificar o resultado publicamente. 

No futuro, planejamos migrar para uma rede de zk-coprocessadores como a [Brevis](https://brevis.network/) para passar no [walkaway test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).


## Boosters {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="Arte do NFT Booster do USD8" /><br/><br/>
Os [Boosters](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) são NFTs que você pode adicionar ao fazer um pedido de indenização; cada um dá um bônus de 1% ao seu score de seguro total. Os Boosters elegíveis são queimados quando você aceita a indenização; os demais são devolvidos. Dá para acumular vários Boosters. Eles não estão à venda: são emitidos apenas para os primeiros usuários que ajudam o USD8 a crescer. Siga a gente no [X](https://x.com/usd8_fi) e no [Telegram](https://t.me/+e84i2oYk1ao1MTk1).

Digite um endereço Ethereum para verificar os Boosters

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Verificar</button>
<div id="booster-result" class="booster-result"></div>
</div>
