import { NextResponse } from 'next/server';

const TOKEN = process.env.META_PAGE_TOKEN!;
const PAGE_ID = process.env.META_PAGE_ID!;
const FB_BASE = 'https://graph.facebook.com/v19.0';

async function fbGet(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ access_token: TOKEN, ...params });
  const res = await fetch(`${FB_BASE}/${path}?${qs}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook API ${res.status}: ${err}`);
  }
  return res.json();
}

export const revalidate = 300;

export async function GET() {
  try {
    if (!TOKEN || !PAGE_ID) {
      return NextResponse.json({ error: 'Missing Facebook config' }, { status: 500 });
    }
    const [pageInfo, postsRes] = await Promise.all([
      fbGet('me', { fields: 'name,fan_count,followers_count' }),
      fbGet('me/posts', {
        fields: 'message,created_time,full_picture,permalink_url,shares,reactions.summary(true).limit(0),comments.summary(true).limit(0)',
        limit: '20',
      }),
    ]);
    const posts = (postsRes.data || []).map((p: any) => {
      const reactions = p.reactions?.summary?.total_count || 0;
      const comments = p.comments?.summary?.total_count || 0;
      const shares = p.shares?.count || 0;
      return {
        id: p.id, message: p.message || '',
        title: (p.message || '(無文字)').slice(0, 60) + ((p.message || '').length > 60 ? '...' : ''),
        createdTime: p.created_time?.split('T')[0] || '',
        image: p.full_picture || '', permalink: p.permalink_url || '',
        reactions, comments, shares, engagement: reactions + comments + shares,
      };
    });
    return NextResponse.json({
      page: { name: pageInfo.name || '', fanCount: pageInfo.fan_count || 0, followersCount: pageInfo.followers_count || 0 },
      posts: posts.sort((a: any, b: any) => b.engagement - a.engagement),
      updatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('Facebook API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
