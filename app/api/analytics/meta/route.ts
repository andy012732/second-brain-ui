import { NextResponse } from 'next/server';

const TOKEN = process.env.META_ACCESS_TOKEN!;
const ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID!;

async function fbGet(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ access_token: TOKEN, ...params });
  const res = await fetch(`https://graph.facebook.com/v19.0/${path}?${qs}`);
  return res.json();
}

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    if (!TOKEN || !ACCOUNT_ID) {
      return NextResponse.json({ error: 'Missing Meta config' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const today = new Date();
    const fmt = (d: Date) => new Date(d.getTime() + 8*3600000).toISOString().split('T')[0];
    const todayStr = fmt(today);
    const since = searchParams.get('since') || todayStr;
    const until = searchParams.get('until') || todayStr;
    const d7 = fmt(new Date(today.getTime() - 7 * 86400000));
    const d30 = fmt(new Date(today.getTime() - 30 * 86400000));

    // 並行抓取
    const [todayInsight, weekInsight, monthInsight, campaigns, adsets] = await Promise.all([
      // 今日帳戶概覽
      fbGet(`act_${ACCOUNT_ID}/insights`, {
        time_range: JSON.stringify({ since, until }),
        fields: 'spend,impressions,clicks,ctr,cpc,cpp,reach,frequency',
        level: 'account',
      }),
      // 近7天
      fbGet(`act_${ACCOUNT_ID}/insights`, {
        time_range: JSON.stringify({ since, until }),
        fields: 'spend,impressions,clicks,ctr,cpc,reach,actions,action_values',
        level: 'account',
      }),
      // 近30天每日
      fbGet(`act_${ACCOUNT_ID}/insights`, {
        time_range: JSON.stringify({ since: d30, until: todayStr }),
        fields: 'spend,impressions,clicks,reach',
        time_increment: '1',
        level: 'account',
      }),
      // 廣告活動列表（近7天成效）
      fbGet(`act_${ACCOUNT_ID}/campaigns`, {
        fields: 'name,status,insights{spend,impressions,clicks,ctr,cpc,actions,action_values}',
        time_range: JSON.stringify({ since: d7, until: todayStr }),
        limit: '10',
      }),
      // 廣告組成效排名
      fbGet(`act_${ACCOUNT_ID}/adsets`, {
        fields: 'name,status,insights{spend,impressions,clicks,ctr,reach}',
        time_range: JSON.stringify({ since: d7, until: todayStr }),
        limit: '10',
      }),
    ]);

    // 整理今日數據
    const todayData = todayInsight.data?.[0] || {};
    const weekData = weekInsight.data?.[0] || {};

    // 計算 ROAS（purchase action_values / spend）
    const getROAS = (insight: any) => {
      const spend = parseFloat(insight.spend || 0);
      if (!spend) return 0;
      const purchaseVal = insight.action_values?.find((a: any) => a.action_type === 'purchase')?.value || 0;
      return parseFloat(purchaseVal) / spend;
    };

    const getPurchases = (insight: any) => {
      return parseInt(insight.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0);
    };

    // 整理每日趨勢
    const dailyTrend = (monthInsight.data || []).map((d: any) => ({
      date: d.date_start,
      spend: parseFloat(d.spend || 0),
      impressions: parseInt(d.impressions || 0),
      clicks: parseInt(d.clicks || 0),
      reach: parseInt(d.reach || 0),
    })).sort((a: any, b: any) => a.date.localeCompare(b.date));

    // 整理廣告活動
    const campaignList = (campaigns.data || []).map((c: any) => {
      const ins = c.insights?.data?.[0] || {};
      return {
        name: c.name,
        status: c.status,
        spend: parseFloat(ins.spend || 0),
        impressions: parseInt(ins.impressions || 0),
        clicks: parseInt(ins.clicks || 0),
        ctr: parseFloat(ins.ctr || 0),
        cpc: parseFloat(ins.cpc || 0),
        roas: getROAS(ins),
        purchases: getPurchases(ins),
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    // 整理廣告組
    const adsetList = (adsets.data || []).map((a: any) => {
      const ins = a.insights?.data?.[0] || {};
      return {
        name: a.name,
        status: a.status,
        spend: parseFloat(ins.spend || 0),
        impressions: parseInt(ins.impressions || 0),
        clicks: parseInt(ins.clicks || 0),
        ctr: parseFloat(ins.ctr || 0),
        reach: parseInt(ins.reach || 0),
      };
    }).sort((a: any, b: any) => b.spend - a.spend);

    return NextResponse.json({
      today: {
        spend: parseFloat(todayData.spend || 0),
        impressions: parseInt(todayData.impressions || 0),
        clicks: parseInt(todayData.clicks || 0),
        ctr: parseFloat(todayData.ctr || 0),
        cpc: parseFloat(todayData.cpc || 0),
        reach: parseInt(todayData.reach || 0),
        frequency: parseFloat(todayData.frequency || 0),
      },
      week: {
        spend: parseFloat(weekData.spend || 0),
        impressions: parseInt(weekData.impressions || 0),
        clicks: parseInt(weekData.clicks || 0),
        ctr: parseFloat(weekData.ctr || 0),
        cpc: parseFloat(weekData.cpc || 0),
        roas: getROAS(weekData),
        purchases: getPurchases(weekData),
      },
      dailyTrend,
      campaigns: campaignList,
      adsets: adsetList,
      updatedAt: new Date().toISOString(),
    });

  } catch (e: any) {
    console.error('Meta API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
