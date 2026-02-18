# ECommerce Platform (Monorepo)

This repository contains a Laravel backend and a Next.js frontend.

- Backend: Laravel (backend/)
- Frontend: Next.js (frontend/)

This README focuses on quick setup and API documentation you can use to implement product endpoints and integrate the frontend.

---

## Quick setup

**Backend (Laravel)**
```bash
cd backend
composer install
cp .env.example .env
# configure DB settings in backend/.env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=127.0.0.1 --port=8000
```

**Frontend (Next.js)**
```bash
cd frontend
npm install
# configure frontend/.env
npm run dev
```

---

**Development notes**
- API base path: `/api` (Laravel). Frontend calls `/auth/*` endpoints (see `frontend/services/auth.service.js`).
- Auth uses Laravel Sanctum tokens (Bearer tokens). Protected routes in `backend/routes/api.php` are behind `auth:sanctum`.

---

**API Reference (existing + suggested product routes)**

All auth routes found in `backend/routes/api.php` are prefixed with `/api/auth`.

**Authentication**

- POST `/api/auth/register`
  - Request JSON:
    {
      "name": "string",
      "email": "user@example.com",
      "password": "password",
      "password_confirmation": "password"
    }
  - Validation (backend): `name` required, `email` required|email|unique, `password` required|min:6|confirmed
  - Success Response (201):
    {
      "message": "User Registered Successfully",
      "user": { /* User object */ },
      "access_token": "<token>",
      "token_type": "Bearer",
      "success": true
    }
  - Errors: 422 validation errors with `errors` object.

- POST `/api/auth/login`
  - Request JSON:
    {
      "email": "user@example.com",
      "password": "password"
    }
  - Validation: `email` required|email, `password` required
  - Success Response (200):
    {
      "message": "Login Successful",
      "user": { /* UserResource */ },
      "access_token": "<token>",
      "token_type": "Bearer",
      "success": true
    }
  - Failure: 401 Invalid Credentials

- POST `/api/auth/logout` (protected)
  - Requires `Authorization: Bearer <token>`
  - Response:
    {
      "message": "Logged out successfully",
      "success": true
    }

- GET `/api/auth/profile` (protected)
  - Requires `Authorization: Bearer <token>`
  - Response:
    {
      "user": { /* UserResource */ },
      "success": true
    }

---

**Product API (recommended endpoints)**

Below are suggested endpoints and request/response schemas matching the frontend `ProductContext` shape so you can implement them quickly in the backend.

Product resource example schema
```json
{
  "id": 1,
  "name": "Premium Wireless Headphones",
  "price": 299.00,
  "image": "https://...",
  "rating": 5,
  "category": "Audio",
  "description": "Long product description",
  "features": ["Feature A", "Feature B"],
  "inStock": true
}
```

Endpoints (prefix `/api/products`):

- GET `/api/products`
  - Query params (optional): `page`, `per_page`, `category`, `q` (search), `sort` (e.g. `price:asc`)
  - Response (200):
    {
      "data": [ /* array of product objects */ ],
      "meta": { "page": 1, "per_page": 10, "total": 100 }
    }

- GET `/api/products/{id}`
  - Response (200): `{ "data": { /* product */ } }` or 404 if not found

- POST `/api/products` (protected - vendor/admin)
  - Requires `Authorization: Bearer <token>`
  - Request JSON (example):
    {
      "name": "string",
      "price": 199.99,
      "image": "https://...",
      "rating": 4,
      "category": "string",
      "description": "string",
      "features": ["f1", "f2"],
      "inStock": true
    }
  - Validation suggestions: `name` required|string, `price` required|numeric, `category` required|string
  - Success Response (201): `{ "message": "Product created", "data": { /* product */ } }`

- PUT/PATCH `/api/products/{id}` (protected)
  - Request JSON: fields to update (same shape as POST)
  - Success Response: `{ "message": "Product updated", "data": { /* product */ } }`

- DELETE `/api/products/{id}` (protected)
  - Success Response: `{ "message": "Product deleted", "success": true }`

Notes:
- Use resource controllers (`php artisan make:controller Api/ProductController --api`) and `Route::apiResource('products', ProductController::class)` to quickly scaffold these routes.
- Protect create/update/delete with `auth:sanctum` and a gate/role check for vendors/admins.

---

**Quick curl examples**

Register:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret","password_confirmation":"secret"}'
```

Login:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}'
```

Get products:
```bash
curl http://127.0.0.1:8000/api/products
```

Create product (example):
```bash
curl -X POST http://127.0.0.1:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"New Product","price":49.99,"category":"Gadgets","description":"...","features":["a","b"],"inStock":true}'
```

---

## Where to look in the repo

- Auth controller and request validation: [`backend/app/Http/Controllers/Api/AuthController.php`](backend/app/Http/Controllers/Api/AuthController.php), [`backend/app/Http/Requests/RegisterRequest.php`](backend/app/Http/Requests/RegisterRequest.php), [`backend/app/Http/Requests/LoginRequest.php`](backend/app/Http/Requests/LoginRequest.php)
- API routes: [`backend/routes/api.php`](backend/routes/api.php)
- Frontend product schema and usage: [`frontend/context/ProductContext.jsx`](frontend/context/ProductContext.jsx), [`frontend/components/ProductCard.jsx`](frontend/components/ProductCard.jsx), [`frontend/components/ProductManagement.jsx`](frontend/components/ProductManagement.jsx)

---

If you'd like, I can now:
- scaffold a `ProductController` and API resource routes in the backend with request validations,
- implement a minimal product `Product` model & migration matching the frontend schema,
- or add example Postman/Insomnia collections for these endpoints.

Tell me which of those you'd like me to generate next.
# ECommerce Platform (Monorepo)

This repository contains two apps:

- Backend: Laravel (backend/)
  - Main entry: [`backend/composer.json`](backend/composer.json)
  - Service provider: [`App\Providers\AppServiceProvider`](backend/app/Providers/AppServiceProvider.php)
  - Environment example: [`backend/.env.example`](backend/.env.example)
  - Configs: [`backend/config/database.php`](backend/config/database.php), [`backend/config/queue.php`](backend/config/queue.php), [`backend/config/cache.php`](backend/config/cache.php), [`backend/config/auth.php`](backend/config/auth.php), [`backend/config/session.php`](backend/config/session.php), [`backend/config/services.php`](backend/config/services.php)
  - Migrations: [`backend/database/migrations/0001_01_01_000000_create_users_table.php`](backend/database/migrations/0001_01_01_000000_create_users_table.php), [`backend/database/migrations/0001_01_01_000002_create_jobs_table.php`](backend/database/migrations/0001_01_01_000002_create_jobs_table.php), [`backend/database/migrations/0001_01_01_000001_create_cache_table.php`](backend/database/migrations/0001_01_01_000001_create_cache_table.php), [`backend/database/migrations/2026_02_11_050951_create_personal_access_tokens_table.php`](backend/database/migrations/2026_02_11_050951_create_personal_access_tokens_table.php)
  - Seeder: [`backend/database/seeders/DatabaseSeeder.php`](backend/database/seeders/DatabaseSeeder.php)
  - Project-specific guidelines: [`backend/.junie/guidelines.md`](backend/.junie/guidelines.md)
  - README: [`backend/README.md`](backend/README.md)

- Frontend: Next.js (frontend/)
  - Main entry: [`frontend/package.json`](frontend/package.json)
  - Next config: [`frontend/next.config.mjs`](frontend/next.config.mjs)
  - ESLint: [`frontend/eslint.config.mjs`](frontend/eslint.config.mjs)
  - Env: [`frontend/.env`](frontend/.env)
  - App code: [`frontend/app/`](frontend/app/)
  - Components: [`frontend/components/`](frontend/components/)
  - Services (API clients): [`frontend/services/auth.service.js`](frontend/services/auth.service.js) and [`frontend/lib/api.js`](frontend/lib/api.js)

---

## Quick setup

Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
# configure DB env in .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```
See scripts in [`backend/composer.json`](backend/composer.json) for automation.

Frontend (Next.js)
```bash
cd frontend
npm install
# configure frontend/.env
npm run dev
```
Primary files: [`frontend/package.json`](frontend/package.json), [`frontend/next.config.mjs`](frontend/next.config.mjs).

---

## Database & queues

- Default DB driver and connection configured in [`backend/config/database.php`](backend/config/database.php).
- Queue defaults in [`backend/config/queue.php`](backend/config/queue.php).
- Cache config in [`backend/config/cache.php`](backend/config/cache.php).
- Migrations live in [`backend/database/migrations/`](backend/database/migrations/); main user migration: [`0001_01_01_000000_create_users_table.php`](backend/database/migrations/0001_01_01_000000_create_users_table.php).
- Seeder: [`backend/database/seeders/DatabaseSeeder.php`](backend/database/seeders/DatabaseSeeder.php).

---

## Testing & linting

- Backend tests: run from `backend/`:
```bash
composer run test
# or
php artisan test
```
- Frontend linting / format: see [`frontend/eslint.config.mjs`](frontend/eslint.config.mjs) and `frontend/package.json` scripts.

---

## Notes & conventions

- Follow project guidelines: [`backend/.junie/guidelines.md`](backend/.junie/guidelines.md).
- Laravel defaults use database-backed sessions/cache per [`backend/config/session.php`](backend/config/session.php) and [`backend/config/cache.php`](backend/config/cache.php).
- Frontend service wrappers and auth flow are implemented under [`frontend/services/`](frontend/services/) and API helpers under [`frontend/lib/api.js`](frontend/lib/api.js). Example auth service: [`frontend/services/auth.service.js`](frontend/services/auth.service.js).

---

## Useful links (files)

- Backend root: [`backend/`](backend/)
- Frontend root: [`frontend/`](frontend/)
- Backend env example: [`backend/.env.example`](backend/.env.example)
- Frontend env: [`frontend/.env`](frontend/.env)
- Composer scripts: [`backend/composer.json`](backend/composer.json)
- App provider: [`App\Providers\AppServiceProvider`](backend/app/Providers/AppServiceProvider.php)

---

If you want, I can:
- generate a more detailed ops README per environment (dev / prod),
- add docker or docker-compose examples,
- or create CONTRIBUTING.md and developer quickstart scripts.

---

## Seller / Wallet & Frontend Notes

This project includes a simple seller-wallet flow and some frontend UX improvements:

- Seller ownership: products created via the API are assigned to the creating user using the `products.user_id` column.
- Deletion policy: only admin users may delete products. Non-admin delete attempts will receive HTTP 403 Forbidden.
- Seller crediting: when an order is completed through the coin checkout flow, the product owner is credited the sale amount in their `coins` balance. The increment happens inside the checkout DB transaction to ensure consistency.
- Backwards compatibility: a `coin` accessor exists on the `User` model to maintain compatibility with any older code expecting `$user->coin`, but the canonical field is `coins`.

Files touched (backend):

- `backend/app/Http/Controllers/Api/CartController.php` — checkout now eager-loads `items.product.user`, deducts buyer coins, creates the order and items, decrements product stock, and credits the seller's `coins`.
- `backend/app/Http/Controllers/Api/ProductController.php` — delete endpoint now checks admin role before deleting.
- `backend/app/Models/User.php` — compatibility accessor/mutator for `coin` -> `coins`.

Recommended next improvements:

- Add a `wallet_transactions` table and `WalletTransaction` model to record every credit/debit for auditing and refunds.
- Apply any platform commission logic (fees) to seller credits if needed.

Frontend:

- `frontend/components/OverviewTab.jsx` uses an animated `CountUp` component to display totals with a smooth incrementing animation.
- `Total Sales` is displayed in whole units (no decimals) across the overview dashboard. If you want consistent whole-unit display across the site, I can update product and checkout views.

How to test the seller flow quickly:

1. Run migrations and start servers:

```bash
cd backend
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000

cd ../frontend
npm install
npm run dev
```

2. Create a seller account and create a product (it will be associated to the seller).
3. Create a buyer account and top up `coins` for the buyer (seed or update DB directly).
4. As the buyer, add the product to cart and call `POST /api/cart/checkout`.
5. Verify the buyer `coins` decreased and the seller `coins` increased.

If you'd like, I can add example curl requests or automated tests for this flow.