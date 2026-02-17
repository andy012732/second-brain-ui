import { NextResponse } from 'next/server';
import axios from 'axios';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = "19e7d8d2d12980a69bcdd8f03014635e";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!NOTION_TOKEN) return NextResponse.json({ error: 'Token Missing' }, { status: 401 });

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

    // 1. 取得 Notion 實體門市數據
    const notionData = response.data.results.map((page: any) => ({
      id: page.id,
      store: page.properties.門市.multi_select[0]?.name || '未知',
      date: page.properties.營業日期.date?.start || '無日期',
      total: page.properties.當日營業額.formula.number || 0
    }));

    // 2. 🚀 新增：官網業績佔位符 (學長！這裡我先用模擬數據，之後我幫您接官網 API 喔！)
    const websiteData = {
      id: "web-001",
      store: "官網",
      date: new Date().toISOString().split('T')[0],
      total: 12500 // 先幫學長隨機預設一個數字
    };

    return NextResponse.json([...notionData, websiteData]);
  } catch (error) {
    return NextResponse.json({ error: 'Sync Failed' }, { status: 500 });
  }
}
