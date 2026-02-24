import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const TT_BASE = 'https://open.tiktokapis.com/v2';
const MANUAL_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;

async function getStoredToken(): Promise<{
  access_token: string; refresh_token: string; expires_at: number;
} | null> {
  if (MANUAL_TOKEN) {
    return { access_token: MANUAL_TOKEN, refresh_token: '', expires_at: Date.now() + 86400000 };
  }
  try {
    const data = await fs.readFile('/tmp/tiktok-token.json', 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function doRefreshToken(rt: string): Promise<any> {
  const res = await fetch(`${TT_BASE}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY, client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token', refresh_token: rt,
    }),
  });
  return res.json();
}

export const revalidate = 300;

export async function GET() {
  try {
    let token = await getStoredToken();

    if (!token) {
      return NextResponse.json({
        error: 'not_authenticated',
        message: 'TikTok not connected. Visit /api/auth/tiktok to authorize.',
        authUrl: '/api/auth/tiktok',
      }, { status: 401 });
    }

    if (token.expires_at < Date.now() && token.refresh_token) {
      const refreshed = await doRefreshToken(token.refresh_token);
      if (refreshed.access_token) {
        token = {
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token || token.refresh_token,
          expires_at: Date.now() + (refreshed.expires_in || 86400) * 1000,
        };
        try {
          await fs.writeFile('/tmp/tiktok-token.json', JSON.stringify({
            ...token, updated_at: new Date().toISOString(),
          }, null, 2));
        } catch {}
      }
    }

    const accessToken = token.access_token;

    const userFields = 'open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count';
    const userRes = await fetch(
      `${TT_BASE}/user/info/?fields=${userFields}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const userData = await userRes.json();

    if (userData.error?.code && userData.error.code !== 'ok') {
      return NextResponse.json({
        error: userData.error.code,
        message: userData.error.message || 'Failed to fetch user info',
      }, { status: 400 });
    }

    const user = userData.data?.user || {};

    const videoFields = 'id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time';
    const videoRes = await fetch(
      `${TT_BASE}/video/list/?fields=${videoFields}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_count: 20 }),
      }
    );
    const videoData = await videoRes.json();

    const videos = (videoData.data?.videos || []).map((v: any) => {
      const views = v.view_count || 0;
      const likes = v.like_count || 0;
      const comments = v.comment_count || 0;
      const shares = v.share_count || 0;
      const engagement = likes + comments + shares;

      return {
        id: v.id, title: v.title || v.video_description?.slice(0, 80) || '(untitled)',
        description: v.video_description || '', duration: v.duration || 0,
        coverImage: v.cover_image_url || '', shareUrl: v.share_url || '',
        views, likes, comments, shares, engagement,
        engagementRate: views > 0 ? Math.round((engagement / views) * 10000) / 100 : 0,
        createdTime: v.create_time ? new Date(v.create_time * 1000).toISOString().split('T')[0] : '',
      };
    });

    const totalViews = videos.reduce((s, v) => s + v['views'], 0)
    const totalLikes = videos.reduce((s, v) => s + v['likes'], 0)
    const totalComments = videos.reduce((s, v) => s + v['comments'], 0)
    const totalShares = videos.reduce((s, v) => s + v['shares'], 0)
    const totalEngagement = videos.reduce((s, v) => s + v['engagement'], 0)

    return NextResponse.json({
      account: {
        displayName: user.display_name || '', avatarUrl: user.avatar_url || '',
        bio: user.bio_description || '', profileLink: user.profile_deep_link || '',
        isVerified: user.is_verified || false, followerCount: user.follower_count || 0,
        followingCount: user.following_count || 0, likesCount: user.likes_count || 0,
        videoCount: user.video_count || 0,
      },
      summary: {
        totalViews, totalLikes, totalComments, totalShares, totalEngagement,
        avgEngagement: videos.length > 0 ? Math.round(totalEngagement / videos.length) : 0,
        videosAnalyzed: videos.length,
      },
      videos,
    });
  } catch (err: any) {
    console.error('TikTok API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch TikTok data' }, { status: 500 });
  }
}
