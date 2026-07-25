"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Advertisement = {
  id: string;
  title: string;
  business_name: string;
  package: string;
  status: string;
  payment_status: string;
  price: number;
  image_url: string | null;
  created_at: string;
  clicks: number;
  impressions: number;
};

function badgeColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "expired":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function MyAdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAds = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        setAds([]);
        setMessage("You must sign in to view your advertisements.");
        return;
      }

      const { data, error } = await supabase
        .from("advertisements")
        .select(
          `
            id,
            title,
            business_name,
            package,
            status,
            payment_status,
            price,
            image_url,
            created_at,
            clicks,
            impressions
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setAds((data ?? []) as Advertisement[]);
      setMessage("");
    } catch (error) {
      setAds([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your advertisements."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAds();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAds]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

          <p className="mt-5 font-bold text-slate-700">
            Loading advertisements...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <section className="bg-[#064d2b] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-black sm:text-5xl">
              My Advertisements
            </h1>

            <p className="mt-4 text-green-100">
              Manage your promotions and payments.
            </p>
          </div>

          <Link
            href="/promotion/post"
            className="w-fit rounded-xl bg-yellow-400 px-6 py-3 font-black text-black transition hover:bg-yellow-300"
          >
            New Advertisement
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {message ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">
            {message}
          </div>
        ) : null}

        {ads.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <div className="text-7xl">📣</div>

            <h2 className="mt-6 text-3xl font-black">
              No Advertisements Yet
            </h2>

            <p className="mt-3 text-slate-600">
              Create your first promotion to advertise your business.
            </p>

            <Link
              href="/promotion/post"
              className="mt-8 inline-block rounded-xl bg-[#087531] px-7 py-4 font-black text-white transition hover:bg-[#064d2b]"
            >
              Create Advertisement
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {ads.map((ad) => (
              <article
                key={ad.id}
                className="flex flex-col gap-6 rounded-3xl border bg-white p-6 shadow lg:flex-row"
              >
                <div className="w-full lg:w-72">
                  {ad.image_url ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={ad.image_url}
                        alt={ad.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 288px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl bg-slate-200 text-5xl">
                      🖼️
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black">{ad.title}</h2>

                      <p className="mt-1 text-slate-600">
                        {ad.business_name}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-sm font-black ${badgeColor(
                        ad.status
                      )}`}
                    >
                      {ad.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-6 md:grid-cols-4">
                    <Info title="Package" value={ad.package} />

                    <Info
                      title="Price"
                      value={`$${Number(ad.price).toFixed(2)}`}
                    />

                    <Info title="Clicks" value={String(ad.clicks)} />

                    <Info
                      title="Impressions"
                      value={String(ad.impressions)}
                    />
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      href={`/promotion/my-ads/${ad.id}`}
                      className="rounded-xl bg-[#087531] px-5 py-3 font-black text-white transition hover:bg-[#064d2b]"
                    >
                      View
                    </Link>

                    <Link
                      href={`/promotion/my-ads/${ad.id}/edit`}
                      className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
                    >
                      Edit
                    </Link>

                    {ad.payment_status === "unpaid" ? (
                      <Link
                        href={`/promotion/payment?id=${ad.id}`}
                        className="rounded-xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700"
                      >
                        Pay Now
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}