import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const body = await req.json();
    const { googleId, name, email, avatar, preferences } = body;
    if (!googleId) return NextResponse.json({ error: 'Missing googleId' }, { status: 400 });

    const result = await db.collection('users').findOneAndUpdate(
      { googleId },
      {
        $set: {
          name,
          email,
          avatar,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          googleId,
          preferences: preferences || { audioQuality: 320, explicitContent: false, searchView: 'list' },
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json(result || {});
  } catch (err: any) {
    console.error('[API Users POST Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

