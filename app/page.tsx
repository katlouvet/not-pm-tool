import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-xl text-center space-y-6">
        <div className="text-sm tracking-[0.3em] text-zinc-500">NOT.</div>
        <h1 className="text-4xl font-semibold">Project Management Tool</h1>
        <p className="text-zinc-400">
          Internal dashboard for the NOT. team and a portal for clients.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Link href="/auth/signin" className={buttonVariants({ size: "lg" })}>
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
