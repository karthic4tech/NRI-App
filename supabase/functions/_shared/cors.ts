const defaultAllowedOrigins = ['http://localhost:4200', 'http://127.0.0.1:4200'];

export function getAllowedOrigins(): string[] {
  return (Deno.env.get('ALLOWED_ORIGINS') ?? defaultAllowedOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(origin);
}

export function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : getAllowedOrigins()[0] ?? 'http://localhost:4200';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function withCorsHeaders(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
