import { NextResponse } from "next/server";

export async function GET() {
  const ck = process.env.TIKTOK_CLIENT_KEY || "NOT_SET";
  const cs = process.env.TIKTOK_CLIENT_SECRET || "NOT_SET";
  return NextResponse.json({
    clientKey: ck.slice(0, 6) + "..." + ck.slice(-4),
    clientKeyLen: ck.length,
    clientSecret: cs.slice(0, 6) + "..." + cs.slice(-4),
    clientSecretLen: cs.length,
  });
}
