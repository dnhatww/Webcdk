# Web nap CDK ChatGPT (Vercel)

Du an da duoc chuyen sang kien truc Vercel Serverless:

- Frontend static: `public/index.html`, `public/app.js`, `public/styles.css`
- Backend serverless API: `api/...`
- Route trang chu va static duoc cau hinh trong `vercel.json`

## API hien co

- `GET /api/cdk/:code`
- `POST /api/activation/preview`
- `POST /api/activation/start`
- `GET /api/activation/:code`
- `POST /api/cdk/bulk-status`
- `GET /api/health`

## Chay local voi Vercel CLI

```bash
npm install
npx vercel dev
```

Mo: `http://localhost:3000`

## Deploy len Vercel

1. Push code len GitHub/GitLab/Bitbucket
2. Vao Vercel -> New Project -> Import repository
3. Framework Preset: `Other`
4. Build Command: de trong (khong can build)
5. Output Directory: de trong
6. Deploy

## Bien moi truong

- `DOREMON_BASE_URL` (tuy chon)

Mac dinh:

`https://doremon.me/shop/api/activate/chatgpt`

## Gan domain cua ban

1. Vao Project Settings -> Domains
2. Them domain
3. Copy ban ghi DNS ma Vercel yeu cau (`A`, `CNAME`, hoac ca hai)
4. Cau hinh DNS o nha cung cap domain
5. Cho DNS cap nhat va kiem tra trang thai `Valid Configuration`

## Bao mat

- Frontend chi goi backend cua ban (`/api/...`).
- Backend goi endpoint cong khai doremon.
- Khong log raw ChatGPT session JSON.
- Khong de lo upstream details khong can thiet cho end user.
