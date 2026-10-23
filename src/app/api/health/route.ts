import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getDB();
  return NextResponse.json({
    status: db ? 'ok' : 'degraded',
    service: 'wavex-next-api',
    database: db ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
}

