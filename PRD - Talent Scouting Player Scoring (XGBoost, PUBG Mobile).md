# PRD: Talent Scouting Player Scoring Berbasis XGBoost

**Produk:** Platform web Talent Scouting untuk PUBG Mobile **Penulis:** Axel Juanito Parlindungan Sibarani (NPM 065122199) **Program Studi:** Ilmu Komputer, FMIPA, Universitas Pakuan **Versi:** 1.0 (Draft) **Status:** Siap diimplementasikan

## 1. Ringkasan Produk

Platform ini adalah website talent scouting yang membantu manajer dan organisasi e-sport menilai kandidat pemain PUBG Mobile secara objektif. Sistem mengubah statistik pertandingan pemain menjadi **Player Score (0-100)** menggunakan model **XGBoost Regressor**. Skor tersebut dipakai untuk leaderboard, pencarian dan filter kandidat, perbandingan pemain, serta shortlist rekrutmen.

## 2. Latar Belakang dan Masalah

| Masalah | Dampak |
| --- | --- |
| Rekrutmen atlet e-sport masih subjektif dan rentan bias | Kandidat berpotensi terlewat atau salah pilih |
| Belum ada platform terorganisir berbasis statistik objektif | Manajer menilai secara manual dan tidak konsisten |
| Statistik pertandingan belum diolah menjadi satu skor yang mudah dibandingkan | Sulit membandingkan kandidat secara adil |

**Solusi:** website yang menerima statistik pemain, menghitung skor lewat model XGBoost, lalu menyajikannya dalam bentuk peringkat dan alat bantu seleksi.

## 3. Tujuan dan Indikator Keberhasilan

### 3.1 Tujuan

1. Mengembangkan sistem talent scouting berbasis website.
2. Mengimplementasikan XGBoost pada fitur player scoring.
3. Mengevaluasi kinerja model dengan metrik yang sesuai dan menguji fungsionalitas website.

### 3.2 Indikator Keberhasilan

| Indikator | Target |
| --- | --- |
| R2 Score model pada data uji | >= 0,85 |
| RMSE dan MAE | Dilaporkan dan dianalisis (target RMSE kecil relatif terhadap rentang 0-100) |
| Waktu respons endpoint /predict | <= 1 detik pada kondisi normal |
| Black-Box Testing | 100% skenario kritis lulus |
| Seluruh fitur MVP | Dapat diakses melalui browser setelah deployment |

## 4. Ruang Lingkup

### 4.1 Dalam Lingkup

- Fokus pada game PUBG Mobile.
- Dataset sekunder Kaggle: *PUBG Mobile Win & Performance Prediction Dataset* (2.500 baris).
- Algoritma machine learning hanya XGBoost (Regressor).
- Aplikasi web dengan dua role: Manager dan Player.

### 4.2 Di Luar Lingkup

- Game selain PUBG Mobile.
- Algoritma pembanding (Random Forest, KNN, dan sebagainya).
- Aplikasi mobile native.
- Pengambilan data otomatis dari API resmi game.
- Pembayaran, chat, dan fitur sosial.

## 5. Pengguna dan Role

| Role | Deskripsi | Kebutuhan Utama |
| --- | --- | --- |
| Manager / Scout | Manajer tim atau organisasi e-sport | Menemukan, memfilter, membandingkan, dan menyimpan kandidat terbaik |
| Player | Pemain yang ingin mengetahui kemampuannya | Memasukkan statistik, melihat skor dan riwayat perkembangan |
| Admin (opsional) | Pengelola sistem | Mengelola data dan pengguna |

## 6. User Stories

**Manager**

- Sebagai manager, saya ingin melihat leaderboard pemain berdasarkan Player Score agar cepat mengenali kandidat terbaik.
- Sebagai manager, saya ingin memfilter pemain berdasarkan Tier, Map, senjata favorit, dan rentang skor agar sesuai kebutuhan tim.
- Sebagai manager, saya ingin membandingkan 2-3 pemain secara berdampingan agar keputusan lebih objektif.
- Sebagai manager, saya ingin membuat shortlist beserta catatan dan mengekspornya ke CSV.

**Player**

- Sebagai player, saya ingin memasukkan statistik pertandingan dan langsung melihat Player Score saya.
- Sebagai player, saya ingin melihat riwayat skor agar tahu perkembangan performa saya.

## 7. Kebutuhan Fungsional

Prioritas: **P0** = wajib (MVP), **P1** = penting, **P2** = tambahan.

| ID | Fitur | Deskripsi | Prioritas |
| --- | --- | --- | --- |
| FR-01 | Autentikasi | Register, login, logout dengan Supabase Auth; proteksi route berdasarkan role | P0 |
| FR-02 | Input statistik | Form statistik pemain dengan validasi rentang nilai | P0 |
| FR-03 | Kalkulasi skor real-time | Memanggil API /predict dan menampilkan skor 0-100 beserta kategori | P0 |
| FR-04 | Leaderboard | Tabel pemain berurut skor, sorting, dan pagination | P0 |
| FR-05 | Filter dan pencarian | Cari IGN; filter Tier, Map, Favorite Weapon, rentang skor, kategori | P0 |
| FR-06 | Detail pemain | Seluruh statistik, skor, dan radar chart | P1 |
| FR-07 | Bandingkan pemain | Perbandingan 2-3 pemain dengan radar chart | P1 |
| FR-08 | Shortlist | Buat daftar, tambah atau hapus kandidat, catatan, ekspor CSV | P0 |
| FR-09 | Dashboard manager | Jumlah kandidat, rata-rata skor, distribusi skor, top 5 | P1 |
| FR-10 | Riwayat skor player | Daftar dan grafik perkembangan skor per pemain | P1 |
| FR-11 | Halaman Tentang Model | Menampilkan RMSE, MAE, R2, parameter terbaik, dan feature importance | P1 |
| FR-12 | Impor dataset | Skrip impor 2.500 baris dataset beserta skornya ke database | P0 |
| FR-13 | Prediksi batch | Menghitung skor untuk banyak pemain sekaligus | P2 |

### Kategori Skor

| Rentang Skor | Kategori |
| --- | --- |
| 0-39 | Rendah |
| 40-59 | Menengah |
| 60-79 | Tinggi |
| 80-100 | Elite |

## 8. Kebutuhan Non-Fungsional

| ID | Kebutuhan | Rincian |
| --- | --- | --- |
| NFR-01 | Kinerja | Respons prediksi <= 1 detik; model dimuat sekali saat startup |
| NFR-02 | Keamanan | Row Level Security di Supabase; secret disimpan di environment variable; validasi input di frontend dan backend |
| NFR-03 | Kompatibilitas | Chrome, Edge, Firefox versi terbaru |
| NFR-04 | Responsif | Nyaman di ponsel, tablet, dan desktop |
| NFR-05 | Keterbacaan kode | Struktur modular, komentar bahasa Indonesia pada bagian penting |
| NFR-06 | Ketersediaan | Dapat diakses melalui cloud server setelah deployment |
| NFR-07 | Kegunaan | Loading state, error state, dan notifikasi pada setiap aksi |

## 9. Spesifikasi Data dan Machine Learning

### 9.1 Dataset

Sumber: Kaggle (Husain, 2024), 2.500 baris statistik pertandingan level pemain. Kolom: Player\_ID, Map, Tier, Kills, Damage\_Dealt, Survival\_Time\_Minutes, Headshot\_Percentage, Assists, Revives, Distance\_Travelled\_km, Longest\_Kill\_meters, Heals\_Used, Boosts\_Used, Match\_Rank, Win, Favorite\_Weapon.

**Fitur masukan model:** Tier, Kills, Damage\_Dealt, Survival\_Time\_Minutes, Headshot\_Percentage, Assists, Revives, Distance\_Travelled\_km, Longest\_Kill\_meters, Heals\_Used, Boosts\_Used, Match\_Rank.

### 9.2 Tahapan KDD (dalam fase Design)

| Tahap | Aktivitas |
| --- | --- |
| Data Selection | Memilih atribut yang relevan dengan target penelitian |
| Pre-Processing | Cek missing values (imputasi median), outlier (IQR, capping), dan duplikat |
| Transformation | Label Encoding untuk Tier; Min-Max Scaling untuk fitur numerik; split data latih:uji = 80:20 (random\_state=42) |
| Modeling | XGBRegressor dengan GridSearchCV (cv=5) untuk learning\_rate, max\_depth, n\_estimators |
| Evaluation | RMSE, MAE, dan R2 Score pada data uji |

### 9.3 Pembentukan Label Target (Player Score)

Dataset belum memiliki skor akhir, sehingga label dibentuk secara sintetis dengan **domain-knowledge weighting**. Setiap komponen dinormalisasi Min-Max, dijumlahkan berbobot, lalu diskalakan ke 0-100. Match\_Rank bersifat penalti (peringkat lebih baik = angka lebih kecil = skor lebih tinggi, sehingga nilainya dibalik).

| Komponen | Arah | Bobot Awal |
| --- | --- | --- |
| Kills | Positif | 0,25 |
| Damage\_Dealt | Positif | 0,25 |
| Survival\_Time\_Minutes | Positif | 0,15 |
| Headshot\_Percentage | Positif | 0,10 |
| Assists | Positif | 0,10 |
| Revives | Positif | 0,05 |
| Match\_Rank (invers) | Penalti | 0,10 |

Bobot disimpan di file konfigurasi (`ml/config.py`) agar mudah disesuaikan dan disamakan dengan Bab IV laporan.

### 9.4 Artefak Model

`model.joblib`, `scaler.joblib`, `label_encoder.joblib`, `metrics.json`, serta plot actual vs predicted, residual, dan feature importance.

## 10. Arsitektur dan Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Frontend | React (Vite), Tailwind CSS, React Router, recharts, lucide-react |
| Backend ML API | Python FastAPI, xgboost, scikit-learn, pandas, joblib |
| Database dan Auth | Supabase (PostgreSQL, Auth, Row Level Security) |
| Training model | Skrip Python / Google Colab |
| Deployment | Frontend: Vercel atau Netlify; Backend: Render atau Railway |

**Alur sistem:**

1. Pengguna mengisi statistik di React.
2. React memanggil FastAPI `/predict`; model mengembalikan skor.
3. React menyimpan data dan skor ke Supabase.
4. Leaderboard, filter, dan shortlist membaca langsung dari Supabase.

## 11. Spesifikasi API (FastAPI)

| Method | Endpoint | Fungsi | Output |
| --- | --- | --- | --- |
| POST | /predict | Prediksi skor satu pemain | player\_score, kategori |
| POST | /predict/batch | Prediksi banyak pemain | daftar skor |
| GET | /model/metrics | Metrik evaluasi | RMSE, MAE, R2, best params |
| GET | /model/feature-importance | Pentingnya fitur | daftar fitur dan nilai |
| GET | /health | Cek layanan | status |

Validasi input memakai Pydantic; CORS diaktifkan untuk domain frontend.

## 12. Skema Database (Supabase)

| Tabel | Kolom Utama |
| --- | --- |
| profiles | id (FK auth.users), full\_name, role (manager/player), created\_at |
| players | id, user\_id (nullable), ign, tier, map, favorite\_weapon, kills, damage\_dealt, survival\_time\_minutes, headshot\_percentage, assists, revives, distance\_travelled\_km, longest\_kill\_meters, heals\_used, boosts\_used, match\_rank, player\_score, score\_category, created\_at |
| shortlists | id, manager\_id, name, created\_at |
| shortlist\_items | id, shortlist\_id, player\_id, notes, created\_at |

**Aturan RLS:** manager dapat membaca seluruh pemain dan mengelola shortlist miliknya sendiri; player hanya dapat mengubah data miliknya.

## 13. Desain Antarmuka (UI/UX)

- Tema gelap bergaya e-sports dengan aksen oranye/amber atau cyan.
- Tipografi tegas; kartu dan tabel bersih.
- Gauge skor 0-100 yang menonjol pada hasil prediksi.
- Komponen reusable dan konsisten; desain awal dibuat di Figma.

**Halaman utama:**

| Halaman | Role |
| --- | --- |
| Login / Register | Semua |
| Dashboard | Manager |
| Leaderboard dan Filter | Manager |
| Detail Pemain | Manager |
| Bandingkan Pemain | Manager |
| Shortlist | Manager |
| Input Statistik dan Hasil Skor | Player |
| Riwayat Skor | Player |
| Tentang Model | Semua |

## 14. Rencana Pengujian

- **Model:** RMSE, MAE, R2 pada data uji; analisis residual dan feature importance.
- **Backend:** pytest untuk endpoint (nilai valid, di luar rentang, field kurang).
- **Black-Box Testing:** memvalidasi seluruh fungsi antarmuka.

| ID | Skenario | Hasil Diharapkan |
| --- | --- | --- |
| BB-01 | Login dengan kredensial benar | Masuk ke dashboard sesuai role |
| BB-02 | Login dengan kredensial salah | Pesan error ditampilkan |
| BB-03 | Input statistik valid | Skor 0-100 dan kategori tampil |
| BB-04 | Input statistik tidak valid | Validasi menolak dan menampilkan pesan |
| BB-05 | Buka leaderboard | Pemain terurut menurun berdasarkan skor |
| BB-06 | Filter berdasarkan Tier dan rentang skor | Hanya data sesuai filter yang tampil |
| BB-07 | Cari IGN | Hasil sesuai kata kunci |
| BB-08 | Tambah pemain ke shortlist | Pemain muncul di shortlist |
| BB-09 | Ekspor shortlist | File CSV terunduh |
| BB-10 | Bandingkan 2-3 pemain | Radar chart dan statistik berdampingan tampil |

## 15. Deployment

- Frontend dipublikasikan ke Vercel atau Netlify.
- Backend FastAPI ke Render atau Railway beserta artefak model.
- Supabase sebagai layanan terkelola.
- Environment variable: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.

## 16. Rencana Pengembangan (SDLC)

| Fase | Aktivitas | Keluaran |
| --- | --- | --- |
| Planning | Identifikasi masalah, tujuan, ruang lingkup | Dokumen perencanaan |
| Analysis | Analisis kebutuhan fungsional, non-fungsional, dan data | PRD ini |
| Design | Flowchart, use case, ERD, UI di Figma, dan perancangan model (KDD) | Rancangan sistem dan model |
| Implementation | Training model, FastAPI, skema Supabase, frontend | Aplikasi berjalan |
| Testing | Evaluasi model dan Black-Box Testing | Laporan pengujian |
| Deployment | Publikasi ke cloud | Aplikasi dapat diakses publik |

**Urutan pengerjaan teknis:** (1) pipeline ML, (2) FastAPI, (3) skema Supabase, (4) frontend, (5) pengujian.

## 17. Risiko dan Asumsi

| Risiko / Asumsi | Mitigasi |
| --- | --- |
| Label Player Score sintetis sehingga model cenderung mempelajari rumus pembobotan (R2 sangat tinggi) | Jelaskan di pembahasan bahwa model dipakai untuk generalisasi dan efisiensi; validasi bobot dengan studi literatur atau pakar |
| Min-Max Scaling tidak diperlukan oleh model berbasis pohon | Tetap diterapkan sesuai metodologi dan dijelaskan di laporan |
| Nama dan urutan Tier pada dataset belum dipastikan | Cek nilai unik Tier pada dataset sebelum menetapkan urutan encoding |
| Dataset hanya 2.500 baris | Gunakan cross-validation dan laporkan keterbatasannya |
| Layanan gratis (Render/Railway) dapat lambat saat cold start | Tampilkan loading state; pertimbangkan keep-alive |

## 18. Pertanyaan Terbuka

1. Apakah bobot Player Score sudah final menurut Bab IV laporan?
2. Apakah role Admin diperlukan, atau cukup Manager dan Player?
3. Apakah data pemain pada leaderboard hanya berasal dari dataset Kaggle atau juga dari input pengguna?
4. Platform deployment mana yang dipilih untuk backend?

## Referensi

Husain, A. (2024). *PUBG Mobile Win and Performance Prediction Dataset*. Kaggle. Susrifalah, A. et al. (2025). Application of Extreme Gradient Boosting Algorithm with ADASYN. Nasution et al. (2026); Mestika et al. (2021); Fitria et al. (2020).
