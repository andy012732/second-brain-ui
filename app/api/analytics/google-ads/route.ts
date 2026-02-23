import { NextResponse } from 'next/server';

const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const MANAGER_ID = (process.env.GOOGLE_ADS_MANAGER_ID || '').replace(/-/g, '');
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, '');
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;

export async function GET(req: Request) {
  // 先回傳環境變數診斷
  return NextResponse.json({
    has_client_id: !!CLIENT_ID,
    has_client_secret: !!CLIENT_SECRET,
    has_refresh_token: !!REFRESH_TOKEN,
    has_developer_token: !!DEVELOPER_TOKEN,
    manager_id: MANAGER_ID,
    customer_id: CUSTOMER_ID,
    client_id_prefix: CLIENT_ID?.slice(0, 20),
  });
}
