import { NextRequest } from 'next/server';
import { getStreamUrl } from '@/lib/ytdlp';
import { request as undiciRequest } from 'undici';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');
  const title = searchParams.get('title') || 'WaveX Track';

  if (!videoId) {
    return new Response('Missing videoId', { status: 400 });
  }

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
    return new Response(JSON.stringify({ error: 'Download error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

