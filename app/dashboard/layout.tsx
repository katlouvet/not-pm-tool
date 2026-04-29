import Link from "next/link";
import { requireTeam } from "@/lib/auth";
import { LayoutGrid, Users, Calendar, MessagesSquare, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireTeam();

  const navItems = [
    { href: "/dashboard", label: "Projects", icon: LayoutGrid },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/meetings", label: "Meetings", icon: MessagesSquare },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      <aside className="w-60 border-r border-zinc-800 bg-zinc-950 flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-800">
          <div className="text-sm tracking-[0.3em] text-zinc-400">NOT.</div>
          <div className="text-xs text-zinc-500 mt-1">PM Tool</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-zinc-800 px-3 py-3 text-sm">
          <div className="px-3 py-2 text-xs text-zinc-500 truncate">
            {profile.email}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
