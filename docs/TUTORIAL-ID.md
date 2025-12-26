# StudyCore — Tutorial (Bahasa Indonesia)

Bagian A — Backend (Flask + scikit-learn)
1. Siapkan Python 3.10+.
2. Masuk ke folder `backend/` lalu install dependensi:
   - pip: `pip install -r requirements.txt`
3. Jalankan server (default http://localhost:5000):
   - `python app.py`
4. Dataset contoh: `backend/data/laptops.csv` dengan kolom:
   - `name,brand,cpu,ram_gb,storage_gb,gpu,color_gamut,price`
   - Anda boleh menambah data agar akurasi meningkat. Model dilatih ulang saat server start.
5. Endpoint yang tersedia:
   - GET `/api/metrics` → jumlah dataset, R² (akurasi), RMSE
   - POST `/api/predict` → body JSON spesifikasi; balikan `predicted_price`
   - POST `/api/recommend` → body JSON spesifikasi + `weights`; balikan daftar rekomendasi (harga+spec+trend)
   - POST `/api/compare` → body JSON `{ a: {spec}, b: {spec} }`
6. Tes cepat (opsional) dengan curl:
   - `curl http://localhost:5000/api/metrics`
   - `curl -X POST http://localhost:5000/api/predict -H "Content-Type: application/json" -d '{"brand":"ASUS","cpu":"Intel i7","ram_gb":16,"storage_gb":512,"gpu":"NVIDIA RTX 3050","color_gamut":100}'`

Bagian B — Frontend (Next.js, tema hitam-biru neon)
1. Jika backend BUKAN di `http://localhost:5000`, set variabel lingkungan:
   - `NEXT_PUBLIC_STUDYCORE_API_URL` → contoh `https://api.domain-anda.com`
2. Jalankan di lingkungan lokal (opsional):
   - Node 18+ disarankan. Install deps (`pnpm i` atau `npm i`) lalu jalankan dev (`pnpm dev` atau `npm run dev`).
   - Buka http://localhost:3000
3. Di v0 Preview:
   - Pastikan backend Flask aktif dan dapat diakses publik (atau gunakan default `localhost:5000` jika preview mendukung).
   - Set `NEXT_PUBLIC_STUDYCORE_API_URL` via Environment Variables jika URL backend berbeda.
4. Navigasi fitur:
   - Beranda: deskripsi, tombol “Laptop Pilihanmu!”, statistik (dataset & akurasi), keunggulan.
   - Rekomendasi: form preferensi (Brand 4%, CPU 30%, RAM 22%, Storage 10%, GPU 20%, Gamut 8%, Harga 6%) → hasil terupdate dgn harga+spec+trend (bar).
   - Perbandingan: input Laptop A vs Laptop B (spesifikasi) → prediksi harga & selisih.
   - Tentang: info website, alasan dibangun, catatan.
5. Kustomisasi:
   - Ubah daftar Brand/CPU/GPU di komponen form sesuai kebutuhan pasar.
   - Sesuaikan token warna di `app/globals.css` jika ingin varian biru-neon lain.
   - Bobot rekomendasi bisa diubah di payload `weights`.

Tips singkat
- Tambahkan baris data untuk meningkatkan generalisasi model.
- Gunakan `metrics` untuk memantau kualitas model (R² dan RMSE).
- Pastikan CORS backend aktif (sudah diaktifkan di `backend/app.py`).
