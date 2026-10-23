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

    const history = await db.collection('recentlyPlayed')
      .find({ userId })
      .sort({ playedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(history);
  } catch (err: any) {
    console.error('[API History GET Error]:', err);
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

    const trackDoc = {
      userId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
      duration: track.duration,
      src: track.src,
      playedAt: new Date(),
    };

    await db.collection('recentlyPlayed').updateOne(
      { userId, trackId: track.id },
      { $set: trackDoc },
      { upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('[API History POST Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

