import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/signin?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Look up the user's role to decide where to land
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/auth/signin?error=no_session`);
  }

  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id, clients:clients!profiles_client_id_fkey(slug)")
    .eq("id", user.id)
    .single();

  if (profile?.role === "client") {
    const slug = (profile.clients as { slug?: string } | null)?.slug;
    if (slug) {
      return NextResponse.redirect(`${origin}/portal/${slug}`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
