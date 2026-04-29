import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="text-sm tracking-[0.3em] text-zinc-500">NOT.</div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-zinc-400">
            We&apos;ll email you a magic link to sign in.
          </p>
        </div>
        <SignInForm />
      </div>
    </main>
  );
}
