import { createClient } from 'npm:@supabase/supabase-js@2';

import { corsHeaders, isAllowedOrigin, withCorsHeaders } from '../_shared/cors.ts';

type TaskRecord = {
  TaskIdentity: number;
  TaskId: string;
  Name: string;
  TaskTitle: string;
  ServiceDescription: string;
  CreatedAt: string;
  UpdatedAt: string;
};

type CreateTaskPayload = {
  name?: unknown;
  taskTitle?: unknown;
  serviceDescription?: unknown;
};

const MAX_NAME_LENGTH = 200;
const MAX_TITLE_LENGTH = 300;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_BODY_BYTES = 4096;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const tasksSecretKey = Deno.env.get('TASKS_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !tasksSecretKey) {
  throw new Error('Missing SUPABASE_URL or TASKS_SECRET_KEY');
}

if (isPublishableLikeKey(tasksSecretKey)) {
  throw new Error('TASKS_SECRET_KEY is misconfigured: publishable keys cannot write to protected tables.');
}

console.info('[create-task] configuration', {
  hasSupabaseUrl: Boolean(supabaseUrl),
  hasTasksSecretKey: Boolean(tasksSecretKey),
  secretSource: Deno.env.get('TASKS_SECRET_KEY') ? 'TASKS_SECRET_KEY' : 'SUPABASE_SERVICE_ROLE_KEY',
  secretKind: classifyKey(tasksSecretKey),
});

const adminClient = createClient(supabaseUrl, tasksSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const rateLimitByIp = new Map<string, { count: number; resetAt: number }>();

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');

  if (request.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin)) {
      return withCorsHeaders(jsonResponse({ error: 'Origin not allowed' }, 403), origin);
    }

    return withCorsHeaders(new Response(null, { status: 204 }), origin);
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return withCorsHeaders(jsonResponse({ error: 'Method not allowed' }, 405), origin);
  }

  if (!isAllowedOrigin(origin)) {
    return withCorsHeaders(jsonResponse({ error: 'Origin not allowed' }, 403), origin);
  }

  const ip = getRequestIp(request);
  if (!passesRateLimit(ip)) {
    return withCorsHeaders(jsonResponse({ error: 'Too many requests. Please try again later.' }, 429), origin);
  }

  if (request.method === 'GET') {
    const taskId = new URL(request.url).searchParams.get('taskId')?.trim();

    if (taskId) {
      const { data, error } = await adminClient
        .from('tasks')
        .select('TaskIdentity, TaskId, Name, TaskTitle, ServiceDescription, CreatedAt, UpdatedAt')
        .eq('TaskId', taskId)
        .maybeSingle();

      if (error) {
        return withCorsHeaders(jsonResponse({ error: `Unable to search task: ${error.message}` }, 500), origin);
      }

      return withCorsHeaders(jsonResponse(data ?? null, 200), origin);
    }

    const { data, error } = await adminClient
      .from('tasks')
      .select('TaskIdentity, TaskId, Name, TaskTitle, ServiceDescription, CreatedAt, UpdatedAt')
      .order('CreatedAt', { ascending: false })
      .limit(100);

    if (error) {
      return withCorsHeaders(jsonResponse({ error: `Unable to load tasks: ${error.message}` }, 500), origin);
    }

    return withCorsHeaders(jsonResponse(data ?? [], 200), origin);
  }

  if (request.headers.get('content-type')?.includes('application/json') !== true) {
    return withCorsHeaders(jsonResponse({ error: 'Content-Type must be application/json' }, 415), origin);
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return withCorsHeaders(jsonResponse({ error: 'Request body is too large' }, 413), origin);
  }

  const body = (await request.json().catch(() => null)) as CreateTaskPayload | null;
  if (!body) {
    return withCorsHeaders(jsonResponse({ error: 'Invalid JSON payload' }, 400), origin);
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return withCorsHeaders(jsonResponse({ error: validationError }, 400), origin);
  }

  const { data, error } = await adminClient
      .from('tasks')
    .insert({
      Name: normalizeText(String(body.name)),
      TaskTitle: normalizeText(String(body.taskTitle)),
      ServiceDescription: normalizeText(String(body.serviceDescription)),
    })
    .select('TaskIdentity, TaskId, Name, TaskTitle, ServiceDescription, CreatedAt, UpdatedAt')
    .single();

  if (error) {
    console.error('[create-task] insert failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      taskTitleLength: normalizeText(String(body.taskTitle)).length,
      nameLength: normalizeText(String(body.name)).length,
      descriptionLength: normalizeText(String(body.serviceDescription)).length,
    });

    return withCorsHeaders(jsonResponse({ error: `Unable to create task: ${error.message}`, code: error.code ?? null }, 500), origin);
  }

  return withCorsHeaders(jsonResponse(data as TaskRecord, 201), origin);
});

function validatePayload(payload: CreateTaskPayload): string | null {
  const name = normalizeText(payload.name);
  const taskTitle = normalizeText(payload.taskTitle);
  const serviceDescription = normalizeText(payload.serviceDescription);

  if (!name) {
    return 'Name is required.';
  }

  if (!taskTitle) {
    return 'Task Title is required.';
  }

  if (!serviceDescription) {
    return 'Service Description is required.';
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `Name must be at most ${MAX_NAME_LENGTH} characters.`;
  }

  if (taskTitle.length > MAX_TITLE_LENGTH) {
    return `Task Title must be at most ${MAX_TITLE_LENGTH} characters.`;
  }

  if (serviceDescription.length > MAX_DESCRIPTION_LENGTH) {
    return `Service Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  return null;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function isPublishableLikeKey(key: string): boolean {
  return key.startsWith('sb_publishable_') || key === Deno.env.get('SUPABASE_ANON_KEY');
}

function classifyKey(key: string): string {
  if (key.startsWith('sb_publishable_')) {
    return 'publishable';
  }

  if (key.startsWith('sb_secret_')) {
    return 'secret';
  }

  return 'unknown';
}

function getRequestIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const client = request.headers.get('cf-connecting-ip')?.trim();
  return forwarded || client || 'unknown';
}

function passesRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitByIp.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
