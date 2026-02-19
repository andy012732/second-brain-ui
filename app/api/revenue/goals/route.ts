import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data } = await supabase
    .from('revenue_goals')
    .select('*');
  
  // 預設目標
  const defaults = { 新豐: 1000000, 竹北: 1000000, 官網: 500000 };
  if (!data || data.length === 0) return NextResponse.json(defaults);
  
  const goals: Record<string, number> = { ...defaults };
  for (const row of data) {
    goals[row.store] = row.goal;
  }
  return NextResponse.json(goals);
}

export async function PUT(req: Request) {
  const body = await req.json();
  for (const [store, goal] of Object.entries(body)) {
    await supabase.from('revenue_goals').upsert(
      { store, goal },
      { onConflict: 'store' }
    );
  }
  return NextResponse.json({ ok: true });
}
