import { NextResponse } from 'next/server';

const TOKEN = process.env.META_PAGE_TOKEN!;
const PAGE_ID = process.env.META_PAGE_ID!;

const FB_BASE = 'https://graph.facebook.com/v19.0';

async function fbGet(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ access_token: TOKEN, ...params });
  const res = await fetch(`${FB_BASE}/${path}?${qs}`, { next: { revalidate: 300 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook API ${res.status}: ${err}`);
  }
  return res.json();
}

export async function GET() {
  try {
    if (!TOKEN || !PAGE_ID) {
      return NextResponse.json({ error: 'Missing Facebook config' }, { status: 500 });
    }

    // 1. 粉專基本資訊（粉絲數）
    const pageInfo = await fbGet(PAGE_ID, {
      fields: 'name,fan_count,followers_count',
    });

    // 2. 最近 20 篇貼文（含互動數據）
    const postsRes = await fbGet(`${PAGE_ID}/posts`, {
      fields: 'message,created_time,full_picture,permalink_url,shares,likes.summary(true).limit(0),comments.summary(true).limit(0)',
      limit: '20',
    });

    // 整理貼文列表
    const posts = (postsRes.data || []).map((p: any) => {
      const likes = p.likes?.summary?.total_count || 0;
      const comments = p.comments?.summary?.total_count || 0;
      const shares = p.shares?.count || 0;
      const totalEngagement = likes + comments + shares;

      return {
        id: p.id,
        message: p.message || '(無文字)',
        // 取前 60 字當標題
        title: (p.message || '(無文字)').slice(0, 60) + ((p.message || '').length > 60 ? '...' : ''),
        createdTime: p.created_time?.split('T')[0] || '',
        image: p.full_picture || '',
        permalink: p.permalink_url || '',
        likes,
        comments,
        shares,
        engagement: totalEngagement,
      };
    });

    return NextResponse.json({
      page: {
        name: pageInfo.name || '',
        fanCount: pageInfo.fan_count || 0,
        followersCount: pageInfo.followers_count || 0,
      },
      posts,
      updatedAt: new Date().toISOString(),
    });

  } catch (e: any) {
    console.error('Facebook API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
