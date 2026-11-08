# Şeffaflık {#transparency}

USD8 protokolündeki güven varsayımları ve riskler aşağıda yer alıyor. Bunların çoğu DeFi protokollerinde yaygındır; biz yine de bunları kullanıcılarımıza baştan açıkça bildirmeyi tercih ediyoruz.

## Yönetici ve Timelock {#admin--timelock}
Tasarım aşamasında yönetici yetkileri mümkün olduğunca azaltıldı. En kritik işlemler timelock üzerinden yapılır; bu da kullanıcılara yaklaşan değişikliklere tepki verebilmeleri için ek süre tanır.

Yöneticinin yapabileceği sistem ayarları şunlardır:
- USD8 hazinesini önceden onaylanmış stratejilere yönlendirmek (ancak doğrudan yeni strateji ekleyemez)
- Duraklatmayı, gelir ağırlıklarını, protokol ücretini ve teminat havuzu yatırım üst limitlerini yönetmek

Timelock hassas sistem ayarlarını yönetir:
- Yönetici eklemek/çıkarmak veya timelock'u değiştirmek
- Havuzları, sigortalı token'ları, puanlamayı, oracle'ları, olay/çıkış zamanlamasını, talep depozitolarını ve TEE imzacılarını yapılandırmak
- Treasury stratejilerini ve gelir dağılımını yönetmek.
- endBetaMode'u çağırarak yükseltmeleri ve beta dönemine özgü uzlaştırma düzeltmelerini kalıcı olarak devre dışı bırakmak


## Beta Döneminde {#during-beta}
Betada, yöneticiye ve timelock'a ek yetkiler veren birkaç ekstra güvenlik önlemi bulunur.

- Yönetici veya Timelock uzlaştırma kökünü (settlement root) düzeltebilir; bu da talep sürecine 3 günlük bir itiraz süresi ekler

- Timelock; Registry, USD8, Treasury ve DefiInsurance sözleşmelerini yükseltebilir

Beta sona erdiğinde her ikisi de kaldırılacak.


## DeFi Sigortası {#defi-insurance}
DeFi Sigortası tüm USD8/sUSD8 kullanıcıları için ücretsizdir; ancak ödeme tutarı, talep sahiplerinin sigorta puanlarına ve Teminat Havuzu büyüklük limitine göre değişebilir.

Ödeme beklentileri karşılamadığında kullanıcıların ödemeyi kabul edip etmemekte özgür olması için bir süreç tasarladık.


## Teminat Havuzu {#cover-pool}
Teminat havuzları talepleri karşılamak için kullanıldığından daha risklidir. Ekibimiz, riski olabildiğince azaltmak için sigortaladığımız her token'ı tek tek titizlikle inceler; bkz. [Teminat Havuzu LP'lerinin riskini nasıl azaltıyorsunuz?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk).

Teminat Havuzu LP'leri bu riskin farkında olmalıdır.


## TEE'ler {#tees}
USD8 sistemi teminatı hesaplamak için zincir dışı TEE'ler kullanır; yani mevcut sistem bizim işlettiğimiz sunuculara dayanır. Ancak gelecekte zk yardımcı işlemci ağlarıyla güven gerektirmeyen (trustless) bir yapıya geçmeyi planlıyoruz.


## Harici Hizmetler {#external-services}
USD8'in çalışması birkaç harici hizmete bağlıdır, örneğin:

- Chainlink oracle'ları
- RPC sağlayıcıları
- Sunucu/TEE sağlayıcıları (ancak gelecekte güven gerektirmeyen bir zk yardımcı işlemci ağına geçmeyi planlıyoruz)
- Aave, Morpho gibi DeFi getiri kaynakları

Bu hizmetlerde yaşanacak herhangi bir sorun USD8'i de etkileyebilir.
