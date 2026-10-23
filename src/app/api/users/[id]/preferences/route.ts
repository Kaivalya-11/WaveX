import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const { id } = await params;
    const { preferences } = await req.json();

    const result = await db.collection('users').findOneAndUpdate(
      { googleId: id },
      { $set: { preferences, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    return NextResponse.json(result || {});
  } catch (err: any) {
    console.error('[API Users PATCH Preferences Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

