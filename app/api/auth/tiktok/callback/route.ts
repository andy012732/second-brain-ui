import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const REDIRECT_URI = 'https://second-brain-ui-chi.vercel.app/api/auth/tiktok/callback';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `https://second-brain-ui-chi.vercel.app/analytics?tiktok_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      const errMsg = tokenData.error_description || tokenData.error;
      // Return JSON for debugging instead of redirect
      return NextResponse.json({
        error: tokenData.error,
        description: tokenData.error_description,
        full_response: tokenData,
        debug: {
          client_key_used: CLIENT_KEY.slice(0,6) + '...',
          redirect_uri_used: REDIRECT_URI,
        }
      }, { status: 400 });
    }

    const tokenStore = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      open_id: tokenData.open_id,
      expires_at: Date.now() + (tokenData.expires_in || 86400) * 1000,
      refresh_expires_at: Date.now() + (tokenData.refresh_expires_in || 31536000) * 1000,
      scope: tokenData.scope,
      updated_at: new Date().toISOString(),
    };

    await fs.writeFile('/tmp/tiktok-token.json', JSON.stringify(tokenStore, null, 2));

    return NextResponse.redirect(
      `https://second-brain-ui-chi.vercel.app/analytics?tiktok_auth=success`
    );
  } catch (err: any) {
    console.error('TikTok OAuth error:', err);
    return NextResponse.redirect(
      `https://second-brain-ui-chi.vercel.app/analytics?tiktok_error=${encodeURIComponent(err.message)}`
    );
  }
}
