import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/shared/brand-mark";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 grain">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(204,0,0,0.15), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px z-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(204,0,0,0.5), transparent)",
        }}
      />

      <header className="relative z-10 px-8 py-6 flex items-center justify-between">
        <BrandMark size="md" />
        <Link
          href="/auth/signin"
          className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-32 pb-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
            <span className="h-px w-8 bg-zinc-700" />
            Project Management · Internal
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            The old way of <br />
            project management <br />
            <span className="italic text-zinc-400">is dead.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            One source of truth for every NOT. project. Internal dashboard for
            the team. Real-time portal for clients. Meetings extracted by AI,
            reviewed by humans.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/auth/signin"
              className="group inline-flex items-center gap-2 rounded-md bg-brand hover:bg-[#e60000] transition-colors px-5 py-3 text-sm font-medium text-white"
            >
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="text-xs text-zinc-500">Magic link · no passwords</span>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { k: "01", title: "Internal dashboard", desc: "Every client, every project, every task — one view." },
            { k: "02", title: "Auto-filled from meetings", desc: "Transcript in. Tasks, decisions, blockers out. PM reviews." },
            { k: "03", title: "Client portal", desc: "Real-time visibility. CFO checks status without an email." },
            { k: "04", title: "Monday email", desc: "Auto-generated weekly report. Sent before they ask." },
          ].map((f) => (
            <div key={f.k} className="space-y-3">
              <div className="text-xs font-mono text-brand">{f.k}</div>
              <div className="text-sm font-medium text-zinc-100">{f.title}</div>
              <div className="text-sm text-zinc-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between text-xs text-zinc-600">
          <span>© NOT. — internal tool</span>
          <span className="font-mono">v0.1 demo</span>
        </div>
      </footer>
    </main>
  );
}
