import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
  const { data } = await supabase
    .from('online_revenue')
    .select('*')
    .gte('date', `${month}-01`)
    .lte('date', `${month}-31`)
    .order('date');
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('online_revenue')
    .upsert({ date: body.date, amount: body.amount }, { onConflict: 'date' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
