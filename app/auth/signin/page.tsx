import { SignInForm } from "./signin-form";
import { BrandMark } from "@/components/shared/brand-mark";

export default function SignInPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-8 grain">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(204,0,0,0.12), transparent 60%)",
        }}
      />
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandMark size="lg" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-400">
            We&apos;ll email you a magic link.
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
