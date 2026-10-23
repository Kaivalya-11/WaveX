import { NextRequest, NextResponse } from 'next/server';
import { getYTMusic } from '@/lib/ytmusic';

export const dynamic = 'force-dynamic';

function getHighResCover(thumbnails: any[], videoId?: string): string {
  if (!thumbnails || thumbnails.length === 0) {
    return videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : 'https://i.scdn.co/image/ab67616d0000b273b54cdfbfaa828674ffecd12c';
  }
  let url = thumbnails[thumbnails.length - 1].url;
  if (url.includes('i.ytimg.com')) {
    url = url.replace('mqdefault.jpg', 'hqdefault.jpg').replace('maxresdefault.jpg', 'hqdefault.jpg');
  }
  return url;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const ytmusic = await getYTMusic();
    const v: any = await ytmusic.getSong(id);

    let artistName = 'Unknown Artist';
    if (typeof v.artist === 'string') artistName = v.artist;
    else if (v.artist && typeof v.artist.name === 'string') artistName = v.artist.name;
    else if (Array.isArray(v.artists)) artistName = v.artists.map((a: any) => a.name).join(', ');
    else if (v.author) artistName = typeof v.author === 'string' ? v.author : v.author.name;

    const track = {
      id: v.videoId,
      title: v.name || v.title || 'Unknown Title',
      artist: artistName || 'Unknown Artist',
      album: v.album ? (typeof v.album === 'string' ? v.album : v.album.name) : 'YouTube Release',
      genre: 'Music',
      duration: v.duration || 0,
      cover: getHighResCover(v.thumbnails, v.videoId),
      src: `/api/stream?videoId=${v.videoId}`,
    };

    return NextResponse.json(track);
  } catch (err: any) {
    console.error('[API Track Error]:', err.message);
    return NextResponse.json({ error: 'Track lookup upstream error', message: err.message }, { status: 500 });
  }
}

