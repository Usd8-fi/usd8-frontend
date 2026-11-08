# Asuransi DeFi {#defi-insurance}

- Pemegang USD8 & sUSD8 mendapat skor asuransi di setiap blok
- Skor asuransi dapat dipakai untuk mengajukan klaim atas berbagai token DeFi yang diasuransikan, termasuk USD8 dan sUSD8
- Makin besar skor, makin besar pembayaran: hingga 80% nilai, dibatasi oleh batas Pool Proteksi
- Skor tidak dapat dipindahtangankan dan tidak pernah kedaluwarsa
- Dana pembayaran berasal dari [Pool Proteksi](./cover-pools.md)

<div class="example-box">
<p>Contoh: anggap Aave aUSDC adalah token yang diasuransikan dengan cakupan maksimum 80%</p>
<ol>
<li>Harga aUSDC terhadap USDC turun dari 1 ke 0.3</li>
<li>Pengguna yang memiliki skor asuransi mendapat aset Pool Proteksi senilai hingga 0.8 USDC, sebagai ganti aUSDC miliknya</li>
</ol>
</div>

## Proses Klaim {#claim-process}

Klaim adalah proses 3 langkah yang menggabungkan proses on-chain dan off-chain (TEE). Seluruh prosesnya memakan waktu sekitar 9-12 hari selama beta dan 6-9 hari setelah beta. Pastikan Anda tidak melewatkan satu tenggat pun.


### 1 Ajukan Klaim {#1-file-a-claim}

Siapa pun dapat mengajukan klaim jika:
1. harga TWAP 24 jam yang berurutan dari token yang diasuransikan turun >20% dalam 1-6 hari terakhir;
2. pengaju klaim memiliki skor asuransi yang belum terpakai, yang diperoleh minimal 7 hari sebelum penurunan harga;
3. pengaju klaim sudah memegang token yang diasuransikan minimal 7 hari sebelum penurunan harga.

Ada juga jaminan sebesar 10 USD8 yang dikembalikan penuh jika syarat 2 dan 3 terpenuhi. Anda tidak perlu menyebutkan kapan penurunan harga terjadi: TEE kami akan menemukan penurunan itu dan menentukan blok persisnya sendiri.


Penting - periode klaim ditutup 3 hari setelah klaim valid pertama. Setelah itu, tidak ada lagi klaim yang bisa diajukan untuk token yang diasuransikan tersebut.


### 2 Selesaikan Klaim {#2-settle-claims}
Siapa pun dapat menyelesaikan klaim dengan mengirimkan atestasi dari TEE, yang memakai algoritma open source untuk menghitung skor asuransi dan pembayaran setiap pengaju klaim. Hasilnya dapat diverifikasi sepenuhnya.

Besar pembayaran masing-masing pengaju klaim dihitung berdasarkan:

1. skor asuransi pengaju klaim dibandingkan total skor semua pengaju klaim
2. batas Pool Proteksi
3. cakupan maksimum token yang diasuransikan

<div class="example-box">
<p>Contoh: ada 2 pengaju klaim, A dengan skor 100 dan B dengan skor 200. Keduanya menitipkan token diasuransikan senilai $500 di escrow, dengan cakupan maksimum 80%. Pool Proteksi saat ini berisi aset senilai $2250.</p>
<ol>
<li>Batas Pool Proteksi saat ini ditetapkan 50%, jadi total $1125 dapat digunakan. 80% dari jumlah itu, yaitu $900, menjadi anggaran untuk menanggung klaim. Skor A setengah dari skor B, sehingga A dapat mengklaim hingga $300 dan B hingga $600</li>
<li>A dan B sama-sama menitipkan token diasuransikan senilai $500. Dengan cakupan maksimum 80%, klaim masing-masing dibatasi $400 untuk kerugiannya.</li>
<li>A menerima pembayaran $300, sedangkan B menerima $400</li>
</ol>
</div>

Periode penyelesaian dibuka paling lama 3 hari. Begitu klaim diselesaikan, pengguna dapat memfinalisasi pembayarannya. Jika tidak diselesaikan, pengaju klaim dapat menarik token yang mereka titipkan di escrow, dan tidak ada skor asuransi yang terpakai.

Selama beta - admin memiliki tambahan 3 hari setelah penyelesaian untuk memverifikasi dan menyanggahnya dengan penyelesaian baru yang ditandatangani TEE. Ini adalah langkah pengaman untuk memastikan tidak ada bug penyelesaian yang berbahaya.


### 3 Finalisasi Pembayaran {#3-finalize-payouts}
Pada tahap ini, pengaju klaim memiliki waktu 3 hari untuk menerima pembayaran. Jika memilih menerimanya, mereka akan:

1. melepaskan token diasuransikan yang ada di escrow beserta skor asuransinya
2. menerima aset Pool Proteksi dengan total nilai USD sebesar pembayaran yang menjadi haknya

Jika memilih tidak menerima pembayaran, pengaju klaim dapat menarik token mereka dari escrow dan tetap menyimpan skor asuransinya.

Apa pun pilihannya, jaminan tetap dikembalikan selama syarat jaminan terpenuhi.

Penting - periode pembayaran berlangsung 3 hari. Setelah itu, semua klaim yang masih tertunda dianggap tidak diterima, dan pengaju klaim dapat menarik token mereka dari escrow.

## TEE {#tee}
USD8 menggunakan secure enclave Amazon yang menjalankan algoritma open source secara off-chain untuk menghitung dan menandatangani pembayaran. Siapa pun dapat memicu TEE dan mengirimkan hasilnya ke on-chain; kontrak akan memverifikasi tanda tangan TEE sebelum menerima hasil akhirnya. Karena algoritmanya open source, hasilnya dapat diverifikasi secara publik oleh siapa pun.

Ke depannya, kami berencana beralih ke jaringan zk-coprocessor seperti [Brevis](https://brevis.network/) agar lolos [walkaway test](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).


## Booster {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="Artwork NFT Booster USD8" /><br/><br/>
[Booster](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) adalah NFT yang dapat Anda tambahkan saat mengajukan klaim; masing-masing memberi boost 1% pada total skor asuransi Anda. Booster yang memenuhi syarat dibakar saat Anda menerima pembayaran; sisanya dikembalikan. Anda bisa menumpuk beberapa Booster sekaligus. Booster tidak dijual; Booster hanya di-mint untuk pengguna tahap awal yang membantu USD8 berkembang. Ikuti [X](https://x.com/usd8_fi) dan [Telegram](https://t.me/+e84i2oYk1ao1MTk1) kami.

Masukkan alamat Ethereum untuk mengecek Booster

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Cek</button>
<div id="booster-result" class="booster-result"></div>
</div>
