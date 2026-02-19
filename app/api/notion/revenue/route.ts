import { NextResponse } from 'next/server';
import axios from 'axios';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = "19e7d8d2d12980a69bcdd8f03014635e";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!NOTION_TOKEN) return NextResponse.json({ error: 'Tactical Error: Token Missing' }, { status: 401 });

  try {
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        page_size: 15,
        sorts: [{ property: "營業日期", direction: "descending" }]
      },
      {
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      }
    );

    // 🚀 歐文的精準解析：對齊 Notion 實體欄位
    const data = response.data.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        store: p.門市.multi_select[0]?.name || '總部',
        date: p.營業日期.date?.start || '無日期',
        // 抓取當日營業額這個 Formula 欄位
        total: p.當日營業額.formula.number || 0,
        cash: p.現金.number || 0
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Intel Link Failed' }, { status: 500 });
  }
}
