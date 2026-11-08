<h1 id="faqs" class="faq-title">FAQ</h1>

## Jadi, saya mendapat asuransi gratis dari USD8 & sUSD8? {#so-i-get-free-insurance-from-usd8--susd8}

Ya, itulah keunggulan USD8 dibanding stablecoin lain. Anda mendapat Skor Asuransi di setiap blok; makin banyak dan makin lama Anda memegang USD8/sUSD8, makin besar skor yang Anda dapat.

Laju perolehan skornya berbeda-beda: saat ini 1 USD8 memberi Anda 1 skor per hari, sedangkan 1 sUSD8 memberi 0.1 skor per hari.


## Dari mana dana pembayaran asuransi berasal? {#where-does-the-insurance-payout-come-from}

Pembayaran berasal dari [Pool Proteksi](./cover-pools.md), yaitu vault token terbuka tempat siapa pun bisa menyetor. Saat ini ada dua: [satu berisi wstETH dan satu berisi USD8](https://usd8.fi/#cover-pools).

Penyetor mendapat APY tinggi yang didanai dari imbal hasil treasury USD8. Namun, setoran mereka dapat dipakai untuk membayar klaim jika token yang diasuransikan turun lebih dari 20% terhadap aset dasarnya, dan setiap insiden dapat memakai hingga 50% saldo masing-masing Pool Proteksi. Risiko tinggi, imbal hasil tinggi.


## Kapan skor asuransi saya bisa dipakai untuk klaim? {#when-can-i-use-my-insurance-score-for-a-claim}

Skor asuransi menjadi tersedia 7 hari setelah Anda memperolehnya, dan hanya skor yang sudah tersedia yang dapat dipakai untuk klaim.
  
## Dulu saya punya USD8, sekarang tidak. Apakah saya masih diasuransikan? {#i-had-usd8-before-but-not-now-am-i-still-insured}

Ya. Anda seharusnya sudah mengumpulkan sejumlah skor asuransi, dan skor itu tidak kedaluwarsa. Anda dapat mengajukan klaim selama skor Anda sudah berumur 7 hari.

## Berapa besar pembayaran yang saya dapat? {#how-much-payout-do-i-get}

Tergantung pada 1. skor asuransi Anda dibandingkan pengaju klaim lain pada waktu yang sama, dan 2. batas ukuran pool proteksi.

Makin besar Skor Asuransi Anda, makin besar bobot klaim Anda. Pembayaran maksimum adalah 80%; jika skor Anda rendah, Anda mungkin mendapat kurang dari itu. Namun, Anda selalu bisa memilih untuk tidak menerima pembayaran akhir jika jumlahnya terlalu kecil, lalu menyimpan Skor Asuransi Anda untuk lain waktu.



## Apa saja yang dibutuhkan untuk mengajukan klaim? {#whats-needed-when-filing-a-claim}

- token yang diasuransikan yang ingin Anda klaim
- skor asuransi
- jaminan 10 USD8, dikembalikan setelah klaim jika Anda memenuhi syarat
- Booster (opsional)




## Bagaimana cara Anda mengurangi risiko LP Pool Proteksi? {#how-do-you-reduce-the-cover-pool-lp-risk}

Aset Pool Proteksi dapat dipakai untuk menanggung klaim, sehingga risikonya lebih tinggi — itulah sebabnya APY-nya juga lebih tinggi. Untuk mengurangi risiko Pool Proteksi, tim kami
- menyeleksi setiap protokol secara independen sebelum menawarkan asuransi
- meninjau audit pihak ketiga untuk setiap protokol
- menyesuaikan/mencabut cakupan setiap protokol berdasarkan pemantauan berkelanjutan

Klaim diperkirakan tidak akan sering terjadi, tetapi kemungkinannya selalu ada.



## Apa yang berbeda selama beta? {#whats-different-in-beta}
Selama beta ada beberapa "roda bantu" pengaman yang rencananya akan dilepas setelah beta berakhir. Selama beta, admin/Timelock memiliki hak dan wewenang khusus.
- Admin atau Timelock dapat menyanggah penyelesaian pembayaran suatu insiden dengan mengirimkan settlement root baru. Ini juga menambahkan masa sanggah 3 hari ke proses klaim, yang akan dihapus setelah beta.
- Timelock dapat meng-upgrade Registry, USD8, Treasury, dan DefiInsurance; kami berencana menghapus kemampuan upgrade ini setelah beta.


## Apakah USD8 punya token tata kelola? {#does-usd8-has-a-governance-token}
Untuk saat ini belum.

## Bisa tunjukkan semua risiko yang ada di USD8? {#show-all-the-risk-involved-in-usd8}
Tentu, lihat [Transparansi](./transparency.md)

## Bagaimana USD8 menghasilkan uang? {#how-does-usd8-make-money}
USD8 memiliki beberapa sumber pendapatan:
- sebagian imbal hasil treasury USD8
- 20% dari sisa pembayaran — karena pengaju klaim hanya mendapat cakupan maksimum 80%, sisa 20%-nya menjadi biaya bagi USD8.
- sebagian kerugian yang berhasil dipulihkan melalui [Ekonomi White Hat](white-hat-economy.md)


## Bagaimana saya bisa berkontribusi untuk USD8? {#how-can-i-contribute-to-usd8}

Kami menyambut kontribusi komunitas di bidang desain mekanisme, kemitraan, pemasaran, dan lainnya. Untuk menyampaikan proposal, kritik, atau ide, [buka issue di repositori usd8-core](https://github.com/Usd8-fi/usd8-core/issues) atau bergabunglah dengan [grup Telegram](https://t.me/+e84i2oYk1ao1MTk1) kami untuk mendiskusikannya bersama tim. Kontributor bisa mendapatkan [Booster](defi-insurance.md#boosters).

  
  

## Siapa di balik USD8? {#who-is-behind-usd8}

USD8 dibangun oleh [@codephobic](https://x.com/codephobic) — seorang Security Researcher dengan pengalaman lebih dari 7 tahun mengaudit protokol DeFi papan atas dan L2.
