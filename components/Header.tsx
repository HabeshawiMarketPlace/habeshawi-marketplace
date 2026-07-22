"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [user, setUser] = useState<User | null>(null);
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

  // Favorites counter
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
      {/* Compact top contact bar */}
      <div className="bg-[#064d2b] px-4 py-1 text-xs text-white sm:px-6 sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-5">
            <span>☎ 240-391-8621</span>

            <span className="hidden sm:inline">
              ✉ habeshawi2023@gmail.com
            </span>
          </div>

          <div className="flex items-center gap-1">
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

      {/* Compact main navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex h-[72px] w-[250px] shrink-0 items-center overflow-hidden"
          >
            <Image
              src="/logo/Habeshawi -logo.png"
              alt="Habeshawi Marketplace"
              width={580}
              height={220}
              priority
              className="h-[88px] w-auto object-contain"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex xl:gap-6 xl:text-base">
            <Link
              href="/housing"
              className="whitespace-nowrap transition hover:text-[#087531]"
            >
              🏠 Rentals
            </Link>

            <Link
              href="/marketplace"
              className="whitespace-nowrap transition hover:text-[#087531]"
            >
              🛒 Marketplace
            </Link>

            <Link
              href="/jobs"
              className="whitespace-nowrap transition hover:text-[#087531]"
            >
              💼 Jobs
            </Link>

            <Link
              href="/businesses"
              className="whitespace-nowrap transition hover:text-[#087531]"
            >
              🏪 Businesses
            </Link>

            <Link
              href="/services"
              className="whitespace-nowrap transition hover:text-[#087531]"
            >
              🤝 Services
            </Link>

            <Link
              href="/favorites"
              className="whitespace-nowrap transition hover:text-[#087531]"
            >
              ❤️ Favorites ({favoriteCount})
            </Link>

            <Link
              href="/post-ad"
              className="whitespace-nowrap rounded-lg bg-[#087531] px-4 py-2 font-bold text-white transition hover:bg-[#064d2b]"
            >
              📢 Post an Ad
            </Link>
          </nav>

          {/* Signed-in user actions */}
          {user ? (
            <div className="hidden items-center gap-2 xl:flex">
              <Link
                href="/admin"
                className="rounded-lg border border-[#087531] px-3 py-2 text-sm font-bold text-[#087531] transition hover:bg-green-50"
              >
                Admin
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-600 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>

        {/* Mobile navigation */}
        <div className="border-t px-4 py-2 lg:hidden">
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap text-sm font-semibold">
            <Link
              href="/housing"
              className="rounded-full bg-green-50 px-4 py-2 text-[#087531]"
            >
              🏠 Rentals
            </Link>

            <Link
              href="/marketplace"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              🛒 Marketplace
            </Link>

            <Link
              href="/jobs"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              💼 Jobs
            </Link>

            <Link
              href="/businesses"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              🏪 Businesses
            </Link>

            <Link
              href="/services"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              🤝 Services
            </Link>

            <Link
              href="/favorites"
              className="rounded-full bg-slate-100 px-4 py-2"
            >
              ❤️ Favorites ({favoriteCount})
            </Link>

            <Link
              href="/post-ad"
              className="rounded-full bg-[#087531] px-4 py-2 text-white"
            >
              📢 Post an Ad
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}