import { NextResponse } from 'next/server';

const PROPERTY_ID = process.env.GA4_PROPERTY_ID!;
const SA_JSON = process.env.GA4_SERVICE_ACCOUNT_JSON!;

// 取得 Google OAuth2 access token
async function getAccessToken(): Promise<string> {
  const sa = JSON.parse(SA_JSON);
  const now = Math.floor(Date.now() / 1000);
  
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsigned = `${encode(header)}.${encode(payload)}`;

  // 用 Web Crypto API 簽名（Edge Runtime 相容）
  const pemKey = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  
  const keyBuffer = Buffer.from(pemKey, 'base64');
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey,
    Buffer.from(unsigned)
  );

  const jwt = `${unsigned}.${Buffer.from(signature).toString('base64url')}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Token failed: ' + JSON.stringify(data));
  return data.access_token;
}

// 呼叫 GA4 Data API
async function runReport(token: string, body: object) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

export const runtime = 'edge';

export async function GET() {
  try {
    if (!PROPERTY_ID || !SA_JSON) {
      return NextResponse.json({ error: 'Missing GA4 config' }, { status: 500 });
    }

    const token = await getAccessToken();

    // 並行抓取所有報表
    const [usersReport, sourceReport, pagesReport, convReport] = await Promise.all([
      // 每日使用者數（近7天）
      runReport(token, {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      // 流量來源
      runReport(token, {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 6,
      }),
      // 熱門頁面
      runReport(token, {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      }),
      // 轉換數（近7天）
      runReport(token, {
        dateRanges: [
          { startDate: '7daysAgo', endDate: 'today' },
          { startDate: '14daysAgo', endDate: '8daysAgo' },
        ],
        metrics: [{ name: 'conversions' }, { name: 'activeUsers' }, { name: 'sessions' }],
      }),
    ]);

    // 整理每日使用者
    const dailyUsers = (usersReport.rows || []).map((r: any) => ({
      date: r.dimensionValues[0].value,
      users: parseInt(r.metricValues[0].value || 0),
      sessions: parseInt(r.metricValues[1].value || 0),
    }));

    // 整理流量來源
    const sources = (sourceReport.rows || []).map((r: any) => ({
      channel: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value || 0),
      users: parseInt(r.metricValues[1].value || 0),
    }));
    const totalSessions = sources.reduce((s: number, r: any) => s + r.sessions, 0);

    // 整理熱門頁面
    const topPages = (pagesReport.rows || []).map((r: any) => ({
      title: r.dimensionValues[0].value,
      views: parseInt(r.metricValues[0].value || 0),
      users: parseInt(r.metricValues[1].value || 0),
    }));

    // 整理轉換數
    const convRows = convReport.rows || [];
    const thisWeek = convRows[0]?.metricValues;
    const lastWeek = convRows[1]?.metricValues;
    const conversions = {
      thisWeek: parseInt(thisWeek?.[0]?.value || 0),
      lastWeek: parseInt(lastWeek?.[0]?.value || 0),
      users7d: parseInt(thisWeek?.[1]?.value || 0),
      sessions7d: parseInt(thisWeek?.[2]?.value || 0),
    };

    return NextResponse.json({
      dailyUsers,
      sources: sources.map((s: any) => ({ ...s, pct: totalSessions > 0 ? Math.round((s.sessions / totalSessions) * 100) : 0 })),
      topPages,
      conversions,
      updatedAt: new Date().toISOString(),
    });

  } catch (e: any) {
    console.error('GA4 error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
