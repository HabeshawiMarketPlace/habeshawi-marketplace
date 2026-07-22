"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [user, setUser] = useState<User | null>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Authentication
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Favorites Counter
  useEffect(() => {
    function updateFavorites() {
      try {
        const favorites: string[] = JSON.parse(
          localStorage.getItem("habeshawi-favorites") ?? "[]"
        );

        setFavoriteCount(favorites.length);
      } catch {
        setFavoriteCount(0);
      }
    }

    updateFavorites();

    window.addEventListener("favorites-updated", updateFavorites);
    window.addEventListener("storage", updateFavorites);

    return () => {
      window.removeEventListener("favorites-updated", updateFavorites);
      window.removeEventListener("storage", updateFavorites);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <>
      {/* Top contact and language bar */}
      <div className="bg-[#064d2b] px-6 py-2 text-sm text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-5">
            <span>☎ 240-391-8621</span>
            <span>✉ habeshawi2023@gmail.com</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                language === "en"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-white/10"
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => setLanguage("am")}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                language === "am"
                  ? "bg-yellow-400 text-black"
                  : "hover:bg-white/10"
              }`}
            >
              አማርኛ
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo/habeshawi-logo.png"
              alt="Habeshawi Rentals"
              width={520}
              height={170}
              priority
              className="h-auto max-h-42 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 font-semibold lg:flex">
            <Link
              href="/housing"
              className="text-[#087531] transition hover:text-[#064d2b]"
            >
              🏠 Rent
            </Link>

            <Link
              href="/post-ad"
              className="transition hover:text-[#087531]"
            >
              ➕ Post Rental
            </Link>

            <Link
              href="/my-listings"
              className="transition hover:text-[#087531]"
            >
              📋 My Listings
            </Link>

            <Link
              href="/favorites"
              className="transition hover:text-[#087531]"
            >
              ❤️ Favorites ({favoriteCount})
            </Link>

            <Link
              href="/pricing"
              className="transition hover:text-[#087531]"
            >
              💳 Pricing
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex items-center gap-1 transition hover:text-[#087531]"
              >
                Services
                <span className="text-xs">▼</span>
              </button>

              {servicesOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl border bg-white py-2 shadow-xl">
                  <Link
                    href="/jobs"
                    className="block px-5 py-3 hover:bg-green-50"
                    onClick={() => setServicesOpen(false)}
                  >
                    💼 Jobs
                  </Link>

                  <Link
                    href="/businesses"
                    className="block px-5 py-3 hover:bg-green-50"
                    onClick={() => setServicesOpen(false)}
                  >
                    🏪 Businesses
                  </Link>

                  <Link
                    href="/marketplace"
                    className="block px-5 py-3 hover:bg-green-50"
                    onClick={() => setServicesOpen(false)}
                  >
                    🛒 Marketplace
                  </Link>

                  <Link
                    href="/services"
                    className="block px-5 py-3 hover:bg-green-50"
                    onClick={() => setServicesOpen(false)}
                  >
                    🧰 Community Services
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="hidden rounded-lg border border-[#087531] px-4 py-2 font-bold text-[#087531] transition hover:bg-green-50 sm:inline-flex"
                >
                  Admin
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-red-600 px-4 py-2 font-bold text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-[#087531] px-4 py-2 font-bold text-[#087531] transition hover:bg-green-50"
              >
                Admin Login
              </Link>
            )}

            <Link
              href="/post-ad"
              className="rounded-lg bg-[#087531] px-4 py-2 font-bold text-white transition hover:bg-[#064d2b]"
            >
              Post Rental
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="border-t px-4 py-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap text-sm font-semibold">
            <Link
              href="/housing"
              className="rounded-full bg-green-50 px-4 py-2 text-[#087531]"
            >
              🏠 Rent
            </Link>

            <Link
              href="/post-ad"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              ➕ Post
            </Link>

            <Link
              href="/my-listings"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              📋 My Listings
            </Link>

            <Link
              href="/favorites"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              ❤️ Favorites ({favoriteCount})
            </Link>

            <Link
              href="/pricing"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              💳 Pricing
            </Link>

            <Link
              href="/jobs"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              💼 Jobs
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}