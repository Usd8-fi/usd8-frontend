# DeFi Sigortası {#defi-insurance}

- USD8 ve sUSD8 sahipleri her blokta sigorta puanı kazanır
- Sigorta puanıyla, USD8 ve sUSD8 dahil bir dizi sigortalı DeFi token'ı için talepte bulunabilirsiniz
- Puan ne kadar yüksekse ödeme de o kadar yüksek olur: Değerin %80'ine kadar, Teminat Havuzu limitiyle sınırlı
- Puan devredilemez ve süresi hiçbir zaman dolmaz
- Ödemeler [Teminat Havuzlarından](./cover-pools.md) karşılanır

<div class="example-box">
<p>Örnek: Aave aUSDC'nin, azami teminatı %80 olan sigortalı bir token olduğunu varsayalım</p>
<ol>
<li>aUSDC'nin USDC karşısındaki değeri 1'den 0.3'e düşer</li>
<li>Sigorta puanı olan kullanıcı, aUSDC'sini vererek karşılığında Teminat Havuzu varlıklarından 0.8 USDC değerine kadar ödeme alır</li>
</ol>
</div>

## Talep Süreci {#claim-process}

Talep süreci, zincir üstü ve zincir dışı (TEE) işlemleri birleştiren 3 adımdan oluşur ve beta döneminde yaklaşık 9-12 gün, beta sonrasında ise 6-9 gün sürer. Hiçbir son tarihi kaçırmamanız önemlidir.


### 1 Talepte Bulunun {#1-file-a-claim}

Şu koşullar sağlanıyorsa herkes talepte bulunabilir:
1. Sigortalı bir token'ın art arda iki 24 saatlik TWAP fiyatı arasında, son 1-6 gün içinde %20'den fazla düşüş yaşanmışsa
2. Talep sahibinin, fiyat düşüşünden en az 7 gün önce kazanılmış ve henüz harcanmamış sigorta puanı varsa
3. Talep sahibi, sigortalı token'ı fiyat düşüşünden önce en az 7 gün boyunca elinde tutmuşsa

Ayrıca 10 USD8 tutarında bir depozito gerekir; 2. ve 3. koşullar sağlanırsa tamamı iade edilir. Fiyat düşüşünün ne zaman yaşandığını belirtmeniz gerekmez: TEE'miz düşüşü kendisi bulur ve hangi blokta gerçekleştiğini tam olarak belirler.


Önemli: Talep süresi, ilk geçerli talepten 3 gün sonra kapanır; bundan sonra bu sigortalı token için talepte bulunulamaz.


### 2 Talepleri Uzlaştırın {#2-settle-claims}
Herkes, TEE'den alınan bir onay belgesini (attestation) göndererek talepleri uzlaştırabilir. TEE, her talep sahibinin sigorta puanını ve ödemesini açık kaynak bir algoritmayla hesaplar. Sonuçlar tamamen doğrulanabilir.

Her talep sahibinin ödeme tutarı şunlara göre hesaplanır:

1. Talep sahibinin sigorta puanının, tüm talep sahiplerinin toplam puanına oranı
2. Teminat Havuzu limiti
3. Sigortalı token'ın azami teminat oranı

<div class="example-box">
<p>Örnek: İki talep sahibi var. A'nın 100, B'nin 200 puanı var ve ikisi de azami teminatı %80 olan, $500 değerinde sigortalı token'ı emanete vermiş. Teminat Havuzunda şu anda $2250 değerinde varlık bulunuyor.</p>
<ol>
<li>Teminat Havuzu limiti şu anda %50 olduğundan toplam $1125 kullanılabilir. Bunun %80'i, yani $900, talepleri karşılama bütçesidir. A'nın puanı B'ninkinin yarısı olduğundan A en fazla $300, B ise en fazla $600 alabilir.</li>
<li>A da B de $500 değerinde sigortalı token emanete verdi; %80 azami teminatla, kayıpları için alabilecekleri tutar $400 ile sınırlıdır.</li>
<li>A $300, B ise $400 ödeme alır.</li>
</ol>
</div>

Uzlaştırma süresi en fazla 3 gün açık kalır; uzlaştırma yapılır yapılmaz kullanıcılar ödemelerini sonuçlandırabilir. Uzlaştırma yapılmazsa talep sahipleri emanetteki token'larını geri çekebilir ve sigorta puanları harcanmaz.

Beta döneminde: Yönetici, uzlaştırmadan sonraki 3 gün boyunca sonucu doğrulayabilir ve TEE tarafından imzalanmış yeni bir uzlaştırmayla itiraz edebilir. Bu, uzlaştırmada kötüye kullanılabilecek bir hata kalmamasını sağlamaya yönelik bir güvenlik önlemidir.


### 3 Ödemeleri Sonuçlandırın {#3-finalize-payouts}
Bu aşamada talep sahiplerinin ödemeyi kabul etmek için 3 günü vardır. Kabul eden talep sahibi:

1. Emanetteki sigortalı token'larından ve sigorta puanından vazgeçer
2. Toplam USD değeri hak ettiği ödemeye eşit olan Teminat Havuzu varlık(lar)ını alır

Ödemeyi kabul etmeyen talep sahipleri emanetteki token'larını geri çekebilir ve sigorta puanlarını korur.

Talep sahipleri ödemeyi sonuçlandırsın ya da sonuçlandırmasın, depozito koşulları sağlandığı sürece depozito iade edilir.

Önemli: Ödeme süresi 3 gündür; bu süreden sonra bekleyen tüm talepler kabul edilmemiş sayılır ve talep sahipleri emanetteki token'larını geri çekebilir.

## TEE {#tee}
USD8, ödemeleri hesaplamak ve imzalamak için zincir dışında açık kaynak bir algoritma çalıştıran bir Amazon güvenli bölgesi (secure enclave) kullanır. Herkes TEE'yi tetikleyip sonucu zincire gönderebilir; zincir üstündeki sözleşme, nihai sonucu kabul etmeden önce TEE'nin imzasını doğrular. Algoritma açık kaynak olduğundan sonucu herkes doğrulayabilir.

[Walkaway testini](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html) geçebilmek için gelecekte [Brevis](https://brevis.network/) gibi bir zk yardımcı işlemci (zk-coprocessor) ağına geçmeyi planlıyoruz.


## Booster'lar {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="USD8 Booster NFT görseli" /><br/><br/>
[Booster'lar](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d), talepte bulunurken ekleyebileceğiniz NFT'lerdir; her biri toplam sigorta puanınıza %1 artış sağlar. Uygun Booster'lar ödemeyi kabul ettiğinizde yakılır, diğerleri iade edilir. Birden fazla Booster'ı bir arada kullanabilirsiniz. Booster'lar satılık değildir; yalnızca USD8'in büyümesine katkı sağlayan erken dönem kullanıcılar için basılır. [X](https://x.com/usd8_fi) ve [Telegram](https://t.me/+e84i2oYk1ao1MTk1) hesaplarımızı takip edin.

Booster'ları sorgulamak için bir Ethereum adresi girin

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Sorgula</button>
<div id="booster-result" class="booster-result"></div>
</div>
