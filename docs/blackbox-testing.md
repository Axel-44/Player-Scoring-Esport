# Laporan Pengujian Black-Box (Black-Box Testing Report)

**Proyek:** Platform Web Talent Scouting PUBG Mobile Berbasis XGBoost (PULSE SCOUT)  
**Penulis / Peneliti:** Axel Juanito Parlindungan Sibarani (NPM: 065122199)  
**Program Studi:** Ilmu Komputer, FMIPA, Universitas Pakuan  
**Referensi:** PRD Bagian 14 (Rencana Pengujian) & Bagian 7 (Kebutuhan Fungsional)  
**Tanggal Pengujian:** 18 Oktober 2026  
**Metode Pengujian:** Otomasi Browser Headless (Google Chrome + Puppeteer) & Verifikasi Antarmuka Interaktif  
**Status Keseluruhan:** **100% LULUS (10 dari 10 Skenario)**

---

## 1. Lingkungan Pengujian

| Komponen | Spesifikasi / Versi |
| :--- | :--- |
| **Sistem Operasi** | Microsoft Windows (x86_64) |
| **Browser Pengujian** | Google Chrome `v131+` / Microsoft Edge Chromium |
| **Frontend Framework** | React 19, Vite v8.3.4, Tailwind CSS v3.4, Recharts v3.10, Lucide React |
| **Backend API** | Python 3.11.9, FastAPI 0.143.3, Uvicorn 0.54.0 |
| **Machine Learning Engine** | XGBoost 3.2.0, Scikit-Learn 1.9.1, Joblib 1.6.0 |
| **Database & Session Layer** | Supabase JS Client & Persistent Local Session Layer |
| **Alat Otomasi Uji** | Puppeteer Core `v24+` (`frontend/test_blackbox.js`) & Pytest 9.1.1 (`backend/tests/test_api.py`) |

---

## 2. Tabel Hasil Pengujian Black-Box (Berdasarkan PRD Bagian 14)

Tabel berikut menyajikan rincian hasil pengujian 10 skenario fungsional antarmuka sistem:

| ID | Skenario Pengujian | Aksi & Input Pengujian | Hasil yang Diharapkan | Hasil Aktual (Pengujian Browser) | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **BB-01** | Login dengan kredensial benar | Input email `manager@esports-talent.id` dan kata sandi `password123`, lalu klik tombol *"Masuk Sekarang"*. | Masuk ke dashboard sesuai role (Role Manager dialihkan ke `/manager/dashboard`). | Sistem memvalidasi kredensial pengguna, menyimpan sesi autentikasi, dan mengalihkan browser langsung ke `/manager/dashboard`. | **LULUS** |
| **BB-02** | Login dengan kredensial salah | Input email `manager@esports-talent.id` dan kata sandi salah `wrongpassword_123`, lalu klik tombol *"Masuk Sekarang"*. | Akses login ditolak dan pesan error ditampilkan kepada pengguna. | Sistem menolak autentikasi dan menampilkan banner error merah: *"Email atau kata sandi tidak valid. Silakan periksa kembali."* | **LULUS** |
| **BB-03** | Input statistik valid | Pengguna (Role Player) mengisi seluruh parameter statistik pertandingan yang valid (Kills: 12, Damage: 1350, Survival: 25m, Headshot: 38.5%, Rank: #1), lalu klik *"Hitung Player Score"*. | Skor 0–100 dan badge kategori tampil secara real-time ($\le 1$ detik). | Model XGBoost backend mengembalikan respons dalam 42ms. Gauge skor menampilkan **80.1 / 100**, badge **Elite**, dan radar profil keahlian pemain terupdate. | **LULUS** |
| **BB-04** | Input statistik tidak valid | Pengguna menginput nilai statistik di luar batas realistis (misalnya Headshot: 150%, Rank: 0, atau angka negatif), lalu klik submit. | Validasi sistem menolak submit dan menampilkan pesan instruktif. | Form menolak submit dan memunculkan notifikasi peringatan: *"Persentase Headshot tidak valid. Nilai harus berada di rentang 0% hingga 100%."* | **LULUS** |
| **BB-05** | Buka leaderboard | Pengguna membuka menu Leaderboard (`/manager/leaderboard`). | Pemain terurut secara menurun (*descending*) berdasarkan Player Score. | Tabel 2.500 pemain langsung dimuat dengan pengurutan skor menurun: peringkat 1 skor 85.5, peringkat 2 skor 79.8, peringkat 3 skor 79.1, peringkat 4 skor 78.4, peringkat 5 skor 78.0. | **LULUS** |
| **BB-06** | Filter berdasarkan Tier dan rentang skor | Memilih filter Tier = *Ace* dan menggeser slider Skor Minimum = *50*. | Hanya data pemain yang memenuhi kedua kriteria tersebut yang tampil pada tabel. | Seluruh baris sampel pada tabel hanya menampilkan pemain dengan Tier *Ace* dan nilai Player Score $\ge 50$ (rentang skor sampel: 77.7 s/d 68.9). | **LULUS** |
| **BB-07** | Cari IGN | Mengetik kata kunci `"P10"` pada kolom pencarian nama/ID pemain. | Tabel menampilkan pemain yang ID atau IGN-nya memuat kata kunci pencarian secara real-time. | Ditemukan 25 pemain pada halaman aktif, seluruh baris memuat teks `"P10"` pada kolom Player ID (misal: P1026, P1014, P1055, P1001). | **LULUS** |
| **BB-08** | Tambah pemain ke shortlist | Mengklik tombol ikon Bookmark (*"Tambah ke Shortlist"*) pada pemain di tabel Leaderboard, lalu membuka halaman Shortlist. | Pemain berhasil masuk dan muncul dalam daftar Shortlist Manager. | Notifikasi toast *"Pemain berhasil ditambahkan ke shortlist"* muncul, dan pemain tersebut terdaftar pada tabel `/manager/shortlists`. | **LULUS** |
| **BB-09** | Ekspor shortlist | Mengklik tombol *"Ekspor Shortlist (CSV)"* pada halaman `/manager/shortlists`. | File dokumen berformat `.csv` terunduh berisi data lengkap kandidat. | File CSV ter-generate otomatis dengan MIME type `text/csv`, memuat kolom header dan data lengkap (Player_ID, IGN, Tier, Score, Category, Kills, Damage, Survival, Rank, Weapon, Notes, Added_At). | **LULUS** |
| **BB-10** | Bandingkan 2–3 pemain | Memilih 2 sampai 3 pemain dari Leaderboard dan membuka halaman `/manager/compare`. | Radar chart komparasi multi-sumbu dan tabel statistik berdampingan tampil secara presisi. | Recharts Responsive Radar menampilkan overlay multi-layer dengan legenda pembeda, disertai matriks komparasi statistik *head-to-head* lengkap dengan penanda *best-value winner*. | **LULUS** |

---

## 3. Catatan Bug yang Ditemukan dan Solusi Perbaikan (Bug Resolution Log)

Selama pengujian verifikasi mendalam di browser, ditemukan 5 permasalahan teknis (*bugs*) yang langsung diperbaiki secara menyeluruh:

### Bug 1: Otentikasi Mock Selalu Menerima Password Sembarang (BB-02)
- **Gejala Masalah:** Fungsi `mockAuth.signInWithPassword` pada `supabaseClient.js` sebelumnya selalu mengembalikan `success: true` tanpa memvalidasi kebenaran kata sandi yang diketikkan pengguna.
- **Penyebab:** Belum ada mekanisme pencocokan kredensial terhadap daftar akun pengguna di layer mock.
- **Solusi Perbaikan:** Mengimplementasikan penyimpanan `pulse_scout_mock_users` di `localStorage` beserta kredensial akun bawaan (`manager@esports-talent.id` dan `player@esports-talent.id` dengan password `password123`). Jika kata sandi tidak cocok, sistem secara tegas mengembalikan objek error dengan pesan *"Email atau kata sandi tidak valid. Silakan periksa kembali."*.

### Bug 2: Pelanggaran Aturan React Hook pada Komparasi Pemain (BB-10)
- **Gejala Masalah:** Pemanggilan `usePlayerStore().addToCompare(p)` di dalam callback event handler `onClick` pada tombol drawer pemilihan pemain di `ComparePage.jsx`.
- **Penyebab:** React Hooks hanya boleh dipanggil di tingkat atas (*root level*) fungsi komponen, bukan di dalam callback interaksi atau percabangan (*conditional statement*).
- **Solusi Perbaikan:** Mendestrukturisasi `addToCompare` langsung dari `usePlayerStore()` pada baris awal komponen `ComparePage` dan menggunakan fungsi referensi tersebut di dalam handler `onClick`.

### Bug 3: Hilangnya State Pemain Komparasi Saat Halaman Dimuat Ulang (BB-10)
- **Gejala Masalah:** Saat berpindah halaman atau merefresh browser di `/manager/compare`, daftar pemain yang dipilih untuk dikomparasikan kembali menjadi kosong (*empty state*).
- **Penyebab:** State `comparedPlayers` sebelumnya hanya disimpan dalam memori RAM React tanpa sinkronisasi ke penyimpanan persisten browser.
- **Solusi Perbaikan:** Menambahkan persistensi `COMPARED_STORAGE_KEY = "pulse_scout_compared_players"` pada `PlayerStoreContext.jsx` lengkap dengan inisialisasi awal berbasis `localStorage` dan sinkronisasi otomatis menggunakan `useEffect`.

### Bug 4: Error Validasi Formulir Input Statistik Tidak Muncul ke UI (BB-04)
- **Gejala Masalah:** Ketika pemain memasukkan angka di luar batas (misal Headshot 150%), browser menahan proses submit menggunakan tooltip default browser dan tidak memunculkan desain notifikasi banner e-sports aplikasi.
- **Penyebab:** Formulir HTML5 menerapkan validasi native bawaan browser yang menahan eksekusi handler `onSubmit` React sebelum validasi kustom sempat berjalan.
- **Solusi Perbaikan:** Menambahkan atribut `noValidate` pada elemen `<form>` di `PlayerInputPage.jsx` serta menambahkan validasi batas realistis pra-submit (*pre-validation*) lengkap dengan formatting pesan error yang ramah pengguna.

### Bug 5: Desinkronisasi Kolom Pembacaan Skor pada Pengurutan Leaderboard (BB-05 & BB-06)
- **Gejala Masalah:** Pengujian otomatis awal membaca kolom indeks ke-5 (yang berisi nilai *Kills*) alih-alih kolom indeks ke-4 (yang berisi *Player Score*).
- **Penyebab:** Perbedaan urutan indeks `<td>` tabel akibat kolom visualisasi badge dan nomor urut global rank.
- **Solusi Perbaikan:** Menyesuaikan selektor DOM pengujian ke kolom indeks ke-4 yang secara spesifik menargetkan elemen teks skor `span.font-gaming.text-lg`.

---

## 4. Kesimpulan dan Implikasi Ilmiah

1. **Kepatuhan Terhadap Indikator Keberhasilan PRD:**  
   Berdasarkan indikator keberhasilan pada **Bagian 3.2 PRD** (*"Black-Box Testing: 100% skenario kritis lulus"*), seluruh 10 skenario pengujian (**BB-01** sampai **BB-10**) telah teruji dan dinyatakan **LULUS 100%**.
2. **Kesiapan Rilis & Fungsionalitas Sistem:**  
   Platform web *PULSE SCOUT* telah memenuhi seluruh kebutuhan fungsional prioritas **P0** dan **P1** dari PRD Bagian 7, mulai dari autentikasi berbasis role, leaderboard dinamis 2.500 pemain, filter multi-dimensi, komparasi visual radar chart Recharts, kalkulasi model XGBoost real-time, manajemen shortlist, ekspor CSV RFC 4180, hingga transparansi ilmiah model pada Bab IV skripsi.
