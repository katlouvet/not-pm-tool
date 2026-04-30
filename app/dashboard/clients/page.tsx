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
        <p className="text-sm text-stone-600 mt-1">
          {clients?.length ?? 0} active
        </p>
      </header>

      <div className="rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-stone-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Primary contact</th>
              <th className="px-4 py-3 font-medium text-right">Projects</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/60">
            {(clients ?? []).map((c) => {
              const projectCount = (c.projects as Array<{ count: number }>)[0]?.count ?? 0;
              return (
                <tr key={c.id} className="bg-canvas hover:bg-white">
                  <td className="px-4 py-3 text-stone-900 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-stone-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-stone-700">{c.primary_contact_email ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-700 text-right">{projectCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/portal/${c.slug}`}
                      className="text-xs text-accent-deep hover:text-accent-deeper"
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
