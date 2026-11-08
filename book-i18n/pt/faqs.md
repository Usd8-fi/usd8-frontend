<h1 id="faqs" class="faq-title">Perguntas frequentes</h1>

## Então eu ganho seguro grátis com USD8 e sUSD8? {#so-i-get-free-insurance-from-usd8--susd8}

Sim, essa é a vantagem do USD8 em relação a outras stablecoins. Você ganha score de seguro a cada bloco: quanto mais USD8/sUSD8 você mantém, e por mais tempo, mais score acumula.

O ritmo de acúmulo varia: hoje, 1 USD8 gera 1 ponto de score por dia, enquanto 1 sUSD8 gera 0.1 ponto por dia.


## De onde vem o dinheiro das indenizações? {#where-does-the-insurance-payout-come-from}

As indenizações saem dos [pools de cobertura](./cover-pools.md), vaults de tokens abertos em que qualquer pessoa pode depositar. Hoje existem dois: [um com wstETH e outro com USD8](https://usd8.fi/#cover-pools).

Quem deposita é recompensado com um APY alto, financiado pelo rendimento da tesouraria do USD8. Em contrapartida, os depósitos podem ser usados para pagar indenizações se um token segurado cair mais de 20% em relação ao ativo subjacente, e cada incidente pode consumir até 50% do saldo de cada pool de cobertura. Alto risco, alto retorno.


## Quando posso usar meu score de seguro em um pedido de indenização? {#when-can-i-use-my-insurance-score-for-a-claim}

O score de seguro fica disponível 7 dias depois de ganho, e só o score disponível pode ser usado em um pedido de indenização.
  
## Eu tinha USD8, mas não tenho mais. Continuo segurado? {#i-had-usd8-before-but-not-now-am-i-still-insured}

Sim. Você deve ter acumulado algum score de seguro, e ele não expira. Você pode pedir indenização desde que seu score tenha pelo menos 7 dias.

## Quanto vou receber de indenização? {#how-much-payout-do-i-get}

Depende de: 1. seu score de seguro em comparação com o de quem pede indenização ao mesmo tempo; 2. o limite de tamanho do pool de cobertura.

Quanto mais score de seguro, maior o peso do seu pedido. A indenização máxima é de 80%, e você pode receber menos se tiver pouco score. Mas, se a indenização final for baixa demais, você sempre pode recusá-la e guardar seu score de seguro para usar no futuro.



## O que é preciso para pedir indenização? {#whats-needed-when-filing-a-claim}

- o token segurado pelo qual você vai pedir indenização
- score de seguro
- caução de 10 USD8, devolvida após o pedido se você for elegível
- Boosters (opcional)




## Como vocês reduzem o risco para os LPs dos pools de cobertura? {#how-do-you-reduce-the-cover-pool-lp-risk}

Os ativos dos pools de cobertura podem ser usados para pagar indenizações, o que aumenta o risco — por isso eles oferecem um APY mais alto. Para reduzir o risco dos pools de cobertura, nossa equipe:
- avalia de forma independente cada protocolo antes de oferecer seguro
- analisa as auditorias de terceiros de cada protocolo
- ajusta ou revoga a cobertura de cada protocolo com base em monitoramento contínuo

Não esperamos que pedidos de indenização sejam frequentes, mas a possibilidade sempre existe.



## O que muda durante o beta? {#whats-different-in-beta}
O beta tem algumas "rodinhas de segurança" que planejamos remover depois: durante o beta, o admin e o Timelock têm direitos e privilégios especiais.
- O admin ou o Timelock pode contestar a liquidação das indenizações de um incidente enviando uma nova raiz de liquidação (settlement root). Isso também acrescenta um prazo de contestação de 3 dias ao processo de indenização, que será removido depois do beta.
- O Timelock pode fazer upgrade de Registry, USD8, Treasury e DefiInsurance; planejamos remover essa possibilidade de upgrade depois do beta.


## O USD8 tem token de governança? {#does-usd8-has-a-governance-token}
No momento, não.

## Pode mostrar todos os riscos do USD8? {#show-all-the-risk-involved-in-usd8}
Claro, veja [Transparência](./transparency.md).

## Como o USD8 ganha dinheiro? {#how-does-usd8-make-money}
O USD8 tem várias fontes de receita:
- parte do rendimento da tesouraria do USD8
- 20% do que sobra das indenizações: como os solicitantes recebem no máximo 80% de cobertura, os 20% restantes ficam com o USD8 como taxa
- parte das perdas recuperadas por meio da [Economia White Hat](white-hat-economy.md)


## Como posso contribuir com o USD8? {#how-can-i-contribute-to-usd8}

Contribuições da comunidade são bem-vindas em design de mecanismos, parcerias, marketing e muito mais. Para compartilhar propostas, críticas ou ideias, [abra uma issue no repositório usd8-core](https://github.com/Usd8-fi/usd8-core/issues) ou entre no nosso [grupo do Telegram](https://t.me/+e84i2oYk1ao1MTk1) para conversar com a equipe. Quem contribui pode ganhar [Boosters](defi-insurance.md#boosters).

  
  

## Quem está por trás do USD8? {#who-is-behind-usd8}

O USD8 é desenvolvido por [@codephobic](https://x.com/codephobic), pesquisador de segurança com mais de 7 anos de experiência auditando os principais protocolos DeFi e L2s. 
