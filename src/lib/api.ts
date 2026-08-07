import { createClient } from '@/lib/supabase/server';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new ApiError(401, 'Sign in to continue.');
  return { supabase, user };
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : 'Unexpected server error.';
  console.error(error);
  return Response.json({ error: message }, { status: 500 });
}

export async function readJson(request: Request) {
  try {
    return await request.json() as Record<string, unknown>;
  } catch {
    throw new ApiError(400, 'Request body must be valid JSON.');
  }
}

export function stringField(value: unknown, name: string, options: { required?: boolean; max?: number } = {}) {
  if (value == null || value === '') {
    if (options.required) throw new ApiError(400, `${name} is required.`);
    return null;
  }
  if (typeof value !== 'string') throw new ApiError(400, `${name} must be a string.`);
  const clean = value.trim();
  if (options.required && !clean) throw new ApiError(400, `${name} is required.`);
  if (options.max && clean.length > options.max) throw new ApiError(400, `${name} is too long.`);
  return clean || null;
}

export function urlField(value: unknown, name: string, required = false) {
  const clean = stringField(value, name, { required, max: 2_048 });
  if (!clean) return null;
  try {
    const url = new URL(clean);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    throw new ApiError(400, `${name} must be a valid http or https URL.`);
  }
}

export function uuidField(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new ApiError(400, 'Invalid id.');
  }
  return value;
}

export function jsonObject(value: unknown, name: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, `${name} must be an object.`);
  }
  return value as Record<string, unknown>;
}
