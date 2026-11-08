# Transparansi {#transparency}

Berikut asumsi kepercayaan dan risiko yang ada di protokol USD8. Sebagian besar umum ditemukan di protokol DeFi, tetapi kami memilih menyampaikannya secara terbuka kepada pengguna sejak awal.

## Admin & Timelock {#admin--timelock}
Hak admin sudah dikurangi sebisa mungkin sejak tahap desain. Sebagian besar tindakan penting dijalankan melalui timelock, sehingga pengguna punya waktu tambahan untuk menanggapi perubahan yang akan datang.

Admin dapat menjalankan pengaturan sistem seperti
- Menempatkan dana treasury USD8 ke strategi yang sudah disetujui sebelumnya, tetapi tidak dapat menambahkan strategi secara langsung
- Mengelola jeda (pause), bobot pendapatan, biaya protokol, dan batas setoran pool proteksi

Timelock mengelola pengaturan sistem yang sensitif
- Menambah/menghapus admin atau mengganti timelock
- Mengonfigurasi pool, token yang diasuransikan, penilaian skor, oracle, waktu insiden/keluar, jaminan klaim, dan penanda tangan TEE
- Mengelola strategi Treasury dan distribusi pendapatan.
- Memanggil endBetaMode, yang secara permanen menonaktifkan upgrade dan koreksi penyelesaian khusus beta


## Selama Beta {#during-beta}
Selama beta ada beberapa "roda bantu" pengaman tambahan yang memberi admin dan timelock wewenang ekstra.

- Admin atau Timelock dapat mengoreksi settlement root, yang juga menambahkan masa sanggah 3 hari ke proses klaim

- Timelock dapat meng-upgrade Registry, USD8, Treasury, dan DefiInsurance

Keduanya akan dihapus begitu beta berakhir.


## Asuransi DeFi {#defi-insurance}
Asuransi DeFi gratis untuk semua pengguna USD8/sUSD8, tetapi besar pembayarannya bisa berbeda-beda, tergantung skor asuransi para pengaju klaim dan batas ukuran Pool Proteksi.

Kami merancang prosesnya agar pengguna bebas menerima atau menolak pembayaran jika hasilnya tidak sesuai harapan.


## Pool Proteksi {#cover-pool}
Pool proteksi lebih berisiko karena dipakai untuk menanggung klaim. Tim kami menyeleksi dengan cermat setiap token yang kami asuransikan untuk menekan risiko sebisa mungkin, lihat [Bagaimana cara Anda mengurangi risiko LP Pool Proteksi?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk).

LP Pool Proteksi perlu menyadari risiko ini.


## TEE {#tees}
Sistem USD8 menggunakan TEE off-chain untuk menghitung cakupan, artinya sistem saat ini bergantung pada server yang kami operasikan. Namun, ke depannya kami berencana beralih ke sistem trustless menggunakan jaringan zk-coprocessor.


## Layanan Eksternal {#external-services}
USD8 bergantung pada beberapa layanan eksternal agar dapat berfungsi, seperti

- Oracle Chainlink
- Penyedia RPC
- Penyedia server/TEE (namun ke depannya kami berencana beralih ke jaringan zk-coprocessor yang trustless)
- Sumber imbal hasil DeFi seperti Aave, Morpho, dll.

Gangguan pada layanan-layanan ini juga dapat berdampak pada USD8.
