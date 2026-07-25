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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <>
      <div className="bg-[#064d2b] px-4 py-1 text-xs text-white sm:px-6 sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-5">
            <span>☎ 240-391-8621</span>

            <span className="hidden sm:inline">
              ✉ habeshawi2023@gmail.com
            </span>
          </div>

          <div className="hidden items-center gap-1 sm:flex">
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

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex h-[72px] w-[210px] shrink-0 items-center overflow-hidden sm:w-[250px]"
            onClick={closeMobileMenu}
          >
            <Image
              src="/logo/Habeshawi -logo.png"
              alt="Habeshawi Marketplace"
              width={580}
              height={220}
              priority
              className="h-[76px] w-auto object-contain sm:h-[88px]"
            />
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex xl:gap-6 xl:text-base">
            <Link href="/housing" className="whitespace-nowrap transition hover:text-[#087531]">
              🏠 Rentals
            </Link>

            <Link href="/marketplace" className="whitespace-nowrap transition hover:text-[#087531]">
              🛒 Marketplace
            </Link>

            <Link href="/jobs" className="whitespace-nowrap transition hover:text-[#087531]">
              💼 Jobs
            </Link>

            <Link href="/businesses" className="whitespace-nowrap transition hover:text-[#087531]">
              🏪 Businesses
            </Link>

            <Link href="/services" className="whitespace-nowrap transition hover:text-[#087531]">
              🤝 Services
            </Link>

            <Link href="/favorites" className="whitespace-nowrap transition hover:text-[#087531]">
              ❤️ Favorites ({favoriteCount})
            </Link>

            <Link
              href="/post-ad"
              className="whitespace-nowrap rounded-lg bg-[#087531] px-4 py-2 font-bold text-white transition hover:bg-[#064d2b]"
            >
              📢 Post an Ad
            </Link>
          </nav>

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
          ) : (
            <Link
              href="/login"
              className="hidden rounded-lg border border-[#087531] px-4 py-2 text-sm font-bold text-[#087531] transition hover:bg-green-50 xl:inline-flex"
            >
              👤 Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label="Open mobile menu"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl text-slate-800 shadow-sm transition hover:bg-slate-50 lg:hidden"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        <div className="border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold sm:gap-2 sm:text-sm">
            <Link
              href="/housing"
              onClick={closeMobileMenu}
              className="rounded-xl bg-green-50 px-2 py-3 text-[#087531]"
            >
              <span className="block text-lg">🏠</span>
              Rentals
            </Link>

            <Link
              href="/marketplace"
              onClick={closeMobileMenu}
              className="rounded-xl bg-slate-100 px-2 py-3"
            >
              <span className="block text-lg">🛒</span>
              Marketplace
            </Link>

            <Link
              href="/jobs"
              onClick={closeMobileMenu}
              className="rounded-xl bg-slate-100 px-2 py-3"
            >
              <span className="block text-lg">💼</span>
              Jobs
            </Link>

            <Link
              href="/post-ad"
              onClick={closeMobileMenu}
              className="rounded-xl bg-[#087531] px-1 py-3 text-white"
            >
              <span className="block text-base sm:text-lg">📢</span>
              Post Ad
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-xl bg-yellow-400 px-1 py-3 text-slate-950"
            >
              <span className="block text-lg">☰</span>
              More
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-2">
              <Link
                href="/businesses"
                onClick={closeMobileMenu}
                className="rounded-xl bg-slate-50 px-4 py-3 font-semibold transition hover:bg-slate-100"
              >
                🏪 Businesses
              </Link>

              <Link
                href="/services"
                onClick={closeMobileMenu}
                className="rounded-xl bg-slate-50 px-4 py-3 font-semibold transition hover:bg-slate-100"
              >
                🤝 Services
              </Link>

              <Link
                href="/favorites"
                onClick={closeMobileMenu}
                className="rounded-xl bg-slate-50 px-4 py-3 font-semibold transition hover:bg-slate-100"
              >
                ❤️ Favorites ({favoriteCount})
              </Link>

              {user ? (
                <>
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className="rounded-xl border border-[#087531] px-4 py-3 font-bold text-[#087531]"
                  >
                    Admin
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-red-600 px-4 py-3 text-left font-bold text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-800"
                >
                  👤 Sign In
                </Link>
              )}

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`rounded-xl px-4 py-3 font-bold ${
                    language === "en"
                      ? "bg-yellow-400 text-black"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage("am")}
                  className={`rounded-xl px-4 py-3 font-bold ${
                    language === "am"
                      ? "bg-yellow-400 text-black"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  አማርኛ
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}