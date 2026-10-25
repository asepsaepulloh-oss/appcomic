# iComic — Your World of Stories

Platform Manhwa Reader modern dengan katalog, pencarian, detail manhwa, bookmark, histori bacaan, dan fitur membaca chapter secara langsung (Vertical Scroll & Single Page).

Website ini siap di-deploy langsung ke **Vercel** maupun dijalankan secara lokal dengan performa tinggi.

---

## Fitur Utama

- **Katalog Lengkap & Pencarian**: Jelajahi judul manhwa populer, trending hari ini, update terbaru, dan pencarian instan dengan pagination.
- **Detail Manhwa Komprehensif**: Menampilkan cover, rating, status (Ongoing/Completed), genre, sinopsis, penulis/studio, dan daftar ratusan chapter dengan fitur pencarian dan pengurutan (terbaru/terlama).
- **Manhwa Reader Interaktif**:
  - **Vertical Scroll Mode (Default)**: Pembacaan gaya Webtoon vertikal tanpa jeda dengan lazy loading dan scroll progress bar.
  - **Single Page Mode**: Membaca satu per satu halaman dengan tombol next/prev, loncat ke halaman pertama/terakhir, dan navigasi keyboard (panah kiri/kanan).
  - **Reader Settings**: Pengaturan tema background (Hitam Pekat, Dark Navy, Charcoal), Fit Width / Fit Height, pengaturan gap antar panel, dan fullscreen toggle.
  - **Image Proxying**: Panel komik di-proxy via `/api/image-proxy` dengan proteksi referer sehingga terbebas dari error hotlinking atau CORS.
- **Reading Progress & Bookmarks**:
  - Menyimpan progres membaca secara otomatis ke `localStorage` (client-side SSR-safe).
  - Tombol **Lanjut Membaca** di Beranda dan halaman Detail.
  - Fitur **Bookmarks** dengan modal manajemen tersimpan.

---

## Panduan Instalasi & Menjalankan Lokal

### 1. Instalasi Dependency
Pastikan Anda memiliki Node.js 18+ terpasang di sistem Anda.

```bash
npm install
```

### 2. Menjalankan Development Server
Jalankan dev server iComic:

```bash
npm run dev
```

Buka browser di `http://localhost:3000`.

### 3. Menjalankan Unit Tests (Logika & Parser)
Proyek ini dilengkapi dengan unit test native Node.js:

```bash
node --test
```

### 4. Build Produksi
Verifikasi bahwa build produksi berhasil tanpa error:

```bash
npm run build
```

---

## Pengujian API Internal

Anda dapat menguji endpoint API berikut secara langsung:

1. **Beranda**:
   ```bash
   curl http://localhost:3000/api/home
   ```
2. **Pencarian Manga**:
   ```bash
   curl "http://localhost:3000/api/manga?q=lookism&page=1"
   ```
3. **Katalog Pagination**:
   ```bash
   curl "http://localhost:3000/api/manga?page=2"
   ```
4. **Detail Manhwa**:
   ```bash
   curl http://localhost:3000/api/manga/lookism
   ```
5. **Detail Chapter & Panel Gambar**:
   ```bash
   curl http://localhost:3000/api/chapter/lookism-chapter-623
   ```

---

## Panduan Deployment ke Vercel

### Langkah 1: Push Repository ke GitHub
Inisialisasi git dan push kode ke GitHub Anda:

```bash
git init
git add .
git commit -m "feat: iComic Manhwa Reader full release"
git branch -M main
git remote add origin https://github.com/<username>/<repository-name>.git
git push -u origin main
```

### Langkah 2: Import Proyek di Vercel Dashboard
1. Buka [vercel.com](https://vercel.com) dan login ke akun Anda.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Hubungkan akun GitHub Anda dan pilih repository yang baru saja di-push.
4. Pada konfigurasi build:
   - **Framework Preset**: Pilih **Vite** (atau biarkan Vercel mendeteksi secara otomatis).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Klik **"Deploy"**.

### Langkah 3: Pengujian Domain Produksi
Setelah proses build Vercel selesai (biasanya memakan waktu 30-60 detik):
- Buka URL produksi yang diberikan oleh Vercel (misal: `https://icomic-reader.vercel.app`).
- Uji navigasi Beranda -> Detail Manga -> Reader.
- Refresh halaman pada `/manga/lookism` dan `/read/lookism-chapter-623` untuk memverifikasi URL langsung bekerja dengan baik.

---

## Struktur Proyek

```
app/
├── api/
│   ├── home/route.ts
│   ├── manga/route.ts
│   ├── manga/[slug]/route.ts
│   ├── chapter/[slug]/route.ts
│   └── image-proxy/route.ts
src/
├── components/
│   ├── Navbar.tsx
│   ├── MangaCard.tsx
│   ├── MangaGrid.tsx
│   ├── SearchBar.tsx
│   ├── ContinueReading.tsx
│   ├── ChapterList.tsx
│   ├── Reader.tsx
│   ├── ReaderHeader.tsx
│   ├── ReaderControls.tsx
│   ├── ReaderSettings.tsx
│   ├── BookmarksModal.tsx
│   └── Footer.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── ExplorePage.tsx
│   └── DetailPage.tsx
├── App.tsx
├── index.css
└── main.tsx
lib/
├── scraper.ts
├── parser.ts
├── validation.ts
├── cache.ts
└── reading-progress.ts
types/
└── manga.ts
server.ts
vercel.json
package.json
README.md
```

---

## Hak Cipta & Ketentuan Penggunaan
Aplikasi ini hanya berfungsi sebagai antarmuka pembaca untuk konten komik publik dari sumber data yang diakses. Seluruh hak cipta, karya seni, dan cerita adalah milik pencipta dan penerbit masing-masing.
