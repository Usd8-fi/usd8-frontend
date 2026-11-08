# Transparence {#transparency}

Voici les hypothèses de confiance et les risques liés au protocole USD8. La plupart sont courants dans les protocoles DeFi, mais nous choisissons de les exposer d’emblée à nos utilisateurs.

## Administrateur et Timelock {#admin--timelock}
Les privilèges de l’administrateur ont été réduits autant que possible dès la conception : la plupart des actions critiques passent par le timelock, qui laisse aux utilisateurs le temps de réagir à tout changement à venir.

L’administrateur peut effectuer des réglages système tels que :
- déployer la trésorerie d’USD8 vers des stratégies préapprouvées, sans pouvoir ajouter lui-même de stratégies
- gérer les mises en pause, la pondération des revenus, les frais du protocole et les plafonds de dépôt des pools de couverture

Le Timelock gère les réglages système sensibles :
- ajouter ou retirer des administrateurs, ou remplacer le timelock
- configurer les pools, les tokens assurés, le calcul du score, les oracles, les délais liés aux incidents et aux sorties, les cautions de demande et les signataires TEE
- gérer les stratégies de la trésorerie (Treasury) et la répartition des revenus
- appeler endBetaMode, de façon définitive, ce qui désactive les mises à niveau et les corrections de règlement propres à la bêta


## Pendant la bêta {#during-beta}
La bêta comporte quelques garde-fous supplémentaires, qui donnent à l’administrateur et au timelock des privilèges étendus.

- L’administrateur ou le Timelock peut corriger la racine de règlement, ce qui ajoute aussi une période de contestation de 3 jours au processus de demande

- Le Timelock peut mettre à niveau Registry, USD8, Treasury et DefiInsurance

Ces deux privilèges seront supprimés à la fin de la bêta.


## Assurance DeFi {#defi-insurance}
L’assurance DeFi est gratuite pour tous les utilisateurs d’USD8/sUSD8 ; le montant de l’indemnisation peut toutefois varier selon le score d’assurance des demandeurs et le plafond de taille du pool de couverture.

Nous avons conçu un processus qui laisse aux utilisateurs la liberté d’accepter ou de refuser l’indemnisation si elle n’est pas à la hauteur de leurs attentes.


## Pool de couverture {#cover-pool}
Les pools de couverture sont plus risqués, car ils servent à couvrir les demandes. Notre équipe examine soigneusement chaque token que nous assurons pour réduire ce risque autant que possible ; voir [Comment réduisez-vous le risque pour les LP des pools de couverture ?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk).

Les LP des pools de couverture doivent avoir conscience de ce risque.


## TEE {#tees}
Le système USD8 utilise des TEE offchain pour calculer la couverture : le système actuel dépend donc de serveurs que nous exploitons. Nous prévoyons toutefois de passer à terme à une architecture trustless reposant sur des réseaux de zk-coprocesseurs.


## Services externes {#external-services}
Le fonctionnement d’USD8 repose sur quelques services externes, notamment :

- les oracles Chainlink
- les fournisseurs RPC
- les fournisseurs de serveurs/TEE (nous prévoyons toutefois de passer à terme à un réseau trustless de zk-coprocesseurs)
- les sources de rendement DeFi comme Aave, Morpho, etc.

Tout problème touchant ces services peut aussi affecter USD8.
