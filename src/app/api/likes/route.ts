import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const likes = await db.collection('likedSongs')
      .find({ userId })
      .sort({ addedAt: -1 })
      .toArray();

    return NextResponse.json(likes);
  } catch (err: any) {
    console.error('[API Likes GET Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const body = await req.json();
    const { userId, track } = body;
    if (!userId || !track || !track.id) {
      return NextResponse.json({ error: 'Missing userId or track data' }, { status: 400 });
    }

    const likeDoc = {
      userId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
      duration: track.duration,
      src: track.src,
      addedAt: new Date(),
    };

    await db.collection('likedSongs').updateOne(
      { userId, trackId: track.id },
      { $setOnInsert: likeDoc },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[API Likes POST Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

