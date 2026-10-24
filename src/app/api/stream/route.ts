
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const REQUEST_TIMEOUT_MS = 120_000;

const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'etag',
  'last-modified',
] as const;

function getBackendUrl(): URL | null {
  const value = process.env.BACKEND_URL?.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

async function proxyStream(
  request: NextRequest,
  method: 'GET' | 'HEAD',
): Promise<Response> {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    console.error('[WaveX Stream Proxy] BACKEND_URL is missing or invalid.');

    return jsonError('Streaming backend is not configured.', 500);
  }

  const videoId = request.nextUrl.searchParams.get('videoId');

  if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
    return jsonError('A valid videoId is required.', 400);
  }

  const target = new URL('/api/stream', backendUrl);
  target.searchParams.set('videoId', videoId);

  const requestHeaders = new Headers();

  // Forward byte-range requests so seeking works in the audio player.
  const range = request.headers.get('range');
  if (range) {
    requestHeaders.set('Range', range);
  }

  const ifRange = request.headers.get('if-range');
  if (ifRange) {
    requestHeaders.set('If-Range', ifRange);
  }

  let upstream: Response;

  try {
    upstream = await fetch(target, {
      method,
      headers: requestHeaders,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error(
      '[WaveX Stream Proxy] Could not reach Render:',
      error instanceof Error ? error.message : String(error),
    );

    return jsonError('Unable to reach the streaming backend.', 502);
  }

  // Preserve upstream errors instead of returning a false successful audio response.
  if (!upstream.ok) {
    const upstreamStatus = upstream.status;

    // A 416 response can include Content-Range: bytes */length.
    const errorHeaders = new Headers({
      'Cache-Control': 'no-store',
    });

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) {
      errorHeaders.set('Content-Range', contentRange);
    }

    // Do not expose the upstream error body, which may contain internal details.
    await upstream.body?.cancel().catch(() => {});

    console.error(
      `[WaveX Stream Proxy] Render returned HTTP ${upstreamStatus} for ${videoId}.`,
    );

    return new Response(null, {
      status: upstreamStatus,
      headers: errorHeaders,
    });
  }

  const responseHeaders = new Headers();

  for (const header of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(header);

    if (value) {
      responseHeaders.set(header, value);
    }
  }

  // Never cache signed, temporary audio URLs through this proxy.
  responseHeaders.set('Cache-Control', 'private, no-store');

  // Do not force audio/mp4: the backend's Content-Type is authoritative.
  // Do not invent Content-Length or Content-Range when upstream omits them.
  return new Response(method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  return proxyStream(request, 'GET');
}

export async function HEAD(request: NextRequest): Promise<Response> {
  return proxyStream(request, 'HEAD');
}
