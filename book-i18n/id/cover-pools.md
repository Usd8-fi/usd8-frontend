# Pool Proteksi {#cover-pools}

Pool Proteksi adalah vault publik tempat siapa pun bisa menyetor dan menarik dana kapan saja. Setiap Pool Proteksi:

- menerima satu token tertentu sebagai setoran, mis. wstETH
- membayar APY dalam USD8 yang didanai dari imbal hasil treasury USD8
- memiliki ukuran yang dibatasi

<div class="example-box">
  Peringatan - aset Pool Proteksi akan dipakai untuk menanggung klaim jika ada token yang diasuransikan mengalami penurunan harga >= 20%.
</div>


## Token yang Diasuransikan {#insured-tokens}

Token yang diasuransikan dievaluasi dan diseleksi dengan cermat, lalu terus disesuaikan secara berkelanjutan. USD8 menerima audit keamanan independen atau sertifikasi dari sumber-sumber berikut.

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Sertifikasi SEAL dari Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Penarikan {#withdraw}

Penarikan memiliki masa tunggu 7 hari dan dapat diajukan kapan saja selama tidak ada klaim yang aktif.

Jika muncul klaim baru selama masa tunggu ini, proses penarikan dijeda sampai insidennya tuntas, yang bisa memakan waktu 9-12 hari lagi selama beta (6-9 hari setelah beta) sejak klaim pertama. Selama itu, semua aset dalam masa tunggu tetap terpapar pembayaran klaim asuransi.

Aset dalam masa tunggu tidak menghasilkan imbal hasil dan tetap menanggung klaim. Setelah masa tunggu selesai, aset dapat ditarik kapan saja; aset tersebut tidak lagi menanggung klaim, tetapi juga tidak lagi menghasilkan imbal hasil.


## Batas Pembayaran Asuransi {#insurance-payout-limit}

Ada batas total pembayaran dari Pool Proteksi untuk setiap insiden, saat ini ditetapkan 50%. Artinya, pembayaran maksimum per insiden dibatasi 50% dari ukuran Pool Proteksi saat itu.
