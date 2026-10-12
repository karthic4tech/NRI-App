# Supabase Task Flow Deployment

This MVP uses a Supabase Edge Function named `create-task` for all task reads and writes, so the Angular app does not need privileged Supabase credentials.

## Required secrets

Set these secrets in Supabase for the Edge Function:

```bash
supabase secrets set SUPABASE_URL=https://YOUR-PROJECT.supabase.co
supabase secrets set TASKS_SECRET_KEY=your-service-role-key
```

Optional hardening:

```bash
supabase secrets set ALLOWED_ORIGINS=http://localhost:4200,https://your-production-domain.com
```

## Deploy the Edge Function

```bash
supabase functions deploy create-task
```

If you prefer to keep deployment config in source control, this repo already includes:

- `supabase/config.toml` with `verify_jwt = false` for `create-task`

That setting is required so browser preflight requests can reach the function and receive a 2xx response. The function still performs its own origin allowlist, validation, and rate limiting, and the service role key remains server-side only.

Important: `TASKS_SECRET_KEY` must contain the **service role key value** for this Supabase project. Do **not** put the publishable key there.

If you are testing locally:

```bash
supabase functions serve create-task --env-file supabase/.env.local
```

## Lock down direct table access

Because the Edge Function handles task operations, you should remove direct anonymous/authenticated access to `public.tasks`.

Run this SQL in Supabase:

```sql
alter table public.tasks enable row level security;

revoke all on table public.tasks from anon;
revoke all on table public.tasks from authenticated;
```

If you previously created any `tasks` policies for direct browser access, remove them so the app only uses the Edge Function.

## Notes

- The Angular app should use the publishable key only.
- Do **not** place the service-role key in Angular code or environment files.
- The Edge Function validates `Name`, `TaskTitle`, and `ServiceDescription` before inserting.
