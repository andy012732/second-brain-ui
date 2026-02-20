import { NextResponse } from 'next/server';
import axios from 'axios';

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DB_ID = '19e7d8d2d12980a69bcdd8f03014635e';

async function queryNotion(filter?: object, sorts?: object[]) {
  const res = await axios.post(
    `https://api.notion.com/v1/databases/${DB_ID}/query`,
    Object.assign({ page_size: 200 }, filter ? { filter } : {}, sorts ? { sorts } : {}),
    {
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      }
    }
  );
  if (!res.data.results) console.error('Notion error:', JSON.stringify(res.data));
  return res.data.results || [];
}

function getNum(props: any, key: string): number {
  return props[key]?.number || 0;
}

function getDate(props: any): string {
  return props['營業日期']?.date?.start || '';
}

function getStores(props: any): string[] {
  return props['門市']?.multi_select?.map((s: any) => s.name) || [];
}

function calcRevenue(props: any): number {
  const cash = getNum(props, '現金');
  const card = getNum(props, '刷卡');
  const line = getNum(props, 'LINEPAY');
  const transfer = getNum(props, '匯款');
  const expense = getNum(props, '其他支出');
  return cash + card + line + transfer - expense;
}

export async function GET() {
  try {
    if (!NOTION_TOKEN) return NextResponse.json({ error: 'NO_TOKEN' });

    // 台灣時間 UTC+8
    const now = new Date();
    const twNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const today = twNow.toISOString().split('T')[0];
    const yesterday = new Date(twNow.getTime() - 86400000).toISOString().split('T')[0];
    const monthStart = `${today.slice(0, 7)}-01`;

    // 上月起始
    const thisYear = parseInt(today.slice(0, 4));
    const thisMonth = parseInt(today.slice(5, 7));
    const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;
    const lastMonthNum = thisMonth === 1 ? 12 : thisMonth - 1;
    const lastMonthStart = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}-01`;
    const lastMonthEnd = `${today.slice(0, 7)}-01`; // 本月1日前

    // 同時抓本月 + 上月資料
    const [rows, lastRows] = await Promise.all([
      queryNotion(
        { property: '營業日期', date: { on_or_after: monthStart } },
        [{ property: '營業日期', direction: 'descending' }]
      ),
      queryNotion(
        { and: [
          { property: '營業日期', date: { on_or_after: lastMonthStart } },
          { property: '營業日期', date: { before: lastMonthEnd } },
        ]},
        [{ property: '營業日期', direction: 'descending' }]
      ),
    ]);

    // 整理本月資料
    const stores = ['新豐', '竹北'];
    const todayData: Record<string, any> = {};
    const yesterdayData: Record<string, any> = {};
    const monthTotal: Record<string, number> = { 新豐: 0, 竹北: 0, 官網: 0 };
    const dailyMap: Record<string, Record<string, any>> = {};

    for (const row of rows) {
      const props = row.properties;
      const date = getDate(props);
      const rowStores = getStores(props);
      const revenue = calcRevenue(props);

      for (const store of rowStores) {
        if (date === today) {
          todayData[store] = {
            revenue,
            現金: getNum(props, '現金'),
            刷卡: getNum(props, '刷卡'),
            LINEPAY: getNum(props, 'LINEPAY'),
            匯款: getNum(props, '匯款'),
            其他支出: getNum(props, '其他支出'),
          };
        }
        if (date === yesterday) {
          yesterdayData[store] = { revenue };
        }
        if (monthTotal[store] !== undefined) {
          monthTotal[store] += revenue;
        }
        if (!dailyMap[date]) dailyMap[date] = {};
        dailyMap[date][store] = {
          revenue,
          現金: getNum(props, '現金'),
          刷卡: getNum(props, '刷卡'),
          LINEPAY: getNum(props, 'LINEPAY'),
          匯款: getNum(props, '匯款'),
          其他支出: getNum(props, '其他支出'),
        };
      }
    }

    // 整理上月資料
    const lastMonthTotal: Record<string, number> = { 新豐: 0, 竹北: 0 };
    const lastMonthDailyMap: Record<string, Record<string, number>> = {};
    for (const row of lastRows) {
      const props = row.properties;
      const date = getDate(props);
      const rowStores = getStores(props);
      const revenue = calcRevenue(props);
      for (const store of rowStores) {
        if (lastMonthTotal[store] !== undefined) lastMonthTotal[store] += revenue;
        if (!lastMonthDailyMap[date]) lastMonthDailyMap[date] = {};
        lastMonthDailyMap[date][store] = (lastMonthDailyMap[date][store] || 0) + revenue;
      }
    }

    // 上月同期（截至本月今天對應的日期）
    const todayDay = parseInt(today.slice(8, 10));
    const lastMonthSamePeriodEnd = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
    const lastMonthSamePeriod: Record<string, number> = { 新豐: 0, 竹北: 0 };
    for (const [date, storeMap] of Object.entries(lastMonthDailyMap)) {
      if (date <= lastMonthSamePeriodEnd) {
        for (const store of stores) {
          lastMonthSamePeriod[store] = (lastMonthSamePeriod[store] || 0) + (storeMap[store] || 0);
        }
      }
    }

    // 缺報日期
    const missingDates: { date: string; stores: string[] }[] = [];
    const startDate = new Date(monthStart);
    const endDate = new Date(today);
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = new Date(d.getTime()).toISOString().split('T')[0];
      if (dateStr === today) continue;
      const dayData = dailyMap[dateStr] || {};
      const missing = stores.filter(s => !dayData[s]);
      if (missing.length > 0) missingDates.push({ date: dateStr, stores: missing });
    }

    // 昨日對比
    const comparison: Record<string, any> = {};
    for (const store of stores) {
      const t = todayData[store]?.revenue || 0;
      const y = yesterdayData[store]?.revenue || 0;
      comparison[store] = {
        today: t, yesterday: y, diff: t - y,
        pct: y > 0 ? Math.round(((t - y) / y) * 100) : null,
      };
    }

    // 月付款方式加總
    const monthPayment = { 現金: 0, 刷卡: 0, LINEPAY: 0, 匯款: 0 };
    for (const row of rows) {
      const props = row.properties;
      monthPayment['現金'] += getNum(props, '現金');
      monthPayment['刷卡'] += getNum(props, '刷卡');
      monthPayment['LINEPAY'] += getNum(props, 'LINEPAY');
      monthPayment['匯款'] += getNum(props, '匯款');
    }

    return NextResponse.json({
      today, yesterday, monthStart,
      todayData, yesterdayData, comparison,
      monthTotal, missingDates, monthPayment, dailyMap,
      lastMonthTotal, lastMonthSamePeriod,
      lastMonthLabel: `${lastMonthYear}/${String(lastMonthNum).padStart(2, '0')}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
