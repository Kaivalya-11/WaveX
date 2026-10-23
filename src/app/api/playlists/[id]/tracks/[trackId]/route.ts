import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const { id, trackId } = await params;
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: 'Invalid playlist ID format' }, { status: 400 });
    }

    const updateDoc: any = {
      $pull: { tracks: { trackId } },
      $set: { updatedAt: new Date() },
    };

    const updated = await db.collection('playlists').findOneAndUpdate(
      { _id: objectId },
      updateDoc,
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated || {});
  } catch (err: any) {
    console.error('[API Playlists Remove Track Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

