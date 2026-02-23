import { NextResponse } from "next/server";

const TOKEN = process.env.META_PAGE_TOKEN!;
const IG_ID = process.env.META_IG_ID!; // 17841400375697950
const BASE = "https://graph.facebook.com/v19.0";

export async function GET() {
  try {
    // 1. Fetch account info
    const profileRes = await fetch(
      `${BASE}/${IG_ID}?fields=username,name,followers_count,follows_count,media_count,profile_picture_url,biography&access_token=${TOKEN}`
    );
    const profile = await profileRes.json();

    if (profile.error) {
      return NextResponse.json({ error: profile.error.message }, { status: 400 });
    }

    // 2. Fetch recent media (25 posts)
    const mediaRes = await fetch(
      `${BASE}/${IG_ID}/media?fields=caption,like_count,comments_count,timestamp,media_url,thumbnail_url,permalink,media_type&limit=25&access_token=${TOKEN}`
    );
    const mediaData = await mediaRes.json();

    const posts = (mediaData.data || []).map((post: any) => {
      const caption = post.caption || "";
      const firstLine = caption.split("\n")[0].slice(0, 80);

      return {
        id: post.id,
        caption,
        title: firstLine + (firstLine.length < caption.split("\n")[0].length ? "..." : ""),
        createdTime: post.timestamp?.split("T")[0] || "",
        image:
          post.media_type === "VIDEO"
            ? post.thumbnail_url || post.media_url
            : post.media_url || "",
        permalink: post.permalink,
        mediaType: post.media_type,
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        engagement: (post.like_count || 0) + (post.comments_count || 0),
      };
    });

    // 3. Calculate aggregates
    const totalLikes = posts.reduce((s: number, p: any) => s + p.likes, 0);
    const totalComments = posts.reduce((s: number, p: any) => s + p.comments, 0);
    const totalEngagement = posts.reduce((s: number, p: any) => s + p.engagement, 0);
    const avgEngagement = posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0;

    return NextResponse.json({
      account: {
        username: profile.username,
        name: profile.name || profile.username,
        followersCount: profile.followers_count,
        followsCount: profile.follows_count,
        mediaCount: profile.media_count,
        profilePicture: profile.profile_picture_url || "",
        biography: profile.biography || "",
      },
      summary: {
        totalLikes,
        totalComments,
        totalEngagement,
        avgEngagement,
        postsAnalyzed: posts.length,
      },
      posts,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch Instagram data" },
      { status: 500 }
    );
  }
}
