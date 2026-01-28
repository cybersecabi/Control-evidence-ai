# Authentication Setup Guide

Configure Supabase Auth for ControlEvidence AI.

## 1. Enable Auth in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Ensure **Email** provider is enabled (default)

## 2. Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (or your production URL)
3. Add to **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-production-domain.com/api/auth/callback`

## 3. Run Database Migration

Execute the RLS migration in the Supabase SQL Editor:

```sql
-- Copy contents from: supabase/migrations/002_auth_rls.sql
```

Or run via CLI:
```bash
supabase db push
```

## 4. Install SSR Package

```bash
npm install @supabase/ssr
```

## 5. Environment Variables

Ensure these are set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6. Test Authentication

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000/signup`
3. Create an account
4. Check your email for confirmation link
5. Sign in at `http://localhost:3000/login`

## Auth Flow

```
/signup → Create account → Email confirmation → /login → Dashboard
```

## Troubleshooting

**"Email not confirmed" error:**
- Check your email spam folder
- Or disable email confirmation in Supabase Dashboard: Authentication → Settings → "Confirm email"

**Redirect issues:**
- Verify Site URL and Redirect URLs in Supabase Dashboard
- Ensure callback route exists: `src/app/api/auth/callback/route.js`
