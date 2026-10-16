import type { SupabaseClient, User } from 'npm:@supabase/supabase-js@2';

export type AuthenticatedAdminUser = {
  id: string;
  email: string | null;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
};

const fallbackAdminEmails = ['admin@nri.com'];

export async function getAuthenticatedUser(request: Request, client: SupabaseClient): Promise<AuthenticatedAdminUser | null> {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return null;
  }

  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return toAuthenticatedUser(data.user);
}

export function isAdminUser(user: AuthenticatedAdminUser): boolean {
  if (isAllowedAdminEmail(user.email)) {
    return true;
  }

  const appMetadata = user.appMetadata;
  const userMetadata = user.userMetadata;

  return hasAdminFlag(appMetadata) || hasAdminFlag(userMetadata);
}

function isAllowedAdminEmail(email: string | null): boolean {
  if (!email) {
    return false;
  }

  const configuredEmails = (Deno.env.get('ADMIN_EMAILS') ?? fallbackAdminEmails.join(','))
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return configuredEmails.includes(email.trim().toLowerCase());
}

function toAuthenticatedUser(user: User): AuthenticatedAdminUser {
  return {
    id: user.id,
    email: user.email ?? null,
    appMetadata: isRecord(user.app_metadata) ? user.app_metadata : {},
    userMetadata: isRecord(user.user_metadata) ? user.user_metadata : {},
  };
}

function hasAdminFlag(metadata: Record<string, unknown>): boolean {
  if (metadata['is_admin'] === true) {
    return true;
  }

  if (metadata['role'] === 'admin') {
    return true;
  }

  const roles = metadata['roles'];
  return Array.isArray(roles) && roles.some((role) => role === 'admin');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
