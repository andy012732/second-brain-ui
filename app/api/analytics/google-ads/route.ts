import { NextResponse } from 'next/server';

const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const MANAGER_ID = (process.env.GOOGLE_ADS_MANAGER_ID || '').trim().replace(/-/g, '');
const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').trim().replace(/-/g, '');
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;

function tw(d: Date) {
  return d.toISOString().slice(0, 10);
}
function dAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return tw(d);
}

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
  if (!data.access_token) throw new Error(data.error || 'Failed to get access token');
  return data.access_token;
}

async function gadsQuery(accessToken: string, query: string) {
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
      body: JSON.stringify({ query }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.error || data));
  return data.results || [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since') || dAgo(29);
    const until = searchParams.get('until') || tw(new Date());

    const accessToken = await getAccessToken();

    const [summaryRows, campaignRows, dailyRows] = await Promise.all([
      gadsQuery(accessToken, `SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.conversions_value FROM customer WHERE segments.date BETWEEN '${since}' AND '${until}'`),
      gadsQuery(accessToken, `SELECT campaign.name, campaign.status, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '${since}' AND '${until}' AND campaign.status != 'REMOVED' ORDER BY metrics.cost_micros DESC LIMIT 10`),
      gadsQuery(accessToken, `SELECT segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions FROM customer WHERE segments.date BETWEEN '${dAgo(29)}' AND '${tw(new Date())}' ORDER BY segments.date ASC`),
    ]);

    const summary = summaryRows[0] || {};
    const spend = (summary.metrics?.costMicros || 0) / 1_000_000;
    const roas = spend > 0 ? (summary.metrics?.conversionsValue || 0) / spend : 0;

    const campaigns = campaignRows.map((r: any) => {
      const m = r.metrics || {};
      const sp = (m.costMicros || 0) / 1_000_000;
      return {
        name: r.campaign?.name,
        status: r.campaign?.status,
        spend: Math.round(sp),
        impressions: m.impressions || 0,
        clicks: m.clicks || 0,
        ctr: ((m.ctr || 0) * 100).toFixed(2),
        cpc: ((m.averageCpc || 0) / 1_000_000).toFixed(2),
        conversions: m.conversions || 0,
        roas: sp > 0 ? ((m.conversionsValue || 0) / sp).toFixed(2) : '0',
      };
    });

    const dailyTrend = dailyRows.map((r: any) => ({
      date: r.segments?.date,
      spend: (r.metrics?.costMicros || 0) / 1_000_000,
      impressions: r.metrics?.impressions || 0,
      clicks: r.metrics?.clicks || 0,
      conversions: r.metrics?.conversions || 0,
    }));

    return NextResponse.json({
      summary: {
        spend: Math.round(spend),
        impressions: summary.metrics?.impressions || 0,
        clicks: summary.metrics?.clicks || 0,
        ctr: ((summary.metrics?.ctr || 0) * 100).toFixed(2),
        cpc: ((summary.metrics?.averageCpc || 0) / 1_000_000).toFixed(2),
        conversions: summary.metrics?.conversions || 0,
        roas: Math.round(roas * 100) / 100,
      },
      campaigns,
      dailyTrend,
      updatedAt: new Date().toISOString(),
    });

  } catch (e: any) {
    console.error('Google Ads error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
