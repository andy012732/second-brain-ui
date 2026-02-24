import { NextResponse } from 'next/server';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const REDIRECT_URI = 'https://second-brain-ui-chi.vercel.app/api/auth/tiktok/callback';
const SCOPES = 'user.info.basic,user.info.profile,user.info.stats,video.list';

export async function GET() {
  const csrfState = Math.random().toString(36).substring(2);
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.set('client_key', CLIENT_KEY);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('state', csrfState);

  return NextResponse.redirect(authUrl.toString());
}
