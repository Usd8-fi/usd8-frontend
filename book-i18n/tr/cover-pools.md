# Teminat Havuzları {#cover-pools}

Teminat Havuzları, herkesin istediği zaman yatırıp çekebildiği, herkese açık kasalardır. Teminat Havuzları:

- belirli bir token'ı yatırım olarak kabul eder, ör. wstETH
- USD8 hazinesinin getirisiyle finanse edilen, USD8 cinsinden yıllık getiri öder
- sınırlı bir büyüklüğe sahiptir

<div class="example-box">
  Uyarı: Sigortalı herhangi bir token'ın fiyatı %20 veya daha fazla düşerse Teminat Havuzu varlıkları talepleri karşılamak için kullanılır.
</div>


## Sigortalı Token'lar {#insured-tokens}

Sigortalı token'lar özenle değerlendirilir, seçilir ve sürekli olarak güncellenir. USD8, aşağıdaki kaynaklardan alınmış bağımsız güvenlik denetimlerini veya sertifikalarını kabul eder.

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [SEAL Sertifikası (Security Alliance)](https://frameworks.securityalliance.dev/certs/overview/) 


## Çekim {#withdraw}

Çekimde 7 günlük bir bekleme süresi vardır; aktif talep olmadığı sürece istediğiniz zaman çekim başlatabilirsiniz.

Bu süre içinde yeni talepler gelirse çekim süreci, olay sonuçlanana kadar durdurulur. Bu, ilk talepten itibaren beta döneminde 9-12 gün (beta sonrasında 6-9 gün) daha sürebilir. Bu süre boyunca bekleme süresindeki tüm varlıklar sigorta talebi ödemelerine açık kalmaya devam eder.

Bekleme süresindeki varlıklar getiri kazanmaz ama talepleri karşılamaya devam eder. Bekleme süresi bittikten sonra varlıklar istenildiği zaman çekilebilir; bu aşamada artık hiçbir talebi karşılamaz ve getiri de kazanmaz.


## Sigorta Ödeme Limiti {#insurance-payout-limit}

Her olayda Teminat Havuzundan yapılabilecek toplam ödemenin bir limiti vardır. Bu limit şu anda %50'dir; yani bir olayda yapılabilecek azami ödeme, Teminat Havuzunun o anki büyüklüğünün %50'siyle sınırlıdır.
