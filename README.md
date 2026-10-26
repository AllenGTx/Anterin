# 🚗 Anterin V2 — Platform Rental Mobil Mewah VVIP Semarang

[![Production Status](https://img.shields.io/badge/Production-Live-success?style=for-the-badge&logo=vercel)](https://anterin-v2.vercel.app)
[![Automated QA Tests](https://img.shields.io/badge/QA%20Tests-210%2F210%20Passed-brightgreen?style=for-the-badge&logo=node.js)](tests/qa_automation_runner.js)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**Anterin V2** adalah platform reservasi dan penyewaan mobil mewah (*luxury & executive car rental*) terdepan yang beroperasi di wilayah Semarang dan sekitarnya. Dirancang dengan antarmuka modern bernuansa *Luxury Navy & Champagne Gold*, Anterin memberikan pengalaman pemesanan armada premium tanpa kendala, baik untuk keperluan dinas kenegaraan, kunjungan eksekutif bisnis, pariwisata VIP, maupun kebutuhan pribadi.

🌐 **Aplikasi Live Production:** [https://anterin-v2.vercel.app](https://anterin-v2.vercel.app)

---

## ✨ Fitur Utama

### 1. 🚘 Katalog Armada Lengkap & Spesifikasi Mendalam
- Pilihan armada eksekutif terlengkap: **BMW X7 xDrive, Mercedes-Benz S-Class, Range Rover Vogue, Lexus LM 350, Audi A8 L, Toyota Alphard VIP, Toyota Fortuner GR Sport, Toyota Innova Zenix & Reborn, hingga Toyota Hiace Premio**.
- Dilengkapi detail spesifikasi kapasitas, fitur keselamatan, galeri foto resolusi tinggi dengan mode *lightbox actual size*, dan informasi fasilitas armada.

### 2. 💳 Alur Pemesanan & Pembayaran QRIS Standar Nasional
- Alur checkout instan dengan dukungan **QRIS Standar Nasional (GPN)**.
- Perhitungan tarif sewa otomatis berdasarkan durasi (harian/jam) dan opsi layanan (*Lepas Kunci* atau *Dengan Supir Profesional*).
- Penerbitan struk reservasi digital otomatis dengan format terstandarisasi yang siap dibagikan via WhatsApp.

### 3. 🛡️ Verifikasi Dokumen Identitas (KTP & SIM A)
- Sistem unggah dan verifikasi dokumen identitas resmi pengguna secara aman.
- Validasi status kepemilikan SIM A untuk membuka izin pemesanan layanan *Lepas Kunci (Self-Drive)*.
- Persistensi data profil dan dokumen terenkripsi yang tetap tersimpan aman lintas sesi.

### 4. 👔 Manajemen Mitra Rental & Pengemudi Profesional
- Dashboard mitra rental resmi untuk mengelola ketersediaan unit, penetapan paket rental, dan pencatatan transaksi masuk.
- Sistem rotasi cerdas dan pemantauan jadwal pengemudi (*Driver Conflict Detection*) untuk mencegah bentrok penugasan armada.
- Profil pengemudi tersertifikasi dengan standar pelayanan VVIP (*Defensive Driving*).

### 5. ⭐ Sistem Ulasan Terisolasi & Anti-Spam
- Sistem ulasan riil terikat pada kode booking resmi (*1 Perjalanan = 1 Testimoni*).
- Isolasi ketat ulasan antar unit armada untuk memastikan transparansi dan akurasi rating komunitas.
- Sinkronisasi basis data testimoni bawaan (*seed pool*) dengan testimoni terbaru pelanggan secara *real-time*.

### 6. 🗺️ Penjemputan Presisi dengan Peta Interaktif
- Integrasi peta Leaflet / OpenStreetMap untuk penentuan titik jemput secara akurat.
- Input alamat ganda (alamat jalan utama & patokan lokasi) untuk memudahkan koordinasi dengan penjemput.

---

## 🛠️ Arsitektur & Teknologi

| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Frontend UI/UX** | HTML5 Semantik, CSS3 Modern (Flexbox, Grid, Custom CSS Variables, Glassmorphism), Font Awesome 6, Google Fonts (*Urbanist & Plus Jakarta Sans*) |
| **Peta & Geolocation** | Leaflet.js & OpenStreetMap Tile Layer |
| **Database & Auth** | Firebase Authentication & Cloud Firestore (*Real-time synchronization*) dengan Fallback *Storage Persistence Engine* |
| **QA Automation** | Node.js Test Harness Runner (`tests/qa_automation_runner.js`) dengan 210 test assertions mandiri |
| **Hosting & Deployment** | Vercel Edge Network (Global CDN) |

---

## 🚀 Menjalankan Proyek Secara Lokal

1. **Clone repositori:**
   ```bash
   git clone https://github.com/AllenGTx/Anterin.git
   cd Anterin
   ```

2. **Jalankan aplikasi:**
   Cukup buka file `index.html` atau `HiFi-Anterin-v2.html` langsung di browser web Anda, atau gunakan live server:
   ```bash
   npx serve .
   ```

3. **Menjalankan Automated QA Test Suite:**
   ```bash
   node tests/qa_automation_runner.js
   ```

---

## 📋 Deskripsi Repositori (GitHub About / Description)

> **Platform Reservasi & Rental Mobil Mewah VVIP Semarang — Menghadirkan armada eksekutif, pembayaran QRIS Nasional, verifikasi KTP/SIM, dan integrasi supir profesional berstandar VVIP.**

---

## 👨‍💻 Kontributor & Lisensi

- Dikembangkan untuk **Anterin Indonesia** oleh [AllenGTx](https://github.com/AllenGTx).
- Didistribusikan di bawah lisensi MIT.
