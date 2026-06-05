# Inventory Microservices

Sistem inventory berbasis microservice dengan gateway Go, RBAC, database MySQL terpisah per service, dan report PDF/XLSX.

## Arsitektur

| Service | Stack | Port internal | Database |
| --- | --- | ---: | --- |
| Gateway | Go + Fiber | 8080 | - |
| Auth | Fastify + Bun + Drizzle ORM | 3001 | `auth-db` / `auth_db` |
| Item | Go + Fiber + GORM | 3002 | `item-db` / `item_db` |
| Supplier | Express + Bun + Drizzle ORM | 3003 | `supplier-db` / `supplier_db` |
| Stock | FastAPI + SQLAlchemy | 3004 | `stock-db` / `stock_db` |
| Report | PHP native Laravel-like + Composer | 3005 | - |
| History | Fastify + Bun + Drizzle ORM | 3006 | `history-db` / `history_db` |

Setiap service hanya memiliki database miliknya sendiri. Jika report membutuhkan data item, supplier, dan stock, report memanggil endpoint masing-masing service dan tidak membaca database service lain.

## Setup

```bash
cp .env.example .env
docker compose up --build
```

Gateway tersedia di:

```text
http://localhost:8080
```

Service lain tidak dipublish ke host oleh Docker Compose. Akses aplikasi normal dilakukan lewat gateway.

## Database Init

Schema dan seed dipisahkan dari aplikasi di folder:

```text
auth-service/db/init
item-service/db/init
supplier-service/db/init
stock-service/db/init
history-service/db/init
```

File SQL tersebut dijalankan otomatis oleh image MySQL hanya saat volume database pertama kali dibuat. Aplikasi tidak menjalankan migration/seeding saat startup.

## Akun Awal

Auth database seed membuat akun:

```text
username: admin
password: admin123
role: admin
```

Ganti `JWT_SECRET` dan password database di `.env` sebelum production.

## RBAC

Validasi role dilakukan di gateway dan di setiap service.

- `admin`: item, supplier, stock, report, history.
- `manager`: item, supplier, stock.

Endpoint report dan history read hanya menerima role `admin`. Jika request langsung ke service tanpa JWT valid, service akan menolak.

## Contoh

Login:

```bash
curl -s http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Gunakan token:

```bash
curl -s http://localhost:8080/items \
  -H "Authorization: Bearer <token>"
```

Report:

```bash
curl -L http://localhost:8080/reports/summary?format=pdf \
  -H "Authorization: Bearer <admin-token>" \
  -o inventory-summary.pdf
```

## Struktur Kode

Setiap service sudah dipisah ke layer yang lebih mudah dirawat:

- `routes/*`
- `controllers/*`
- `middleware/*`
- `db/*` atau `database/*`
- `models/*`
- `services/*`

Go service menggunakan folder `src`, bukan `cmd/{nama-project}`.

## Production Notes

- Dockerfile menggunakan multi-stage build.
- Runtime image tidak membawa build tool yang tidak perlu.
- MySQL memakai healthcheck sebelum aplikasi start.
- Pool koneksi database dibatasi agar memory usage lebih stabil.
- JWT memakai HS256 dan semua service memvalidasi token sendiri.
- Schema dibuat 3NF untuk auth, supplier, stock, item, dan history.
