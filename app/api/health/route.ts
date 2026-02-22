import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, { ok: boolean; ms?: number }> = {};

  // Check Notion API
  const t0 = Date.now();
  try {
    const res = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
      },
    });
    results.notion = { ok: res.ok, ms: Date.now() - t0 };
  } catch {
    results.notion = { ok: false, ms: Date.now() - t0 };
  }

  // Check Supabase (project uses Supabase, not Vercel KV)
  const t1 = Date.now();
  try {
    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error('no url');
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    results.kv = { ok: res.ok || res.status === 200, ms: Date.now() - t1 };
  } catch {
    results.kv = { ok: false, ms: Date.now() - t1 };
  }

  return NextResponse.json({
    notion: results.notion,
    kv: results.kv,
    ts: new Date().toISOString(),
  });
}
