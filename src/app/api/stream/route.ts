import { NextRequest } from 'next/server';
import { getStreamUrl, invalidateStreamUrl } from '@/lib/ytdlp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
      'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function HEAD(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return new Response(null, { status: 400 });
  }

  try {
    const audioUrl = await getStreamUrl(videoId);
    const upstreamResp = await fetch(audioUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    const headers = new Headers();
    const contentType = upstreamResp.headers.get('content-type') || 'audio/mp4';
    const contentLength = upstreamResp.headers.get('content-length');

    headers.set('Content-Type', contentType);
    headers.set('Accept-Ranges', 'bytes');
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    return new Response(null, {
      status: upstreamResp.status === 200 ? 200 : upstreamResp.status,
      headers,
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return new Response(
      JSON.stringify({ error: 'Missing videoId' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    let audioUrl = await getStreamUrl(videoId);

    const clientRange = req.headers.get('range');
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Encoding': 'identity',
    };

    if (clientRange) {
      upstreamHeaders['Range'] = clientRange;
    }

    let upstreamResp = await fetch(audioUrl, {
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    // Handle upstream 403 (expired signed URL): invalidate cache and retry once
    if (upstreamResp.status === 403) {
      console.warn(`[Stream] 403 from upstream for ${videoId}, invalidating cache and retrying...`);
      invalidateStreamUrl(videoId);
      audioUrl = await getStreamUrl(videoId);
      upstreamResp = await fetch(audioUrl, {
        headers: upstreamHeaders,
        redirect: 'follow',
      });
    }

    if (!upstreamResp.ok) {
      invalidateStreamUrl(videoId);
      const isNotFound = upstreamResp.status === 404;
      return new Response(
        JSON.stringify({
          error: isNotFound ? 'Track source not found' : 'Upstream stream error',
          status: upstreamResp.status,
        }),
        {
          status: isNotFound ? 404 : 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const rawContentType = upstreamResp.headers.get('content-type') || 'audio/mp4';
    if (rawContentType.includes('text') || rawContentType.includes('html')) {
      invalidateStreamUrl(videoId);
      return new Response(
        JSON.stringify({ error: 'Invalid upstream media content type', contentType: rawContentType }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const contentType = rawContentType.startsWith('audio/') || rawContentType.startsWith('video/')
      ? rawContentType
      : 'audio/mp4';

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    const contentLength = upstreamResp.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = upstreamResp.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    // Stream upstream body directly to the client without in-memory buffering
    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    const errMsg = err?.message || 'Stream extraction error';
    console.warn('[API Stream Error]:', errMsg);

    // Fallback: If local extraction encountered an error, try forwarding to the active WaveX backend server on port 5000
    try {
      const clientRange = req.headers.get('range');
      const backendUrl = `http://localhost:5000/api/stream?videoId=${encodeURIComponent(videoId)}`;
      const fwdHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
      };
      if (clientRange) fwdHeaders['Range'] = clientRange;

      const fwdResp = await fetch(backendUrl, {
        headers: fwdHeaders,
        signal: AbortSignal.timeout(5000),
      });

      if (fwdResp.ok) {
        const respHeaders = new Headers();
        const ct = fwdResp.headers.get('content-type') || 'audio/mp4';
        respHeaders.set('Content-Type', ct);
        respHeaders.set('Accept-Ranges', 'bytes');
        respHeaders.set('Cache-Control', 'public, max-age=3600');
        respHeaders.set('Access-Control-Allow-Origin', '*');
        respHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        respHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
        respHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

        const cl = fwdResp.headers.get('content-length');
        if (cl) respHeaders.set('Content-Length', cl);
        const cr = fwdResp.headers.get('content-range');
        if (cr) respHeaders.set('Content-Range', cr);

        return new Response(fwdResp.body, {
          status: fwdResp.status,
          headers: respHeaders,
        });
      }
    } catch {
      // Port 5000 backend not reachable, proceed to error response
    }

    const isUnavailable = errMsg.includes('TRACK_UNAVAILABLE') || errMsg.includes('unavailable');
    const statusCode = isUnavailable ? 404 : 502;

    return new Response(
      JSON.stringify({
        error: isUnavailable ? 'Track unavailable' : 'Stream extraction failed',
        message: errMsg,
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
