import { NextResponse } from 'next/server';

const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const MANAGER_ID = (process.env.GOOGLE_ADS_MANAGER_ID || '').trim().replace(/-/g, '');
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').trim().replace(/-/g, '');
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('token_fail: ' + JSON.stringify(data));
  return data.access_token;
}

export async function GET(req: Request) {
  try {
    const accessToken = await getAccessToken();

    const res = await fetch(
      `https://googleads.googleapis.com/v16/customers/${CUSTOMER_ID}/googleAds:search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': DEVELOPER_TOKEN,
          'login-customer-id': MANAGER_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: "SELECT metrics.cost_micros, metrics.impressions FROM customer WHERE segments.date DURING LAST_7_DAYS"
        }),
      }
    );

    const text = await res.text();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      body: text.slice(0, 500),
      customer_id: CUSTOMER_ID,
      manager_id: MANAGER_ID,
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
