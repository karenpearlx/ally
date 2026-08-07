import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiError } from '@/lib/api';

const API = 'https://api.paymongo.com';

type PayMongoError = { errors?: Array<{ detail?: string; code?: string }> };

export async function paymongoRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const secret = process.env.PAYMONGO_SECRET_KEY?.trim();
  if (!secret) throw new ApiError(503, 'Payments are not configured yet.');

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
    signal: init.signal ?? AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => ({})) as T & PayMongoError;
  if (!response.ok) {
    const detail = payload.errors?.map((item) => item.detail || item.code).filter(Boolean).join(' ') || 'PayMongo could not complete that request.';
    throw new ApiError(response.status === 401 ? 503 : 502, detail);
  }
  return payload;
}

function equalHex(expected: string, supplied: string) {
  if (!/^[a-f0-9]+$/i.test(supplied) || expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(supplied, 'hex'));
}

/** Supports PayMongo's current raw-body HMAC header and its legacy t/te/li format. */
export function verifyPaymongoSignature(rawBody: string, header: string | null, livemode: boolean) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET?.trim();
  if (!secret || !header) return false;

  const direct = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (equalHex(direct, header.trim())) return true;

  const parts = Object.fromEntries(header.split(',').map((part) => {
    const [key, ...rest] = part.trim().split('=');
    return [key, rest.join('=')];
  }));
  const timestamp = parts.t;
  const signature = livemode ? parts.li : parts.te;
  if (!timestamp || !signature) return false;
  const signed = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return equalHex(signed, signature);
}

export function paymongoLivemodeExpected() {
  return process.env.PAYMONGO_LIVEMODE === 'true';
}
