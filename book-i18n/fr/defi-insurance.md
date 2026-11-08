# Assurance DeFi {#defi-insurance}

- Les détenteurs d’USD8 et de sUSD8 gagnent du score d’assurance à chaque bloc
- Le score d’assurance permet de déposer des demandes d’indemnisation pour une sélection de tokens DeFi assurés, dont USD8 et sUSD8
- Plus le score est élevé, plus l’indemnisation est importante : jusqu’à 80 % de la valeur, dans la limite du plafond du pool de couverture
- Le score n’est pas transférable et n’expire jamais
- Les indemnisations sont versées par les [pools de couverture](./cover-pools.md)

<div class="example-box">
<p>Exemple : supposons que l’aUSDC d’Aave soit un token assuré avec une couverture maximale de 80 %.</p>
<ol>
<li>Le cours de l’aUSDC face à l’USDC passe de 1 à 0.3.</li>
<li>Un utilisateur disposant d’un score d’assurance reçoit, en échange de ses aUSDC, jusqu’à 0.8 USDC de valeur en actifs du pool de couverture.</li>
</ol>
</div>

## Processus de demande {#claim-process}

Une demande d’indemnisation se déroule en 3 étapes, qui combinent traitements onchain et offchain (TEE). Elle prend environ 9 à 12 jours pendant la bêta, et 6 à 9 jours ensuite. Veillez à ne manquer aucune échéance.


### 1 Déposer une demande {#1-file-a-claim}

Tout le monde peut déposer une demande si :
1. le prix d’un token assuré a chuté de plus de 20 % entre deux TWAP sur 24 h consécutifs, au cours des 1 à 6 derniers jours ;
2. le demandeur dispose d’un score d’assurance non utilisé, gagné au moins 7 jours avant la baisse de prix ;
3. le demandeur détenait le token assuré depuis au moins 7 jours avant la baisse de prix.

Une caution de 10 USD8 est également exigée ; elle est intégralement remboursée si les conditions 2 et 3 sont remplies. Inutile d’indiquer quand la baisse de prix a eu lieu : notre TEE la détecte et identifie lui-même le bloc exact.


Important : la période de dépôt se ferme 3 jours après la première demande valide ; passé ce délai, plus aucune demande ne peut être déposée pour ce token assuré.


### 2 Régler les demandes {#2-settle-claims}
Tout le monde peut régler une demande en soumettant une attestation du TEE, qui calcule le score d’assurance et l’indemnisation de chaque demandeur à l’aide d’un algorithme open source. Les résultats sont entièrement vérifiables.

Le montant de chaque indemnisation dépend :

1. du score d’assurance du demandeur par rapport au score total de l’ensemble des demandeurs ;
2. du plafond du pool de couverture ;
3. de la couverture maximale du token assuré.

<div class="example-box">
<p>Exemple : deux demandeurs, A avec un score de 100 et B avec un score de 200, ont chacun placé sous séquestre l’équivalent de 500 $ en tokens assurés, avec une couverture maximale de 80 %. Le pool de couverture détient actuellement 2250 $ d’actifs.</p>
<ol>
<li>Le plafond du pool de couverture est actuellement fixé à 50 % : 1125 $ au total peuvent donc être utilisés, dont 80 % constituent le budget de couverture des demandes, soit 900 $. A ayant deux fois moins de score que B, A peut prétendre à 300 $ au maximum, et B à 600 $.</li>
<li>A et B ont tous deux placé sous séquestre 500 $ de tokens assurés ; avec une couverture maximale de 80 %, leur indemnisation est plafonnée à 400 $ pour leur perte.</li>
<li>A reçoit 300 $ d’indemnisation, et B 400 $.</li>
</ol>
</div>

La période de règlement dure au maximum 3 jours ; dès que le règlement est effectué, les utilisateurs peuvent finaliser leur indemnisation. Faute de règlement, les demandeurs peuvent retirer leurs tokens placés sous séquestre, et aucun score d’assurance n’est consommé.

Pendant la bêta, l’administrateur dispose de 3 jours supplémentaires après le règlement pour le vérifier et le contester au moyen d’un nouveau règlement signé par le TEE. Cette mesure de sécurité garantit qu’aucun bug malveillant ne s’est glissé dans le règlement.


### 3 Finaliser les indemnisations {#3-finalize-payouts}
À cette étape, les demandeurs disposent de 3 jours pour accepter l’indemnisation. S’ils l’acceptent :

1. ils cèdent leurs tokens assurés placés sous séquestre ainsi que leur score d’assurance ;
2. ils reçoivent un ou plusieurs actifs du pool de couverture, pour une valeur totale en USD égale à l’indemnisation à laquelle ils ont droit.

S’ils refusent l’indemnisation, ils peuvent retirer leurs tokens placés sous séquestre et conserver leur score d’assurance.

Qu’ils finalisent ou non, la caution leur est restituée dès lors que ses conditions sont remplies.

Important : la période d’indemnisation dure 3 jours ; passé ce délai, toutes les demandes en attente sont considérées comme non acceptées, et les demandeurs peuvent retirer leurs tokens placés sous séquestre.

## TEE {#tee}
USD8 utilise une enclave sécurisée Amazon qui exécute offchain un algorithme open source pour calculer et signer les indemnisations. Tout le monde peut déclencher le TEE et soumettre le résultat onchain, où la signature du TEE est vérifiée avant que le résultat final ne soit accepté. L’algorithme étant open source, le résultat est publiquement vérifiable par tous.

Nous prévoyons de passer à terme à un réseau de zk-coprocesseurs comme [Brevis](https://brevis.network/) afin de réussir le [walkaway test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).


## Boosters {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="Illustration du NFT Booster d’USD8" /><br/><br/>
Les [Boosters](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) sont des NFT que vous pouvez ajouter au dépôt d’une demande ; chacun augmente de 1 % votre score d’assurance total. Les Boosters éligibles sont brûlés lorsque vous acceptez l’indemnisation ; les autres vous sont rendus. Ils sont cumulables. Les Boosters ne sont pas à vendre : ils sont uniquement distribués aux premiers utilisateurs qui aident USD8 à se développer. Suivez-nous sur [X](https://x.com/usd8_fi) et [Telegram](https://t.me/+e84i2oYk1ao1MTk1).

Saisissez une adresse Ethereum pour vérifier ses Boosters

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Vérifier</button>
<div id="booster-result" class="booster-result"></div>
</div>
