import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
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

    const playlist = await db.collection('playlists').findOne({ _id: objectId });
    if (!playlist) return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });

    return NextResponse.json({
      ...playlist,
      id: playlist._id.toString(),
    });
  } catch (err: any) {
    console.error('[API Playlists [id] GET Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    await db.collection('playlists').deleteOne({ _id: objectId });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Playlists [id] DELETE Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

