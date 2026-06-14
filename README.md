# ProjekTask — Frontend

Aplikasi manajemen **Project & Task** berbasis web. Pengguna dapat mendaftar/masuk,
membuat project, lalu mengelola task di dalamnya (judul, deskripsi, status, tenggat).
Frontend ini berkomunikasi dengan backend ASP.NET Core 8 melalui REST API.

> **Live demo:** _isi dengan URL Vercel setelah deploy, mis. `https://projektask-web.vercel.app`_

---

## ✨ Fitur

- **Autentikasi**: daftar, masuk, keluar. Token JWT disimpan dan sesi dipulihkan saat halaman dibuka kembali.
- **Project**: lihat daftar (dengan progres task), buat, ubah, hapus.
- **Task**: tambah, ubah, hapus, dan ganti status (`todo` / `in_progress` / `done`) langsung dari daftar.
- **Proteksi rute**: halaman aplikasi hanya bisa diakses setelah login (guard sisi klien).
- **URL berkode**: id project disembunyikan dari URL (`/projects/1ypzbg8`, bukan `/projects/18232`).
- **Feedback konsisten**: notifikasi toast untuk aksi berhasil/gagal; error validasi tampil inline di form.
- **Penanganan error**: pesan ramah untuk gagal koneksi, validasi (400), tidak ditemukan (404), konflik (409), dan sesi berakhir (401 → auto-logout).
- **Responsif**: tata letak menyesuaikan desktop, tablet, dan ponsel.

---

## 🧰 Teknologi

| Area | Pilihan |
|---|---|
| Framework | **Next.js 16** (App Router) |
| Bahasa | **TypeScript** (strict) |
| UI | **Tailwind CSS v4** |
| State global | **Zustand v5** (+ middleware `persist`) |
| HTTP | **Fetch API** (tanpa axios) |
| Deploy | **Vercel** |

---

## 🏗️ Keputusan Arsitektur (dan alasannya)

### 1. Proxy `/api` — menghindari _mixed content_
Backend berjalan di **HTTP** (`http://18.143.171.142:8080`), sedangkan situs di Vercel
berjalan di **HTTPS**. Browser memblokir permintaan HTTPS → HTTP (_mixed content_).

Solusinya: browser **tidak pernah** memanggil backend langsung. Semua request memakai
path relatif (`/api/...`), lalu **server Next.js meneruskannya** ke backend lewat
`rewrites()` di [`next.config.js`](next.config.js). Browser hanya bicara dengan origin-nya
sendiri (HTTPS); penerusan HTTP terjadi server-to-server sehingga aman dari mixed content.

### 2. JWT di `localStorage` — trade-off yang disadari
Token disimpan di `localStorage` agar sesi bertahan setelah refresh dan implementasinya sederhana.

- **Risiko**: rentan terhadap XSS (skrip jahat bisa membaca token). Mitigasi yang lebih kuat
  adalah cookie `HttpOnly` + `Secure`, tetapi itu butuh dukungan/penyesuaian di sisi backend.
- **Keputusan**: untuk lingkup tes ini, `localStorage` dipilih demi kesederhanaan. Hanya
  **token + data user** yang dipersist (lihat `partialize` di [`src/store/auth.ts`](src/store/auth.ts)).

### 3. URL berkode (opaque) — anti-enumerasi
Id project numerik berurutan diubah menjadi kode pendek lewat perkalian modular bijektif
(mod 2³², basis-36) di [`src/lib/idcodec.ts`](src/lib/idcodec.ts). Ini **kosmetik / anti-enumerasi**,
**bukan** keamanan — kode bisa dibalik di klien. Otorisasi sebenarnya tetap di server
(meminta project milik user lain dibalas 404).

### 4. Satu pembungkus Fetch
Semua panggilan API lewat `apiFetch()` di [`src/lib/api.ts`](src/lib/api.ts): otomatis menempel
`Authorization: Bearer`, menangani `204 No Content`, melakukan auto-logout pada `401` (hanya bila
token memang ada), dan menormalkan **dua bentuk** error backend ke `ApiError`:
- pesan tunggal `{ "message": "..." }` (handler global: 401/404/409/500), dan
- **ProblemDetails** `{ "title", "errors": { "Name": [...] } }` (validasi 400 bawaan ASP.NET).

Getter `fieldErrors` menormalkan key ke huruf kecil agar cocok dengan nama field form.

### 5. Hidrasi tanpa _flicker_
Store dipersist dengan `skipHydration: true` lalu di-rehydrate manual di
[`AuthProvider`](src/components/AuthProvider.tsx). Flag `hasHydrated` menjadi gerbang sebelum
guard memutuskan redirect, sehingga tidak ada kedipan/redirect prematur saat reload.

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── layout.tsx            # Root: AuthProvider + ToastProvider, font, metadata
│   ├── page.tsx              # Redirect ke /projects atau /login
│   ├── globals.css           # Tailwind + animasi toast
│   ├── login/ · register/    # Halaman autentikasi
│   └── (protected)/          # Route group dengan guard login
│       ├── layout.tsx        # Guard klien (tunggu hidrasi, redirect bila tanpa token)
│       └── projects/
│           ├── page.tsx      # Daftar project (CRUD)
│           └── [code]/page.tsx   # Detail project + task (segmen = kode opaque)
├── components/
│   ├── AuthProvider.tsx      # Rehydrate store + GET /api/auth/me sekali saat buka app
│   ├── AppHeader.tsx · AuthCard.tsx
│   ├── projects/ · tasks/    # Kartu, modal form, item task
│   └── ui/                   # Button, TextField, Modal, Alert, Toast, States, dll
├── lib/
│   ├── api.ts                # apiFetch + ApiError
│   ├── auth.ts · projects.ts · tasks.ts   # Pemanggil endpoint per domain
│   ├── idcodec.ts            # encode/decode id opaque
│   └── status.ts · format.ts # Label/warna status, format tanggal
├── store/auth.ts             # Zustand store (persist token + user)
└── types/api.ts              # Tipe bersama

next.config.js                # Proxy rewrites /api/* dan /health ke backend
.env.example                  # Template variabel lingkungan
kontrak-api-projektask.md     # Kontrak API yang diacu
```

---

## 🚀 Menjalankan Secara Lokal

**Prasyarat:** Node.js 20+ dan npm.

```bash
# 1. Install dependensi
npm install

# 2. Siapkan variabel lingkungan
cp .env.example .env.local      # Windows PowerShell: copy .env.example .env.local
# .env.local sudah berisi URL backend default; ubah bila perlu.

# 3. Jalankan dev server
npm run dev
```

Buka **http://localhost:3000**. Permintaan ke `/api/*` otomatis diproxy ke backend, jadi
tidak ada masalah CORS maupun mixed content saat pengembangan.

### Build produksi (opsional, untuk verifikasi)
```bash
npm run build
npm run start
```

---

## ☁️ Deploy ke Vercel

1. **Push** repo ini ke GitHub.
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → import repo. Vercel mendeteksi
   Next.js secara otomatis (tak perlu ubah build/output settings).
3. Buka **Settings → Environment Variables**, tambahkan:

   | Name | Value | Environment |
   |---|---|---|
   | `API_BASE_URL` | `http://18.143.171.142:8080` | Production (dan Preview) |

4. Klik **Deploy**. Setelah selesai, aplikasi berjalan di `https://<nama-proyek>.vercel.app`.

> **Penting:** karena rewrite dibaca saat build/runtime server, setelah mengubah
> `API_BASE_URL` lakukan **redeploy** agar perubahan diterapkan.

---

## 🔑 Variabel Lingkungan

| Variabel | Wajib | Keterangan |
|---|---|---|
| `API_BASE_URL` | ya | URL dasar backend untuk proxy server-side. Default ke EC2 bila tak diisi (lihat `next.config.js`). **Tidak** diekspos ke browser. |

`.env.local` sudah masuk `.gitignore` (pola `.env*`) sehingga tidak pernah ter-commit.
Hanya `.env.example` (template tanpa rahasia) yang ikut versi.

---

## 🔒 Catatan Keamanan & Batasan

- Token JWT di `localStorage` → lihat trade-off pada bagian Arsitektur #2.
- URL berkode bersifat kosmetik, bukan kontrol akses → otorisasi ditegakkan server.
- Lingkup tes: tanpa refresh-token dan tanpa rate-limit di sisi klien.
