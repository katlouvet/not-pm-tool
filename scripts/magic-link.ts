/**
 * Generate a magic link without sending email.
 * Bypasses Supabase's free-tier rate limit.
 *
 * Usage:
 *   pnpm magic-link your-email@gmail.com
 *
 * Loads .env.local via Node's --env-file flag (set in the package.json script).
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm magic-link <email>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://not-pm-tool.vercel.app";

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Failed to generate link:", error.message);
    process.exit(1);
  }

  const link = data.properties?.action_link;
  if (!link) {
    console.error("No action link returned from Supabase");
    process.exit(1);
  }

  console.log("\n  ✓ Magic link for", email, "\n");
  console.log("  ", link, "\n");
  console.log("  Paste it in your browser (Cmd+Click in many terminals).\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
