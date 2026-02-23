import { NextResponse } from 'next/server';

const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

async function ytGet(endpoint: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ key: API_KEY, ...params });
  const res = await fetch(`${YT_BASE}/${endpoint}?${qs}`, { next: { revalidate: 300 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube API ${res.status}: ${err}`);
  }
  return res.json();
}

export async function GET() {
  try {
    if (!API_KEY || !CHANNEL_ID) {
      return NextResponse.json({ error: 'Missing YouTube config' }, { status: 500 });
    }

    // 1. 頻道統計（訂閱數、總觀看、影片數）— 1 unit
    const channelRes = await ytGet('channels', {
      part: 'statistics,snippet',
      id: CHANNEL_ID,
    });
    const channel = channelRes.items?.[0];
    const stats = channel?.statistics || {};
    const snippet = channel?.snippet || {};

    // 2. 取得最新影片的 playlistId（上傳播放清單）
    // uploads playlist = 把 channel ID 的 UC 換成 UU
    const uploadsPlaylistId = CHANNEL_ID.replace(/^UC/, 'UU');

    // 3. 取得最新 20 支影片 — 1 unit
    const playlistRes = await ytGet('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: '20',
    });

    const videoIds = (playlistRes.items || [])
      .map((item: any) => item.contentDetails?.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) {
      return NextResponse.json({
        channel: {
          name: snippet.title || '',
          subscribers: parseInt(stats.subscriberCount || 0),
          totalViews: parseInt(stats.viewCount || 0),
          videoCount: parseInt(stats.videoCount || 0),
          thumbnail: snippet.thumbnails?.default?.url || '',
        },
        videos: [],
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. 取得影片詳細統計（觀看、讚、留言）— 1 unit
    const videosRes = await ytGet('videos', {
      part: 'statistics,snippet,contentDetails',
      id: videoIds,
    });

    // 整理影片列表
    const videos = (videosRes.items || []).map((v: any) => {
      const s = v.statistics || {};
      const sn = v.snippet || {};
      const views = parseInt(s.viewCount || 0);
      const likes = parseInt(s.likeCount || 0);
      const comments = parseInt(s.commentCount || 0);
      const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;

      // 解析影片時長 ISO 8601 (PT1H2M3S)
      const dur = v.contentDetails?.duration || '';
      const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      const hours = parseInt(match?.[1] || '0');
      const minutes = parseInt(match?.[2] || '0');
      const seconds = parseInt(match?.[3] || '0');
      const duration = hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`;

      return {
        id: v.id,
        title: sn.title || '',
        publishedAt: sn.publishedAt?.split('T')[0] || '',
        thumbnail: sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || '',
        duration,
        views,
        likes,
        comments,
        engagementRate: Math.round(engagement * 100) / 100,
      };
    });

    return NextResponse.json({
      channel: {
        name: snippet.title || '',
        subscribers: parseInt(stats.subscriberCount || 0),
        totalViews: parseInt(stats.viewCount || 0),
        videoCount: parseInt(stats.videoCount || 0),
        thumbnail: snippet.thumbnails?.default?.url || '',
      },
      videos,
      updatedAt: new Date().toISOString(),
    });

  } catch (e: any) {
    console.error('YouTube API error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
