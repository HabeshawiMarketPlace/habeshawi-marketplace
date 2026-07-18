"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [user, setUser] = useState<User | null>(null);

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

async function handleLogout() {
  await supabase.auth.signOut();
  setUser(null);
}
  return (
    <>
      <div className="bg-[#064d2b] px-6 py-2 text-sm text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2">
          <div className="flex gap-6">
            <span>☎ 240 3918621</span>
            <span>✉ habeshawi2023@gmail.com</span>
          </div>

<div className="flex items-center gap-3">
  <button
    onClick={() => setLanguage("en")}
    className={`rounded px-3 py-1 font-semibold ${
      language === "en"
        ? "bg-yellow-400 text-black"
        : "text-white hover:bg-white/10"
    }`}
  >
    English
  </button>

  <button
    onClick={() => setLanguage("am")}
    className={`rounded px-3 py-1 font-semibold ${
      language === "am"
        ? "bg-yellow-400 text-black"
        : "text-white hover:bg-white/10"
    }`}
  >
    አማርኛ
  </button>

  <span className="ml-2">ሐበሻዊ ONLINE</span>
</div>
        </div>
      </div>

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-6 py-8">
<div className="flex items-center">
  <Image
    src="/logo/habeshawi-logo.png"
    alt="Habeshawi Marketplace"
    width={600}
    height={180}
    priority
    className="h-auto w-auto max-h-44"
  />
</div>

          <nav className="flex flex-wrap items-center gap-6 font-semibold">
            <a className="text-[#087531]" href="#">
              Home
            </a>
            <a
  href="/marketplace"
  className="hover:text-[#087531]"
>
  Marketplace
</a>
            <a href="/jobs" className="hover:text-[#087531]">
  Jobs
</a>
            <a href="/housing" className="hover:text-[#087531]">
  Housing
</a>
            <a href="/services" className="hover:text-[#087531]">
  Services
</a>
            <a href="/businesses" className="hover:text-[#087531]">
  Businesses
</a>
<a
  href="/post-ad"
  className="rounded-lg bg-[#0a7a3e] px-4 py-2 text-white hover:bg-[#086532]"
>
  Post Ad
</a>
          </nav>

          <div className="flex gap-3">
{user ? (
  <div className="flex items-center gap-3">
    <span className="text-sm font-semibold">
      {user.email}
    </span>

    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-red-600 px-5 py-3 font-bold text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  </div>
) : (
  <Link
    href="/login"
    className="rounded-lg border border-[#087531] px-5 py-3 font-bold text-[#087531] hover:bg-green-50"
  >
    Login
  </Link>
)}


            <button className="rounded-lg bg-yellow-400 px-5 py-3 font-bold">
              Register
            </button>

            <button className="rounded-lg bg-[#087531] px-5 py-3 font-bold text-white">
              Post an Ad +
            </button>
          </div>
        </div>
      </header>
    </>
  );
}