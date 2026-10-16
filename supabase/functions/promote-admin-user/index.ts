import { createClient } from 'npm:@supabase/supabase-js@2';

import { isAllowedOrigin, withCorsHeaders } from '../_shared/cors.ts';

type PromoteAdminUserPayload = {
  email?: unknown;
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('ADMIN_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const bootstrapToken = Deno.env.get('ADMIN_BOOTSTRAP_TOKEN');

if (!supabaseUrl || !serviceRoleKey || !bootstrapToken) {
  throw new Error('Missing SUPABASE_URL, ADMIN_SECRET_KEY, or ADMIN_BOOTSTRAP_TOKEN');
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin)) {
      return withCorsHeaders(jsonResponse({ error: 'Origin not allowed' }, 403), origin);
    }

    return withCorsHeaders(new Response(null, { status: 204 }), origin);
  }

  if (request.method !== 'POST') {
    return withCorsHeaders(jsonResponse({ error: 'Method not allowed' }, 405), origin);
  }

  if (!isAllowedOrigin(origin)) {
    return withCorsHeaders(jsonResponse({ error: 'Origin not allowed' }, 403), origin);
  }

  const requestToken = request.headers.get('x-admin-bootstrap-token') ?? '';
  if (requestToken !== bootstrapToken) {
    return withCorsHeaders(jsonResponse({ error: 'Unauthorized' }, 401), origin);
  }

  if (request.headers.get('content-type')?.includes('application/json') !== true) {
    return withCorsHeaders(jsonResponse({ error: 'Content-Type must be application/json' }, 415), origin);
  }

  const body = (await request.json().catch(() => null)) as PromoteAdminUserPayload | null;
  if (!body) {
    return withCorsHeaders(jsonResponse({ error: 'Invalid JSON payload' }, 400), origin);
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return withCorsHeaders(jsonResponse({ error: 'Email is required.' }, 400), origin);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    return withCorsHeaders(jsonResponse({ error: `Unable to list users: ${error.message}` }, 500), origin);
  }

  const user = (data.users ?? []).find((candidate) => candidate.email?.trim().toLowerCase() === email);
  if (!user) {
    return withCorsHeaders(jsonResponse({ error: `No auth user found for ${email}` }, 404), origin);
  }

  const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(isRecord(user.app_metadata) ? user.app_metadata : {}),
      is_admin: true,
      role: 'admin',
      roles: ['admin'],
    },
    user_metadata: {
      ...(isRecord(user.user_metadata) ? user.user_metadata : {}),
      is_admin: true,
      role: 'admin',
      roles: ['admin'],
    },
  });

  if (updateError) {
    return withCorsHeaders(jsonResponse({ error: `Unable to update user: ${updateError.message}` }, 500), origin);
  }

  return withCorsHeaders(jsonResponse({
    ok: true,
    user: {
      id: updatedUser.user.id,
      email: updatedUser.user.email,
    },
  }, 200), origin);
});

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
