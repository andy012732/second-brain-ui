import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: 取得活動列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    let query = 'SELECT * FROM activities';
    const params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const activities = db.prepare(query).all(...params);
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

// POST: 記錄新活動
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, description, details } = body;

    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details || null;

    const info = db.prepare(
      'INSERT INTO activities (type, title, description, details) VALUES (?, ?, ?, ?)'
    ).run(type, title, description, detailsStr);

    return NextResponse.json({ 
      id: info.lastInsertRowid, 
      success: true,
      message: 'Intel logged successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}
