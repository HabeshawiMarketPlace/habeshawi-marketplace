"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        throw signInError;
      }

      const user = signInData.user;

      if (!user) {
        throw new Error("Unable to load the signed-in account.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const requestedRedirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;

      let destination = "/account";

      if (profile?.role === "admin") {
        // Admins go directly to the unified moderation dashboard.
        destination =
          requestedRedirect &&
          requestedRedirect.startsWith("/") &&
          requestedRedirect !== "/account"
            ? requestedRedirect
            : "/admin";
      } else if (
        requestedRedirect &&
        requestedRedirect.startsWith("/") &&
        !requestedRedirect.startsWith("//") &&
        !requestedRedirect.startsWith("/admin")
      ) {
        // Regular users may return to the page that requested sign-in,
        // but they can never be redirected into an admin route.
        destination = requestedRedirect;
      }

      router.replace(destination);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#087531]">
          Habeshawi Marketplace
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#064d2b]">
          Sign In
        </h1>

        <p className="mt-3 text-slate-600">
          Access your listings, promotions, profile, or administrator dashboard.
        </p>

        {message ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {message}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#087531] px-5 py-3 font-black text-white transition hover:bg-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-slate-600">
            Do not have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-[#087531] hover:underline"
            >
              Create Account
            </Link>
          </p>

          <p>
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-[#087531] hover:underline"
            >
              Forgot Password?
            </Link>
          </p>

          <p>
            <Link
              href="/"
              className="text-sm font-semibold text-slate-500 hover:text-[#087531]"
            >
              Return to Homepage
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}