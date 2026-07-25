"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("user");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadProfile = useCallback(async () => {
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

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const profile = data as Profile | null;

      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setRole(profile.role ?? "user");
      } else {
        setFullName(
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : ""
        );

        setPhone(
          typeof user.user_metadata?.phone === "string"
            ? user.user_metadata.phone
            : ""
        );
      }
    } catch {
      setErrorMessage("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [router]);

useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadProfile();
  }, 0);

  return () => window.clearTimeout(timer);
}, [loadProfile]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setErrorMessage("Your account could not be identified.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName.trim(),
            phone: phone.trim() || null,
            avatar_url: avatarUrl.trim() || null,
            role,
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        setErrorMessage(profileError.message);
        return;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });

      if (authError) {
        setErrorMessage(authError.message);
        return;
      }

      setSuccessMessage("Your profile was updated successfully.");
    } catch {
      setErrorMessage("Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <p className="text-lg font-medium text-gray-700">
          Loading your profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/account"
            className="font-semibold text-green-700 hover:underline"
          >
            ← Back to My Account
          </Link>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Account Settings
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Edit Profile
            </h1>

            <p className="mt-2 text-gray-600">
              Update the information displayed on your Habeshawi Marketplace
              account.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600"
              />

              <p className="mt-2 text-xs text-gray-500">
                Email changes will be added later.
              </p>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Phone number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Example: 202-555-1234"
                autoComplete="tel"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="avatarUrl"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Profile picture URL
              </label>

              <input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://example.com/profile-photo.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Image upload will be added in the next step.
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Account type
              </label>

              <input
                id="role"
                type="text"
                value={role}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 capitalize text-gray-600"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <Link
                href="/account"
                className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}