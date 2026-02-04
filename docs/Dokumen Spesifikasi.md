# 📘 Dokumen Spesifikasi: SaaS Sistem Informasi Sekolah (SIS)
**Visi Produk:** Digitalisasi ekosistem sekolah Indonesia yang cepat, andal, dan adaptif.
**Arsitektur:** Multi-tenancy (Satu Aplikasi, Banyak Sekolah).
**Teknologi Utama:** Next.js 15, Supabase (PostgreSQL), Tailwind CSS, shadcn/ui.

**System:** Modular, Responsive, dan Fast.
**Security:** RLS, JWT, dan OAuth.

**Image:** webp, max 5mb

**File:** pdf, max 5mb
**upload file:** compressed

**Website UI** Clean, White, dan Modern.

**master data:** konfigurasi data yang sering digunakan di seluruh sistem. menjadi menu tersendiri

**feature:** fitur yang dapat diaktifkan atau dinonaktifkan secara dinamis per sekolah menggunakan sistem *Feature Flags* yang disimpan dalam format JSONB di database.

**domain:** domain custom untuk setiap sekolah.

**pagination:** pagination default 10 data per halaman.

**search:** search dapat mencari di semua halaman walaupun tidak berada di halaman tersebut.

**filter:** filter dapat memfilter data di semua halaman walaupun tidak berada di halaman tersebut.

---

## 1. Arsitektur & Keamanan Utama
Sistem ini menggunakan fondasi teknologi modern untuk memastikan performa maksimal dan kemudahan konfigurasi.

* **Multi-tenancy Model**: Menggunakan model *Shared Database & Shared Schema* di mana satu database melayani banyak sekolah.
* **Keamanan Data (RLS)**: Isolasi data antar sekolah dijamin oleh PostgreSQL **Row Level Security (RLS)**; setiap akses data wajib divalidasi berdasarkan `school_id`.
* **Kustomisasi Fitur**: Fitur dapat diaktifkan atau dinonaktifkan secara dinamis per sekolah menggunakan sistem *Feature Flags* yang disimpan dalam format JSONB di database.

---

## 2. Modul Operasional & Fitur Utama
Berdasarkan pemetaan modul sekolah, berikut adalah rincian fitur yang tersedia:

### A. Administrasi & Kepegawaian
* **Manajemen Siswa**: Pengelolaan siswa diterima, proses PPDB, mutasi siswa, hingga penyimpanan berkas digital dan profil lengkap.
* **Manajemen Pegawai**: Pengelolaan data jabatan, surat menyurat (masuk/keluar), dan administrasi berkas pendidik.

### B. Kurikulum & Akademik
* **Manajemen Kelas**: Pengaturan rombongan belajar (rombel), wali kelas, serta mekanisme kenaikan kelas.
* **Jadwal & Kalender**: Penyusunan jadwal pelajaran tingkat dasar hingga lanjut serta manajemen kalender akademik sekolah.
* **E-Raport**: Pengelolaan nilai dan cetak rapor sesuai standar Kurikulum 2013/Merdeka.

### C. Presensi & Monitoring Harian
* **Presensi Terpadu**: Pencatatan kehadiran per jam pelajaran oleh guru dan verifikasi mandiri oleh siswa.
* **Integrasi Hardware**: Mendukung koneksi ke perangkat **Fingerprint** untuk presensi otomatis pegawai dan siswa.
* **Manajemen RPP**: Sistem pengajuan dan persetujuan berkas Rencana Pelaksanaan Pembelajaran (RPP) guru.

### D. Finansial & Sarana Prasarana
* **Keuangan Tagihan**: Pengelolaan biaya akademik (SPP), pembayaran digital, tabungan siswa, dan pencatatan kas sekolah.
* **Inventaris (Sarpras)**: Manajemen aset sekolah, mutasi barang, serta pemantauan kondisi fisik sarana prasarana.

### E. Penunjang & Mutu
* **Perpustakaan**: Manajemen buku dengan metode LCC, data peminjaman, dan statistik kunjungan.
* **Penjamin Mutu**: Pengelolaan data lomba, prestasi siswa/pegawai, dan rencana kerja strategis kepala sekolah.

---

## 3. Sistem Langganan (Subscription)
Model bisnis aplikasi diatur melalui tingkatan paket langganan (`subscription_plan`):

| Paket | Batasan Akses | Fitur Unggulan |
| :--- | :--- | :--- |
| **Free**  |
| **Pro** |
| **Enterprise** |

*Pembayaran diintegrasikan dengan Payment Gateway (seperti Midtrans) untuk pembaruan status paket secara otomatis melalui Supabase Edge Functions.*

---

## 4. Mekanisme Data & Sinkronisasi
Mengingat aplikasi ini beroperasi secara mandiri (tanpa integrasi API otomatis ke pusat), sinkronisasi data dilakukan melalui:

* **Manual Data Sync**: Penggunaan fitur *Import Wizard* untuk mengunggah data dari format Excel/CSV standar pemerintah ke database SaaS.
* **Unique Identifier**: Menggunakan NISN sebagai kunci utama untuk memastikan konsistensi data profil siswa dengan data nasional.
* **Single Source of Truth**: Website menjadi sumber data harian (absen, nilai, keuangan), sementara data profil administratif disinkronkan secara berkala melalui unggahan file.

---

## 5. Roadmap Pengembangan
* **Fase 1**: Setup infrastruktur database, Auth, dan modul Administrasi dasar.
* **Fase 2**: Implementasi modul Kurikulum, Jadwal, dan Presensi harian.
* **Fase 3**: Integrasi sistem Keuangan, E-Raport, dan koneksi Fingerprint.