import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-canvas text-stone-900 flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(31,72,66,0.08), transparent 65%)",
        }}
      />

      <header className="relative z-10 px-8 py-6 flex items-center justify-end">
        <Link
          href="/auth/signin"
          className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <section className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="text-center space-y-12">
          <div className="select-none flex items-baseline justify-center leading-none">
            <span className="italic font-bold tracking-tighter text-stone-900 text-[clamp(7rem,22vw,20rem)]">
              not
            </span>
            <span className="italic font-bold tracking-tighter text-brand text-[clamp(7rem,22vw,20rem)]">
              .
            </span>
          </div>

          <Link
            href="/auth/signin"
            className="group inline-flex items-center gap-2 rounded-md bg-accent-deep hover:bg-accent-deeper transition-colors px-6 py-3 text-sm font-medium text-white shadow-sm"
          >
            Enter
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-stone-200">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between text-xs text-stone-400">
          <span>© NOT. — internal tool</span>
          <span className="font-mono">v0.1 demo</span>
        </div>
      </footer>
    </main>
  );
}
