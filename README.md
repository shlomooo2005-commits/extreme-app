# HobbyX

AI-judged competition platform for action sports, ball sports, calisthenics, and vocal challenges. Built with Next.js 16, React 19, and Tailwind CSS 4.

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Cloudinary credentials and optional NEXT_PUBLIC_APP_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes (uploads) | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes (uploads) | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes (uploads) | Cloudinary API secret (server only) |
| `NEXT_PUBLIC_APP_URL` | Production | Canonical URL for OG tags, e.g. `https://your-domain.vercel.app` |
| `POSTGRES_URL` | Arena | Neon/Vercel Postgres connection string for Arena ideas & votes |
| `BLOB_READ_WRITE_TOKEN` | Arena videos | Vercel Blob token for Arena pitch video uploads |

### HobbyX Arena database

1. In Vercel, open your project → **Storage** → create a **Neon** Postgres database and connect it to the project.
2. Vercel injects `POSTGRES_URL` automatically. For local dev, copy that value into `.env.local`.
3. Tables are created on the first Arena API request (`/api/arena`). Optional manual SQL: `scripts/arena-schema.sql`.

## Deploy on Vercel

1. Import this repository in [Vercel](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Add the environment variables above in **Project → Settings → Environment Variables** for Production (and Preview if desired).
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (Vercel default domain or custom domain).
5. Deploy. After the first deploy, assign a custom domain under **Project → Settings → Domains** if needed.

Vercel automatically provides `VERCEL_URL` for preview deployments; production should use `NEXT_PUBLIC_APP_URL` for correct social preview links.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve production build locally
