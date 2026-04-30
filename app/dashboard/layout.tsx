import Link from "next/link";
import { requireTeam } from "@/lib/auth";
import { LayoutGrid, Users, Calendar, MessagesSquare, LogOut } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";

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
    <div className="min-h-screen flex bg-canvas text-stone-900">
      <aside className="w-60 border-r border-stone-200 bg-canvas flex flex-col">
        <div className="px-6 py-5 border-b border-stone-200">
          <BrandMark size="md" suffix="PM" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-700 hover:bg-white hover:text-stone-900 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-stone-200 px-3 py-3 text-sm">
          <div className="px-3 py-2 text-xs text-stone-500 truncate">
            {profile.email}
          </div>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-stone-600 hover:bg-white hover:text-stone-900 transition-colors"
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
