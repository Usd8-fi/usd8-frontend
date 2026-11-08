# Pools de couverture {#cover-pools}

Les pools de couverture sont des vaults publics dans lesquels chacun peut déposer et retirer à tout moment. Chaque pool de couverture :

- accepte en dépôt un token spécifique, par ex. wstETH ;
- verse un APY en USD8, financé par le rendement de la trésorerie d’USD8 ;
- a une taille plafonnée.

<div class="example-box">
  Avertissement : les actifs du pool de couverture serviront à couvrir les demandes si un token assuré subit une baisse de prix de 20 % ou plus.
</div>


## Tokens assurés {#insured-tokens}

Les tokens assurés sont soigneusement évalués, sélectionnés et ajustés en continu. USD8 accepte les audits de sécurité indépendants ou les certifications émanant des sources suivantes :

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Certification SEAL de la Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Retrait {#withdraw}

Tout retrait est soumis à une période d’attente de 7 jours, que vous pouvez lancer à tout moment en l’absence de demande active.

Si de nouvelles demandes sont déposées pendant cette période, le retrait est suspendu jusqu’à la résolution de l’incident, ce qui peut prendre encore 9 à 12 jours pendant la bêta (6 à 9 jours après la bêta) à compter de la première demande. Pendant ce temps, tous les actifs en période d’attente restent exposés aux indemnisations.

Les actifs en période d’attente ne génèrent pas de rendement et couvrent toujours les demandes. Une fois la période d’attente terminée, ils peuvent être retirés à tout moment ; ils ne couvrent alors plus aucune demande et ne génèrent plus de rendement.


## Plafond d’indemnisation {#insurance-payout-limit}

Le total des indemnisations versées par le pool de couverture est plafonné pour chaque incident, actuellement à 50 % : l’indemnisation maximale par incident ne peut dépasser 50 % de la taille actuelle du pool de couverture.
