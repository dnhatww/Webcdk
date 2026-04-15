# Web nap CDK ChatGPT (Frontend Vercel + Backend VPS)

Du an da duoc sua theo mo hinh on dinh:

- Frontend deploy tren Vercel (`public/`)
- Backend deploy tren VPS IP tinh (`backend/`)
- Frontend goi backend qua `BACKEND_API_URL` trong `public/config.js`

## Cau truc

- `public/index.html`, `public/app.js`, `public/styles.css`, `public/config.js`: giao dien
- `backend/server.js`: API proxy toi doremon
- `backend/.env.example`: mau bien moi truong backend
- `vercel.json`: rewrite static files

## Buoc 1 - Deploy backend len VPS

```bash
cd backend
npm install
npm start
```

Bien moi truong backend:

- `PORT=3000`
- `DOREMON_BASE_URL=https://doremon.me/shop/api/activate/chatgpt`
- `ALLOWED_ORIGINS=https://webcdk.vercel.app,https://your-domain.com`

Khuyen nghi chay bang PM2 + Nginx + SSL.

## Buoc 2 - Cau hinh frontend goi backend

Sua file `public/config.js`:

```js
window.APP_CONFIG = {
  BACKEND_API_URL: "https://api.yourdomain.com"
};
```

## Buoc 3 - Deploy frontend len Vercel

1. Push code len GitHub
2. Import project vao Vercel
3. Framework: `Other`
4. Build command: de trong
5. Output directory: de trong
6. Deploy

## API backend

- `GET /api/health`
- `GET /api/cdk/:code`
- `POST /api/activation/preview`
- `POST /api/activation/start`
- `GET /api/activation/:code`
- `POST /api/cdk/bulk-status`

## Bao mat

- Khong log raw ChatGPT session JSON.
- Gioi han CORS bang `ALLOWED_ORIGINS`.
- Frontend khong goi truc tiep upstream.
