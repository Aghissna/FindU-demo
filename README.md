# FindU — Campus Lost & Found

Aplikasi frontend FindU dibuat dengan React, TypeScript, dan Vite.

## Menjalankan project

Pastikan Node.js sudah terpasang. Buka terminal di folder `FindU`, lalu jalankan:

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite di terminal (biasanya `http://localhost:5173`).

## Build untuk production

```bash
npm run build
npm run preview
```

## Struktur folder

```text
FindU/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── styles.css
    ├── types.ts
    ├── components/
    │   ├── ItemCard.tsx
    │   ├── Modal.tsx
    │   └── Sidebar.tsx
    ├── data/
    │   └── seed.ts
    ├── pages/
    │   ├── ChatPage.tsx
    │   ├── HomePage.tsx
    │   ├── ReportPage.tsx
    │   └── SearchPage.tsx
    └── utils/
        └── storage.ts
```

## Fitur yang bisa dicoba

- Melihat laporan barang contoh di beranda.
- Mencari dan memfilter barang berdasarkan kategori, lokasi, dan status.
- Membuat laporan barang hilang atau ditemukan, termasuk unggah foto.
- Membuka detail barang dan memulai alur klaim lewat chat.
- Mengirim pesan demo di dalam aplikasi.
- Menyimpan barang favorit melalui ikon hati.
- Data laporan dan chat disimpan pada `localStorage` browser.

## Catatan penting

Ini adalah **prototype frontend** untuk demo/tugas kuliah, bukan sistem produksi. Chat hanya tersimpan di browser yang sama dan belum real-time antar akun/perangkat. Login sungguhan, otorisasi klaim, moderasi, serta database bersama perlu backend (misalnya Supabase) dan validasi keamanan. Foto unggahan disimpan sebagai data lokal di browser; hindari unggahan berukuran besar.
