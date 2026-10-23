import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const { id } = await params;
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid playlist ID format' }, { status: 400 });
    }

    const { track } = await req.json();
    if (!track || !track.id) {
      return NextResponse.json({ error: 'Missing track data' }, { status: 400 });
    }

    const updateDoc: any = {
      $push: {
        tracks: {
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          cover: track.cover,
          duration: track.duration,
          src: track.src,
          addedAt: new Date(),
        },
      },
      $set: { updatedAt: new Date() },
    };

    const updated = await db.collection('playlists').findOneAndUpdate(
      { _id: objectId },
      updateDoc,
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated || {});
  } catch (err: any) {
    console.error('[API Playlists Add Track Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

