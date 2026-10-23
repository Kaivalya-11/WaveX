import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ trackId: string }> }
) {
  try {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

    const { trackId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    await db.collection('downloads').deleteOne({ userId, trackId });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API Downloads DELETE Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

