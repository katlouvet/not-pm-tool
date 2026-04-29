import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 grain flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(204,0,0,0.12), transparent 65%)",
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

      <header className="relative z-10 px-8 py-6 flex items-center justify-end">
        <Link
          href="/auth/signin"
          className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <section className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="text-center space-y-12">
          <div className="select-none flex items-baseline justify-center leading-none">
            <span className="italic font-bold tracking-tighter text-zinc-50 text-[clamp(7rem,22vw,20rem)]">
              not
            </span>
            <span className="italic font-bold tracking-tighter text-brand text-[clamp(7rem,22vw,20rem)]">
              .
            </span>
          </div>

          <Link
            href="/auth/signin"
            className="group inline-flex items-center gap-2 rounded-md bg-brand hover:bg-rose-600 transition-colors px-6 py-3 text-sm font-medium text-white"
          >
            Enter
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
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
