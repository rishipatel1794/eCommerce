# Backend — Laravel API

Laravel API for the ECommerce Platform (wallet-enabled marketplace).

## Quick setup

1. Install dependencies
```bash
cd backend
composer install
cp .env.example .env
# edit DB and mail settings in backend/.env
php artisan key:generate
```

2. Database
```bash
php artisan migrate
php artisan db:seed
```
