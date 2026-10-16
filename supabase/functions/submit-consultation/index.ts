import { createClient } from 'npm:@supabase/supabase-js@2';

import { isAllowedOrigin, withCorsHeaders } from '../_shared/cors.ts';

type ConsultationPayload = {
  name?: unknown;
  phoneNumber?: unknown;
  city?: unknown;
  country?: unknown;
};

type ConsultationRecord = {
  id: number;
  name: string;
  phone_number: string;
  city: string;
  country: string;
  created_at: string;
};

const MAX_NAME_LENGTH = 200;
const MAX_PHONE_LENGTH = 32;
const MAX_CITY_LENGTH = 120;
const MAX_COUNTRY_LENGTH = 120;
const MAX_BODY_BYTES = 4096;

const consultationSecretKey = Deno.env.get('CONSULTATION_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!consultationSecretKey) {
  throw new Error('Missing CONSULTATION_SECRET_KEY');
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  const supabaseUrl = new URL(request.url).origin;
  const adminClient = createClient(supabaseUrl, consultationSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

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

  if (request.headers.get('content-type')?.includes('application/json') !== true) {
    return withCorsHeaders(jsonResponse({ error: 'Content-Type must be application/json' }, 415), origin);
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return withCorsHeaders(jsonResponse({ error: 'Request body is too large' }, 413), origin);
  }

  const body = (await request.json().catch(() => null)) as ConsultationPayload | null;
  if (!body) {
    return withCorsHeaders(jsonResponse({ error: 'Invalid JSON payload' }, 400), origin);
  }

  const validationError = validatePayload(body);
  if (validationError) {
    return withCorsHeaders(jsonResponse({ error: validationError }, 400), origin);
  }

  const insertedAtIso = new Date().toISOString();

  const { error } = await adminClient
    .from('consultation_requests')
    .insert({
      name: normalizeText(body.name),
      phone_number: normalizeText(body.phoneNumber),
      city: normalizeText(body.city),
      country: normalizeText(body.country),
      created_at: insertedAtIso,
    })
    ;

  if (error) {
    console.error('[submit-consultation] insert failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      insertedAtIso,
      body: {
        name: normalizeText(body.name),
        phoneNumber: normalizeText(body.phoneNumber),
        city: normalizeText(body.city),
        country: normalizeText(body.country),
      },
    });

    return withCorsHeaders(jsonResponse({ error: `Unable to submit consultation request: ${error.message}`, code: error.code ?? null }, 500), origin);
  }

  console.info('[submit-consultation] insert succeeded', {
    insertedAtIso,
    name: normalizeText(body.name),
    city: normalizeText(body.city),
    country: normalizeText(body.country),
  });

  return withCorsHeaders(jsonResponse({ success: true }, 201), origin);
});

function validatePayload(payload: ConsultationPayload): string | null {
  const name = normalizeText(payload.name);
  const phoneNumber = normalizeText(payload.phoneNumber);
  const city = normalizeText(payload.city);
  const country = normalizeText(payload.country);

  if (!name) {
    return 'Name is required.';
  }

  if (!phoneNumber) {
    return 'Phone number is required.';
  }

  if (!city) {
    return 'City is required.';
  }

  if (!country) {
    return 'Country is required.';
  }

  if (name.length > MAX_NAME_LENGTH) {
    return `Name must be at most ${MAX_NAME_LENGTH} characters.`;
  }

  if (phoneNumber.length > MAX_PHONE_LENGTH) {
    return `Phone number must be at most ${MAX_PHONE_LENGTH} characters.`;
  }

  if (city.length > MAX_CITY_LENGTH) {
    return `City must be at most ${MAX_CITY_LENGTH} characters.`;
  }

  if (country.length > MAX_COUNTRY_LENGTH) {
    return `Country must be at most ${MAX_COUNTRY_LENGTH} characters.`;
  }

  return null;
}

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
