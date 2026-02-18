# Frontend — Next.js

Lightweight Next.js frontend for the ECommerce Platform.

## Quick start

1. Install
```bash
cd frontend
npm install
```

2. Environment
- Copy .env.example -> .env and set API base URL (example):
```
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=
```

3. Run (development)
```bash
npm run dev
# open http://localhost:3000
```

4. Build / Start (production)
```bash
npm run build
npm run start
```

## Features
- Product listing, product detail, seller product creation UI.
- Cart & coin-based checkout integrated with backend.
- Animated dashboard counters (CountUp) for products, sales, customers.
- Wallet UI showing seller coins.

## Notes
- Uses Bearer tokens (Laravel Sanctum) for protected API calls. See frontend/services/auth.service.js.
- Prices displayed as whole units (no decimal cents).

## Testing & linting
```bash
# if available
npm run test
npm run lint
```

## Deployment
- Can be deployed to Vercel, Netlify, or any static host supporting Next.js.
- Ensure NEXT_PUBLIC_API_BASE points to backend API and CORS/Sanctum cookie config is correct.

## Troubleshooting
- 401 on protected routes: ensure token stored and Authorization header is sent.
- API URL errors: verify NEXT_PUBLIC_API_BASE and backend is running.

---

## Seller / Wallet & Frontend Notes

- Products created from the frontend are assigned to the creating user (`products.user_id`).
- Only admins can delete products; the backend returns HTTP 403 for non-admin delete attempts.
- Coin-based checkout: when a purchase completes, the product owner (seller) is credited the sale amount in their `coins` balance. The backend updates seller balances inside the checkout transaction to ensure consistency.
- Dashboard: `frontend/components/OverviewTab.jsx` uses a small `CountUp` component to animate totals (products, sales, customers).
- Prices: this frontend displays `Total Sales` in whole units (no decimals). If you want whole-unit display applied elsewhere, I can update additional components.

Files of interest (frontend):
- `frontend/components/OverviewTab.jsx` — animated counters and total-sales formatting.
- `frontend/services/auth.service.js` — API client and auth helpers used across the app.

Quick manual test (frontend + backend):

1. Start backend and frontend:

```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000

cd ../frontend
npm install
npm run dev
```

2. Create a seller account and add a product from the frontend.
3. Create a buyer account and ensure the buyer has enough `coins` (seed or update DB directly).
4. As the buyer, add the product to cart and checkout via the frontend; verify buyer coins decreased and seller coins increased.

If you'd like, I can update other frontend components to show whole-unit prices, add a wallet UI, or include example curl commands for the flow.
