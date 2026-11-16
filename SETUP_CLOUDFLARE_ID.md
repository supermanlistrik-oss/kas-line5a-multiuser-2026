
# Kas Line 5A Multi User — Cloudflare Pages + D1

## Paket ini
- `index.html` dan aset PWA: frontend Kas Line 5A Purple Edition.
- `functions/api/login.js`: login Admin / Member dengan password rahasia Cloudflare.
- `functions/api/data.js`: baca data untuk kedua role; tulis hanya untuk Admin.
- `functions/api/logout.js`: mengakhiri sesi.
- `functions/api/_lib.js`: validasi sesi.
- `schema.sql`: tabel data bersama dan sesi.
- `wrangler.toml`: binding D1 (isi database_id).

## Penting sebelum deploy
1. Buat database D1 bernama `kas-line5a-db` di Cloudflare Dashboard > Storage & Databases > D1.
2. Buka D1 > Console, jalankan isi `schema.sql`.
3. Salin Database ID ke `wrangler.toml`, menggantikan `GANTI_DENGAN_DATABASE_ID`.
4. Buat Pages project baru, misalnya `kas-line5a-multiuser`.
5. Deploy seluruh isi folder project ini (jangan hanya folder www); `functions/` harus berada di root project yang diupload.
6. Di Pages > Settings > Variables and Secrets, tambahkan:
   - `ADMIN_PASSWORD` (secret): password Admin yang kuat.
   - `MEMBER_PASSWORD` (secret): satu password bersama untuk semua Member.
7. Pastikan binding D1 bernama `DB` tersedia pada project Pages (Settings > Functions > D1 database bindings).
8. Redeploy setelah mengatur binding dan secrets.

## Perilaku
- Admin: dapat mengubah data; setiap simpan akan dikirim ke D1.
- Member: hanya membaca data; API menolak setiap POST dengan status 403.
- Data bersama disimpan sebagai satu snapshot JSON untuk menjaga kompatibilitas struktur aplikasi v23.
- Login Member tidak membutuhkan akun per orang; semua Member memakai password yang sama.

## Catatan migrasi
Login Admin pertama kali akan mengirim data lokal yang ada pada perangkat Admin jika database masih kosong. Karena itu, sebelum login pertama, pastikan perangkat Admin memuat data yang benar dan lengkap. Jangan hapus project/backup lama sampai versi baru sudah diuji.
- Pengiriman data dilakukan setelah perubahan dan jeda singkat.
- Service worker diperbarui agar shell baru dimuat.

## Batasan yang diketahui
- Paket ini memakai satu dokumen JSON bersama untuk kompatibilitas awal; bukan sistem audit per transaksi.
- Untuk menghindari benturan dua Admin yang mengedit bersamaan, sebaiknya hanya satu Admin melakukan input pada satu waktu.
- Setelah deploy, uji Admin menyimpan transaksi lalu refresh di HP Member.
