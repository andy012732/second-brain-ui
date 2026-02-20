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
  return getNum(props,'現金') + getNum(props,'刷卡') + getNum(props,'LINEPAY') + getNum(props,'匯款') - getNum(props,'其他支出');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // 單日查詢 e.g. 2026-01-15
    const month = searchParams.get('month'); // 月查詢 e.g. 2026-01

    if (!date && !month) return NextResponse.json({ error: 'need date or month param' }, { status: 400 });

    let filter: object;
    if (date) {
      filter = { property: '營業日期', date: { equals: date } };
    } else {
      const monthStart = `${month}-01`;
      const [y, m] = month!.split('-').map(Number);
      const nextMonth = m === 12 ? `${y+1}-01-01` : `${y}-${String(m+1).padStart(2,'0')}-01`;
      filter = { and: [
        { property: '營業日期', date: { on_or_after: monthStart } },
        { property: '營業日期', date: { before: nextMonth } },
      ]};
    }

    const rows = await queryNotion(filter, [{ property: '營業日期', direction: 'ascending' }]);

    const dailyMap: Record<string, Record<string, any>> = {};
    for (const row of rows) {
      const props = row.properties;
      const d = getDate(props);
      const stores = getStores(props);
      const revenue = calcRevenue(props);
      for (const store of stores) {
        if (!dailyMap[d]) dailyMap[d] = {};
        dailyMap[d][store] = {
          revenue,
          現金: getNum(props,'現金'),
          刷卡: getNum(props,'刷卡'),
          LINEPAY: getNum(props,'LINEPAY'),
          匯款: getNum(props,'匯款'),
          其他支出: getNum(props,'其他支出'),
        };
      }
    }

    // 月彙總
    const monthTotal: Record<string, number> = { 新豐: 0, 竹北: 0 };
    for (const storeMap of Object.values(dailyMap)) {
      for (const [store, d] of Object.entries(storeMap)) {
        if (monthTotal[store] !== undefined) monthTotal[store] += (d as any).revenue;
      }
    }

    return NextResponse.json({ dailyMap, monthTotal, rowCount: rows.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
