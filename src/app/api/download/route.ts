import { NextRequest, NextResponse } from 'next/server';
import { getStreamUrl } from '@/lib/ytdlp';
import { request as undiciRequest } from 'undici';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getBackendUrl(): URL | null {
  const value = process.env.BACKEND_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');
  const title = searchParams.get('title') || 'WaveX Track';

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'A valid 11-character videoId is required.' }, { status: 400 });
  }

  // 1. If backend URL is configured (Vercel production mode), proxy to Render Express backend
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    const target = new URL('/api/download', backendUrl);
    target.searchParams.set('videoId', videoId);
    target.searchParams.set('title', title);

    try {
      const upstream = await fetch(target, {
        cache: 'no-store',
        signal: AbortSignal.timeout(30_000),
      });

      if (!upstream.ok) {
        return new Response(null, { status: upstream.status });
      }

      const responseHeaders = new Headers();
      const contentDisposition = upstream.headers.get('content-disposition');
      const contentType = upstream.headers.get('content-type');
      const contentLength = upstream.headers.get('content-length');

      if (contentDisposition) responseHeaders.set('Content-Disposition', contentDisposition);
      if (contentType) responseHeaders.set('Content-Type', contentType);
      if (contentLength) responseHeaders.set('Content-Length', contentLength);

      return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch (err: any) {
      console.error('[WaveX Download Proxy] Error contacting Render:', err.message);
      return NextResponse.json({ error: 'Streaming backend unavailable for download.' }, { status: 502 });
    }
  }

  // 2. Local fallback if running standalone Next.js without Render
  try {
    const audioUrl = await getStreamUrl(videoId);
    const upstreamResp = await undiciRequest(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.youtube.com/',
      },
    });

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.m4a"`);
    responseHeaders.set('Content-Type', (upstreamResp.headers['content-type'] as string) || 'audio/mp4');
    if (upstreamResp.headers['content-length']) {
      responseHeaders.set('Content-Length', upstreamResp.headers['content-length'] as string);
    }

    const webStream = Readable.toWeb(upstreamResp.body as any);

    return new Response(webStream as any, {
      status: upstreamResp.statusCode,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('[API Download Error]:', err.message);
    return NextResponse.json({ error: 'Download error', message: err.message }, { status: 500 });
  }
}
