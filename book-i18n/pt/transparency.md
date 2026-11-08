# Transparência {#transparency}

Estas são as premissas de confiança e os riscos envolvidos no protocolo USD8. A maioria deles é comum em protocolos DeFi, mas optamos por declará-los abertamente aos nossos usuários.

## Admin e Timelock {#admin--timelock}
Os privilégios do admin foram reduzidos ao máximo já no design: as ações mais críticas passam pelo timelock, o que dá aos usuários tempo extra para reagir a qualquer mudança que esteja por vir.

O admin pode fazer configurações do sistema como:
- Alocar a tesouraria do USD8 em estratégias pré-aprovadas, mas sem poder adicionar estratégias diretamente
- Gerenciar pausas, pesos de receita, taxa do protocolo e limites de depósito dos pools de cobertura

O Timelock gerencia as configurações sensíveis do sistema:
- Adicionar ou remover admins, ou substituir o timelock
- Configurar pools, tokens segurados, score, oráculos, prazos de incidentes e de saída, cauções dos pedidos e signatários do TEE
- Gerenciar as estratégias da Treasury e a distribuição de receita.
- Chamar endBetaMode, em caráter permanente, desativando os upgrades e as correções de liquidação do beta


## Durante o beta {#during-beta}
O beta tem algumas "rodinhas de segurança" extras, que dão privilégios adicionais ao admin e ao timelock.

- O admin ou o Timelock pode corrigir a raiz de liquidação, o que também acrescenta um prazo de contestação de 3 dias ao processo de indenização

- O Timelock pode fazer upgrade de Registry, USD8, Treasury e DefiInsurance

Os dois privilégios serão removidos quando o beta terminar.


## Seguro DeFi {#defi-insurance}
O seguro DeFi é gratuito para todos os usuários de USD8/sUSD8, mas o valor da indenização pode variar conforme o score de seguro dos solicitantes e o limite de tamanho do pool de cobertura. 

Criamos um processo que dá ao usuário a liberdade de aceitar ou recusar a indenização caso ela fique abaixo do esperado.


## Pool de cobertura {#cover-pool}
Os pools de cobertura têm mais risco porque são usados para pagar indenizações. Nossa equipe avalia com cuidado cada token que seguramos para reduzir o risco ao máximo; veja [Como vocês reduzem o risco para os LPs dos pools de cobertura?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk). 

Os LPs dos pools de cobertura devem estar cientes desse risco.


## TEEs {#tees}
O sistema USD8 usa TEEs offchain para calcular a cobertura, o que significa que o sistema atual depende de servidores operados por nós. No futuro, porém, planejamos migrar para uma configuração trustless, usando redes de zk-coprocessadores.


## Serviços externos {#external-services}
O USD8 depende de alguns serviços externos para funcionar, como:

- Oráculos da Chainlink 
- Provedores de RPC
- Provedores de servidor/TEE (no futuro, porém, planejamos migrar para uma rede trustless de zk-coprocessadores)
- Fontes de rendimento DeFi como Aave, Morpho etc.

Qualquer problema nesses serviços também pode afetar o USD8. 
