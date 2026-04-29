import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, slug, primary_contact_email, projects(count)")
    .order("name");

  return (
    <div className="px-8 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {clients?.length ?? 0} active
        </p>
      </header>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-zinc-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Primary contact</th>
              <th className="px-4 py-3 font-medium text-right">Projects</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {(clients ?? []).map((c) => {
              const projectCount = (c.projects as Array<{ count: number }>)[0]?.count ?? 0;
              return (
                <tr key={c.id} className="bg-zinc-950 hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-zinc-300">{c.primary_contact_email ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-300 text-right">{projectCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/portal/${c.slug}`}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      View portal →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
