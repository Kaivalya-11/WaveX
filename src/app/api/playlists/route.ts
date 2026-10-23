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

    const playlists = await db.collection('playlists')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = playlists.map(pl => ({
      ...pl,
      id: pl._id.toString(),
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error('[API Playlists GET Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const body = await req.json();
    const { userId, name, description } = body;
    if (!userId || !name) {
      return NextResponse.json({ error: 'Missing userId or name' }, { status: 400 });
    }

    const doc = {
      userId,
      name,
      description: description || '',
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('playlists').insertOne(doc);
    const newPlaylist = await db.collection('playlists').findOne({ _id: result.insertedId });

    return NextResponse.json({
      ...newPlaylist,
      id: result.insertedId.toString(),
    }, { status: 201 });
  } catch (err: any) {
    console.error('[API Playlists POST Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

