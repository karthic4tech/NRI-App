import { createClient } from 'npm:@supabase/supabase-js@2';

import { isAllowedOrigin, withCorsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUser, isAdminUser } from '../_shared/admin.ts';

const MAX_PAGE_SIZE = 50;

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const adminSecretKey = Deno.env.get('ADMIN_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !adminSecretKey) {
  throw new Error('Missing SUPABASE_URL or ADMIN_SECRET_KEY');
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin)) {
      return withCorsHeaders(jsonResponse({ error: 'Origin not allowed' }, 403), origin);
    }

    return withCorsHeaders(new Response(null, { status: 204 }), origin);
  }

  if (request.method !== 'GET') {
    return withCorsHeaders(jsonResponse({ error: 'Method not allowed' }, 405), origin);
  }

  if (!isAllowedOrigin(origin)) {
    return withCorsHeaders(jsonResponse({ error: 'Origin not allowed' }, 403), origin);
  }

  const adminClient = createClient(supabaseUrl, adminSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const user = await getAuthenticatedUser(request, adminClient);
  if (!user) {
    return withCorsHeaders(jsonResponse({ error: 'Authentication required.' }, 401), origin);
  }

  if (!isAdminUser(user)) {
    return withCorsHeaders(jsonResponse({ error: 'Admin access required.' }, 403), origin);
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get('page') ?? '1'), 1);
  const pageSize = clampPageSize(Number(url.searchParams.get('pageSize') ?? '10'));
  const search = normalizeSearch(url.searchParams.get('search'));

  let query = adminClient
    .from('consultation_requests')
    .select('id, name, phone_number, city, country, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    const safe = escapeSearch(search);
    query = query.or([
      `name.ilike.%${safe}%`,
      `phone_number.ilike.%${safe}%`,
      `city.ilike.%${safe}%`,
      `country.ilike.%${safe}%`,
    ].join(','));
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    return withCorsHeaders(jsonResponse({ error: `Unable to load consultation requests: ${error.message}` }, 500), origin);
  }

  return withCorsHeaders(jsonResponse({
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  }, 200), origin);
});

function clampPageSize(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 10;
  }

  return Math.min(Math.floor(value), MAX_PAGE_SIZE);
}

function normalizeSearch(value: string | null): string {
  return (value ?? '').trim().replace(/[,()]/g, ' ');
}

function escapeSearch(value: string): string {
  return value.replace(/'/g, "''");
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
