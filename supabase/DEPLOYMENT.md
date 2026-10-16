# Supabase Function Deployment

This MVP uses Supabase Edge Functions for protected writes, so the Angular app does not need privileged Supabase credentials.

Current functions:

- `create-task` for task reads and writes
- `submit-consultation` for consultation request submissions
- `admin-summary` for admin dashboard totals
- `admin-tasks` for admin task lists
- `admin-consultations` for admin consultation lists

## Required secrets for `create-task`

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

## Required secrets for `submit-consultation`

Set these secrets in Supabase for the consultation function:

```bash
supabase secrets set CONSULTATION_SECRET_KEY=your-service-role-key
```

Optional hardening:

```bash
supabase secrets set ALLOWED_ORIGINS=http://localhost:4200,https://your-production-domain.com
```

## Deploy the consultation Edge Function

```bash
supabase functions deploy submit-consultation
```

## Required secrets for admin functions

Set this secret in Supabase for the admin functions:

```bash
supabase secrets set ADMIN_SECRET_KEY=your-service-role-key
supabase secrets set ADMIN_EMAILS=admin@nri.com
supabase secrets set ADMIN_BOOTSTRAP_TOKEN=choose-a-long-random-string
```

Optional hardening:

```bash
supabase secrets set ALLOWED_ORIGINS=http://localhost:4200,https://your-production-domain.com
```

## Deploy the admin Edge Functions

```bash
supabase functions deploy admin-summary
supabase functions deploy admin-tasks
supabase functions deploy admin-consultations
supabase functions deploy promote-admin-user
```

## Promote an existing user to admin

After deploying `promote-admin-user`, call it once with the email you want to promote and the bootstrap token.

Example payload:

```json
{
  "email": "admin@nri.com"
}
```

If you prefer to keep deployment config in source control, this repo already includes:

- `supabase/config.toml` with `verify_jwt = false` for `create-task`

That setting is required so browser preflight requests can reach the function and receive a 2xx response. The function still performs its own origin allowlist and validation, and the service role key remains server-side only.

Important: `TASKS_SECRET_KEY` must contain the **service role key value** for this Supabase project. Do **not** put the publishable key there.

If you are testing locally:

```bash
supabase functions serve create-task --env-file supabase/.env.local
supabase functions serve submit-consultation --env-file supabase/.env.local
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
