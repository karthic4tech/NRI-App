import { createClient } from 'npm:@supabase/supabase-js@2';

import { isAllowedOrigin, withCorsHeaders } from '../_shared/cors.ts';
import { getAuthenticatedUser, isAdminUser } from '../_shared/admin.ts';

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

  const [taskCount, consultationCount, latestTasks, latestConsultations] = await Promise.all([
    adminClient.from('tasks').select('TaskIdentity', { count: 'exact', head: true }),
    adminClient.from('consultation_requests').select('id', { count: 'exact', head: true }),
    adminClient
      .from('tasks')
      .select('TaskIdentity, TaskId, UserId, UserEmail, Name, TaskTitle, ServiceDescription, CreatedAt, UpdatedAt')
      .order('CreatedAt', { ascending: false })
      .limit(5),
    adminClient
      .from('consultation_requests')
      .select('id, name, phone_number, city, country, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (taskCount.error) {
    return withCorsHeaders(jsonResponse({ error: `Unable to load task count: ${taskCount.error.message}` }, 500), origin);
  }

  if (consultationCount.error) {
    return withCorsHeaders(jsonResponse({ error: `Unable to load consultation count: ${consultationCount.error.message}` }, 500), origin);
  }

  if (latestTasks.error) {
    return withCorsHeaders(jsonResponse({ error: `Unable to load latest tasks: ${latestTasks.error.message}` }, 500), origin);
  }

  if (latestConsultations.error) {
    return withCorsHeaders(jsonResponse({ error: `Unable to load latest consultation requests: ${latestConsultations.error.message}` }, 500), origin);
  }

  return withCorsHeaders(jsonResponse({
    taskCount: taskCount.count ?? 0,
    consultationCount: consultationCount.count ?? 0,
    latestTasks: latestTasks.data ?? [],
    latestConsultations: latestConsultations.data ?? [],
  }, 200), origin);
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
