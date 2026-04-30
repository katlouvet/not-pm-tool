import { notFound, redirect } from "next/navigation";
import { requireClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BrandMark } from "@/components/shared/brand-mark";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientSlug: string }>;
}) {
  const { clientSlug } = await params;
  const profile = await requireClient();

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, slug")
    .eq("slug", clientSlug)
    .maybeSingle();

  if (!client) notFound();
  // RLS guarantees this would already be hidden, but double-check explicitly
  if (client.id !== profile.client_id) redirect("/");

  return (
    <div className="min-h-screen bg-canvas text-stone-900">
      <header className="border-b border-stone-200 bg-canvas/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div className="h-4 w-px bg-stone-200" />
            <div className="text-sm text-stone-700">{client.name}</div>
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
