# Blog App — Vercel (Frontend) + Render (Backend) + Supabase (Postgres)

Prepared for deployment: Frontend -> Vercel, Backend -> Render, Database -> Supabase.

Quick steps (short):
1) Push repo to GitHub.
2) Create Supabase project and copy DATABASE_URL.
3) Render: New Web Service -> select backend folder -> set env vars (DATABASE_URL, JWT_SECRET, CORS_ORIGIN).
   Run migrations if needed: npx prisma migrate deploy
4) Vercel: New Project -> frontend folder -> set NEXT_PUBLIC_API_URL to Render backend URL.
5) Add Vercel URL to CORS_ORIGIN and redeploy backend if needed.
