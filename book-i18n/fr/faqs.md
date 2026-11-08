<h1 id="faqs" class="faq-title">FAQ</h1>

## USD8 et sUSD8 me donnent donc une assurance gratuite ? {#so-i-get-free-insurance-from-usd8--susd8}

Oui, c’est l’avantage d’USD8 par rapport aux autres stablecoins. Vous gagnez du score d’assurance à chaque bloc : plus vous détenez d’USD8/sUSD8, et plus longtemps, plus votre score augmente.

Le rythme d’accumulation varie : actuellement, 1 USD8 vous rapporte 1 point de score par jour, et 1 sUSD8, 0.1 point par jour.


## D’où vient l’argent des indemnisations ? {#where-does-the-insurance-payout-come-from}

Les indemnisations sont versées par les [pools de couverture](./cover-pools.md), des vaults de tokens ouverts dans lesquels chacun peut déposer. Il en existe aujourd’hui deux : [l’un en wstETH, l’autre en USD8](https://usd8.fi/#cover-pools).

Les déposants sont rémunérés par un APY élevé, financé par le rendement de la trésorerie d’USD8. En contrepartie, leurs dépôts peuvent servir à payer les demandes si un token assuré chute de plus de 20 % par rapport à son actif sous-jacent, et chaque incident peut mobiliser jusqu’à 50 % du solde de chaque pool de couverture. Risque élevé, rendement élevé.


## Quand puis-je utiliser mon score d’assurance pour une demande ? {#when-can-i-use-my-insurance-score-for-a-claim}

Le score d’assurance devient disponible 7 jours après avoir été gagné, et seul le score disponible peut servir à une demande.
  
## J’avais des USD8 mais je n’en ai plus : suis-je toujours assuré ? {#i-had-usd8-before-but-not-now-am-i-still-insured}

Oui. Vous avez normalement accumulé du score d’assurance, et il n’expire pas. Vous pouvez déposer des demandes dès lors que votre score a au moins 7 jours.

## Combien vais-je toucher ? {#how-much-payout-do-i-get}

Cela dépend 1. de votre score d’assurance comparé à celui des autres demandeurs au même moment, et 2. du plafond de taille du pool de couverture.

Plus votre score d’assurance est élevé, plus votre demande pèse. L’indemnisation maximale est de 80 % ; avec un score faible, vous pourriez recevoir moins. Mais si l’indemnisation finale vous semble trop basse, vous pouvez toujours la refuser et conserver votre score d’assurance pour plus tard.



## Que faut-il pour déposer une demande ? {#whats-needed-when-filing-a-claim}

- le token assuré concerné par votre demande
- du score d’assurance
- une caution de 10 USD8, remboursée après la demande si vous étiez éligible
- des Boosters (facultatif)




## Comment réduisez-vous le risque pour les LP des pools de couverture ? {#how-do-you-reduce-the-cover-pool-lp-risk}

Les actifs des pools de couverture peuvent être mobilisés pour couvrir des demandes : c’est ce qui les rend plus risqués, et c’est pourquoi ils offrent un APY plus élevé. Pour réduire ce risque, notre équipe :
- examine de façon indépendante chaque protocole avant de l’assurer
- étudie les audits tiers de chaque protocole
- ajuste ou retire la couverture de chaque protocole au fil d’une surveillance continue

Les demandes d’indemnisation ne devraient pas être fréquentes, mais le risque existe toujours.



## Qu’est-ce qui change pendant la bêta ? {#whats-different-in-beta}
La bêta comporte quelques garde-fous que nous prévoyons de retirer ensuite : pendant la bêta, l’administrateur et le Timelock disposent de droits et de privilèges particuliers.
- L’administrateur ou le Timelock peut contester le règlement des indemnisations d’un incident en soumettant une nouvelle racine de règlement (settlement root). Cela ajoute aussi au processus de demande une période de contestation de 3 jours, qui sera supprimée après la bêta.
- Le Timelock peut mettre à niveau Registry, USD8, Treasury et DefiInsurance ; nous prévoyons de supprimer cette possibilité après la bêta.


## USD8 a-t-il un token de gouvernance ? {#does-usd8-has-a-governance-token}
Pas pour le moment.

## Quels sont tous les risques liés à USD8 ? {#show-all-the-risk-involved-in-usd8}
Ils sont détaillés sur la page [Transparence](./transparency.md).

## Comment USD8 gagne-t-il de l’argent ? {#how-does-usd8-make-money}
USD8 dispose de plusieurs sources de revenus :
- une partie du rendement de la trésorerie d’USD8
- 20 % du reliquat des indemnisations : les demandeurs ne sont couverts qu’à 80 % au maximum, et les 20 % restants constituent les frais d’USD8
- une partie des pertes récupérées grâce à la [White Hat Economy](white-hat-economy.md)


## Comment contribuer à USD8 ? {#how-can-i-contribute-to-usd8}

Les contributions de la communauté sont les bienvenues, qu’il s’agisse de conception des mécanismes, de partenariats, de marketing ou d’autre chose. Pour partager vos propositions, critiques ou idées, [ouvrez une issue dans le dépôt usd8-core](https://github.com/Usd8-fi/usd8-core/issues) ou rejoignez notre [groupe Telegram](https://t.me/+e84i2oYk1ao1MTk1) pour en discuter avec l’équipe. Les contributeurs peuvent gagner des [Boosters](defi-insurance.md#boosters).

  
  

## Qui est derrière USD8 ? {#who-is-behind-usd8}

USD8 est développé par [@codephobic](https://x.com/codephobic), chercheur en sécurité qui audite depuis plus de 7 ans des protocoles DeFi et des L2 de premier plan.
