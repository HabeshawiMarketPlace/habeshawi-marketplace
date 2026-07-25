"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setErrorMessage(profileError.message);
        return;
      }

      setProfile(profileData);
    } catch {
      setErrorMessage("Unable to load your account.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAccount();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAccount]);

  async function handleLogout() {
    setLoading(true);

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <p className="text-lg font-medium text-gray-700">
          Loading your account...
        </p>
      </main>
    );
  }

  const displayName =
    profile?.full_name?.trim() || email.split("@")[0] || "Habeshawi User";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                Habeshawi Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                Welcome, {displayName}
              </h1>

              <p className="mt-2 text-gray-600">{email}</p>

              {profile?.phone ? (
                <p className="mt-1 text-gray-600">{profile.phone}</p>
              ) : null}

              <p className="mt-3 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-800">
                {profile?.role ?? "user"} account
              </p>
            </div>

            <Link
              href="/account/profile"
              className="rounded-lg border border-green-700 px-5 py-3 text-center font-semibold text-green-700 transition hover:bg-green-50"
            >
              Edit Profile
            </Link>
          </div>
        </section>

        {errorMessage ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {!profile && !errorMessage ? (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            Your profile record was not found. Create a new account after the
            profile SQL trigger was installed, or add the missing profile
            manually in Supabase.
          </div>
        ) : null}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
<Link
  href="/my-listings"
  className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
>
  <h2 className="text-xl font-bold text-gray-900">My Listings</h2>

  <p className="mt-2 text-gray-600">
    View, edit and manage your listings.
  </p>
</Link>

          <Link
            href="/promotion/dashboard"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">My Promotions</h2>

            <p className="mt-2 text-gray-600">
              Manage your advertisements and promotion packages.
            </p>
          </Link>

          <Link
            href="/favorites"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">Favorites</h2>

            <p className="mt-2 text-gray-600">
              View listings that you have saved.
            </p>
          </Link>

          <div className="cursor-not-allowed rounded-2xl bg-white p-6 opacity-70 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                Coming Soon
              </span>
            </div>

            <p className="mt-2 text-gray-600">
              Messaging between buyers, sellers and businesses will be
              available soon.
            </p>
          </div>

          <Link
            href="/post-ad"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">Post a Listing</h2>

            <p className="mt-2 text-gray-600">
              Create a new marketplace or rental listing.
            </p>
          </Link>

          <Link
            href="/account/profile"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Profile Settings
            </h2>

            <p className="mt-2 text-gray-600">
              Update your name, phone number and account information.
            </p>
          </Link>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-10 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}