import { NextResponse } from 'next/server';
import { GoogleAdsApi } from 'google-ads-api';

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN!;
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN!;
const MANAGER_ID = process.env.GOOGLE_ADS_MANAGER_ID?.replace(/-/g, '') || '';
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '') || '';

const tw = (d: Date) => new Date(d.getTime() + 8*3600*1000).toISOString().split('T')[0];
const dAgo = (n: number) => tw(new Date(Date.now() - n*86400000));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since') || dAgo(6);
    const until = searchParams.get('until') || tw(new Date());

    const client = new GoogleAdsApi({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      developer_token: DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: CUSTOMER_ID,
      login_customer_id: MANAGER_ID,
      refresh_token: REFRESH_TOKEN,
    });

    // 期間總覽
    const summaryRes = await customer.query(`
      SELECT
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.conversions_value,
        metrics.search_impression_share
      FROM customer
      WHERE segments.date BETWEEN '${since}' AND '${until}'
    `);

    const summary = summaryRes[0] || {};
    const spend = (summary.metrics?.cost_micros || 0) / 1_000_000;
    const conversionsValue = summary.metrics?.conversions_value || 0;
    const roas = spend > 0 ? conversionsValue / spend : 0;

    // 每日趨勢
    const dailyRes = await customer.query(`
      SELECT
        segments.date,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions
      FROM customer
      WHERE segments.date BETWEEN '${dAgo(29)}' AND '${tw(new Date())}'
      ORDER BY segments.date ASC
    `);

    const dailyTrend = dailyRes.map((row: any) => ({
      date: row.segments?.date,
      spend: (row.metrics?.cost_micros || 0) / 1_000_000,
      impressions: row.metrics?.impressions || 0,
      clicks: row.metrics?.clicks || 0,
      conversions: row.metrics?.conversions || 0,
    }));

    // Campaign 排行
    const campaignRes = await customer.query(`
      SELECT
        campaign.name,
        campaign.status,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE segments.date BETWEEN '${since}' AND '${until}'
        AND campaign.status != 'REMOVED'
      ORDER BY metrics.cost_micros DESC
      LIMIT 10
    `);

    const campaigns = campaignRes.map((row: any) => {
      const s = (row.metrics?.cost_micros || 0) / 1_000_000;
      const cv = row.metrics?.conversions_value || 0;
      return {
        name: row.campaign?.name,
        status: row.campaign?.status,
        spend: Math.round(s),
        impressions: row.metrics?.impressions || 0,
        clicks: row.metrics?.clicks || 0,
        ctr: (row.metrics?.ctr || 0) * 100,
        cpc: (row.metrics?.average_cpc || 0) / 1_000_000,
        conversions: row.metrics?.conversions || 0,
        roas: s > 0 ? cv / s : 0,
      };
    });

    return NextResponse.json({
      summary: {
        spend: Math.round(spend),
        impressions: summary.metrics?.impressions || 0,
        clicks: summary.metrics?.clicks || 0,
        ctr: (summary.metrics?.ctr || 0) * 100,
        cpc: (summary.metrics?.average_cpc || 0) / 1_000_000,
        conversions: summary.metrics?.conversions || 0,
        roas: Math.round(roas * 100) / 100,
      },
      dailyTrend,
      campaigns,
      updatedAt: new Date().toISOString(),
    });

  } catch (e: any) {
    console.error('Google Ads API error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
