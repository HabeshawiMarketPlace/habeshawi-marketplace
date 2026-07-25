"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Advertisement = {
  id: string;
  business_name: string;
  title: string;
  package: string;
  status: string;
  payment_status: string;
  clicks: number;
  impressions: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
};

type UserProfile = {
  id: string;
  email?: string;
};

export default function PromotionAnalyticsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!currentUser) {
        setUser(null);
        setAdvertisements([]);
        return;
      }

      setUser({
        id: currentUser.id,
        email: currentUser.email,
      });

      const { data, error } = await supabase
        .from("advertisements")
        .select(
          `
            id,
            business_name,
            title,
            package,
            status,
            payment_status,
            clicks,
            impressions,
            start_date,
            end_date,
            created_at
          `
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setAdvertisements((data ?? []) as Advertisement[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load promotion analytics.";

      setMessage(errorMessage);
      setAdvertisements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const totals = useMemo(() => {
    const totalImpressions = advertisements.reduce(
      (sum, advertisement) =>
        sum + Number(advertisement.impressions || 0),
      0
    );

    const totalClicks = advertisements.reduce(
      (sum, advertisement) => sum + Number(advertisement.clicks || 0),
      0
    );

    const clickRate =
      totalImpressions > 0
        ? (totalClicks / totalImpressions) * 100
        : 0;

    return {
      totalAds: advertisements.length,
      activeAds: advertisements.filter(
        (advertisement) => advertisement.status === "active"
      ).length,
      totalImpressions,
      totalClicks,
      clickRate,
    };
  }, [advertisements]);

  function formatDate(value: string | null) {
    if (!value) {
      return "Not set";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  }

  function getClickRate(clicks: number, impressions: number) {
    if (!impressions) {
      return "0.00%";
    }

    return `${((clicks / impressions) * 100).toFixed(2)}%`;
  }

  function statusStyle(status: string) {
    const styles: Record<string, string> = {
      draft: "bg-slate-100 text-slate-700",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      rejected: "bg-red-200 text-red-900",
    };

    return styles[status] || "bg-slate-100 text-slate-700";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

          <p className="mt-5 font-bold text-slate-700">
            Loading promotion analytics...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-6xl">📊</div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            Sign In Required
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            You must sign in to view your advertisement analytics.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
            >
              Sign In
            </Link>

            <Link
              href="/promotion"
              className="rounded-xl border border-slate-300 px-6 py-3 font-black text-slate-700 transition hover:bg-slate-50"
            >
              Return to Promotion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-[#064d2b] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <Link
              href="/promotion/my-ads"
              className="font-bold text-yellow-400 hover:text-yellow-300"
            >
              ← My Advertisements
            </Link>

            <h1 className="mt-5 text-4xl font-black sm:text-5xl">
              Promotion Analytics
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-green-100">
              Track advertisement views, contact clicks, publishing status,
              and campaign performance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAnalytics()}
            disabled={loading}
            className="w-fit rounded-xl border border-white px-6 py-3 font-black text-white transition hover:bg-white hover:text-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh Analytics
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {message && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            label="Total Ads"
            value={totals.totalAds}
            icon="📣"
          />

          <SummaryCard
            label="Active Ads"
            value={totals.activeAds}
            icon="✅"
          />

          <SummaryCard
            label="Impressions"
            value={totals.totalImpressions}
            icon="👁️"
          />

          <SummaryCard
            label="Contact Clicks"
            value={totals.totalClicks}
            icon="👆"
          />

          <SummaryCard
            label="Click Rate"
            value={`${totals.clickRate.toFixed(2)}%`}
            icon="📈"
          />
        </div>

        {advertisements.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-6xl">📭</div>

            <h2 className="mt-5 text-3xl font-black text-slate-900">
              No Advertisements Yet
            </h2>

            <p className="mt-4 text-slate-600">
              Create your first promotion to begin tracking performance.
            </p>

            <Link
              href="/promotion/post"
              className="mt-7 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
            >
              Create Advertisement
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-6 sm:p-8">
                <h2 className="text-3xl font-black text-slate-900">
                  Advertisement Performance
                </h2>

                <p className="mt-2 text-slate-600">
                  Compare views and customer contact activity for each
                  advertisement.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-5 text-left text-sm font-black uppercase tracking-wider text-slate-500">
                        Advertisement
                      </th>

                      <th className="p-5 text-left text-sm font-black uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="p-5 text-left text-sm font-black uppercase tracking-wider text-slate-500">
                        Impressions
                      </th>

                      <th className="p-5 text-left text-sm font-black uppercase tracking-wider text-slate-500">
                        Clicks
                      </th>

                      <th className="p-5 text-left text-sm font-black uppercase tracking-wider text-slate-500">
                        Click Rate
                      </th>

                      <th className="p-5 text-left text-sm font-black uppercase tracking-wider text-slate-500">
                        Schedule
                      </th>

                      <th className="p-5 text-left text-sm font-black uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {advertisements.map((advertisement) => (
                      <tr
                        key={advertisement.id}
                        className="border-t border-slate-100"
                      >
                        <td className="p-5">
                          <p className="font-black text-slate-900">
                            {advertisement.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {advertisement.business_name}
                          </p>

                          <p className="mt-1 text-xs font-bold uppercase text-[#087531]">
                            {advertisement.package} package
                          </p>
                        </td>

                        <td className="p-5">
                          <span
                            className={`rounded-full px-3 py-2 text-xs font-black uppercase ${statusStyle(
                              advertisement.status
                            )}`}
                          >
                            {advertisement.status}
                          </span>
                        </td>

                        <td className="p-5 text-lg font-black text-slate-900">
                          {Number(advertisement.impressions || 0)}
                        </td>

                        <td className="p-5 text-lg font-black text-slate-900">
                          {Number(advertisement.clicks || 0)}
                        </td>

                        <td className="p-5 font-black text-[#087531]">
                          {getClickRate(
                            Number(advertisement.clicks || 0),
                            Number(advertisement.impressions || 0)
                          )}
                        </td>

                        <td className="p-5 text-sm text-slate-600">
                          <p>
                            Start:{" "}
                            <span className="font-bold">
                              {formatDate(advertisement.start_date)}
                            </span>
                          </p>

                          <p className="mt-1">
                            End:{" "}
                            <span className="font-bold">
                              {formatDate(advertisement.end_date)}
                            </span>
                          </p>
                        </td>

                        <td className="p-5">
                          <Link
                            href={`/promotion/my-ads/${advertisement.id}`}
                            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 font-black text-white transition hover:bg-[#087531]"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                <h2 className="text-3xl font-black text-slate-900">
                  Best Performing Advertisement
                </h2>

                <BestAdvertisement advertisements={advertisements} />
              </section>

              <section className="rounded-3xl bg-slate-900 p-7 text-white shadow-lg sm:p-9">
                <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                  Performance Tip
                </span>

                <h2 className="mt-5 text-3xl font-black">
                  Improve Customer Engagement
                </h2>

                <p className="mt-4 leading-8 text-slate-300">
                  Use a clear image, a short promotional title, accurate
                  contact information, and a strong call to action. Higher
                  visibility packages may also help more customers discover
                  your business.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/promotion/post"
                    className="rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#0b8f3d]"
                  >
                    Create New Ad
                  </Link>

                  <Link
                    href="/promotion/pricing"
                    className="rounded-xl border border-white px-6 py-3 font-black text-white transition hover:bg-white hover:text-slate-900"
                  >
                    View Packages
                  </Link>
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <span className="text-3xl">{icon}</span>
      </div>

      <p className="mt-5 text-4xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function BestAdvertisement({
  advertisements,
}: {
  advertisements: Advertisement[];
}) {
  const bestAdvertisement = [...advertisements].sort((first, second) => {
    const firstScore =
      Number(first.impressions || 0) + Number(first.clicks || 0) * 5;

    const secondScore =
      Number(second.impressions || 0) + Number(second.clicks || 0) * 5;

    return secondScore - firstScore;
  })[0];

  if (!bestAdvertisement) {
    return (
      <p className="mt-5 text-slate-600">
        Performance information is not available yet.
      </p>
    );
  }

  const clickRate =
    bestAdvertisement.impressions > 0
      ? (
          (bestAdvertisement.clicks /
            bestAdvertisement.impressions) *
          100
        ).toFixed(2)
      : "0.00";

  return (
    <div className="mt-7 rounded-2xl bg-slate-50 p-6">
      <span className="inline-flex rounded-full bg-green-100 px-3 py-2 text-xs font-black uppercase text-green-800">
        Top Performance
      </span>

      <h3 className="mt-4 text-2xl font-black text-slate-900">
        {bestAdvertisement.title}
      </h3>

      <p className="mt-2 font-bold text-slate-600">
        {bestAdvertisement.business_name}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <MiniStat label="Views" value={bestAdvertisement.impressions} />

        <MiniStat label="Clicks" value={bestAdvertisement.clicks} />

        <MiniStat label="Rate" value={`${clickRate}%`} />
      </div>

      <Link
        href={`/promotion/my-ads/${bestAdvertisement.id}`}
        className="mt-6 inline-flex font-black text-[#087531]"
      >
        Open advertisement details →
      </Link>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}