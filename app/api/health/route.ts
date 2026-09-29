import { NextResponse } from "next/server";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const siteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

  return NextResponse.json(
    {
      service: "rita-ai",
      status: "ok",
      auth: {
        supabaseConfigured,
        siteUrlConfigured,
      },
      note: supabaseConfigured
        ? "Authentication backend configuration is present."
        : "Supabase authentication environment variables are not configured.",
      timestamp: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
