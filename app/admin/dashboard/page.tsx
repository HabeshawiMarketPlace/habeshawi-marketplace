"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DashboardCounts = {
  pending: number;
  active: number;
  expired: number;
  total: number;
  unpaid: number;
  paymentPending: number;
  paid: number;
  rejected: number;
};

type AdvertisementSummary = {
  status: string | null;
  payment_status: string | null;
};

const initialCounts: DashboardCounts = {
  pending: 0,
  active: 0,
  expired: 0,
  total: 0,
  unpaid: 0,
  paymentPending: 0,
  paid: 0,
  rejected: 0,
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>(initialCounts);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboardCounts = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("status, payment_status");

      if (error) {
        throw new Error(error.message);
      }

      const advertisements =
        (data as AdvertisementSummary[] | null) ?? [];

      setCounts({
        pending: advertisements.filter(
          (advertisement) => advertisement.status === "pending"
        ).length,

        active: advertisements.filter(
          (advertisement) => advertisement.status === "active"
        ).length,

        expired: advertisements.filter(
          (advertisement) => advertisement.status === "expired"
        ).length,

        total: advertisements.length,

        unpaid: advertisements.filter(
          (advertisement) => advertisement.payment_status === "unpaid"
        ).length,

        paymentPending: advertisements.filter(
          (advertisement) => advertisement.payment_status === "pending"
        ).length,

        paid: advertisements.filter(
          (advertisement) => advertisement.payment_status === "paid"
        ).length,

        rejected: advertisements.filter(
          (advertisement) => advertisement.status === "rejected"
        ).length,
      });
    } catch (error) {
      setCounts(initialCounts);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load dashboard information.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadDashboardCounts();
  }, 0);

  return () => window.clearTimeout(timer);
}, [loadDashboardCounts]);

  const dashboardCards = [
    {
      title: "Pending Approval",
      value: counts.pending,
      description: "Advertisements waiting for review",
      color: "bg-yellow-100 text-yellow-800",
      href: "/admin/advertisements?status=pending",
      icon: "⏳",
    },
    {
      title: "Active Advertisements",
      value: counts.active,
      description: "Advertisements currently published",
      color: "bg-green-100 text-green-800",
      href: "/admin/advertisements?status=active",
      icon: "✅",
    },
    {
      title: "Expired Advertisements",
      value: counts.expired,
      description: "Promotions that have ended",
      color: "bg-red-100 text-red-800",
      href: "/admin/advertisements?status=expired",
      icon: "⌛",
    },
    {
      title: "Total Advertisements",
      value: counts.total,
      description: "All promotion records",
      color: "bg-blue-100 text-blue-800",
      href: "/admin/advertisements",
      icon: "📣",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-[#064d2b] px-6 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex rounded-full bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black">
              Administrator Area
            </span>

            <h1 className="mt-5 text-4xl font-black sm:text-5xl">
              Promotion Admin Dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-green-100">
              Review advertisements, verify payments, activate promotions,
              and monitor advertising activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/advertisements"
              className="rounded-xl bg-white px-6 py-3 font-black text-[#064d2b] transition hover:bg-green-50"
            >
              Manage Advertisements
            </Link>

            <button
              type="button"
              onClick={() => void loadDashboardCounts()}
              disabled={loading}
              className="rounded-xl border border-white px-6 py-3 font-black text-white transition hover:bg-white hover:text-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh Dashboard"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {message && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-5">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-black ${card.color}`}
                >
                  {card.title}
                </span>

                <span className="text-3xl">{card.icon}</span>
              </div>

              <div className="mt-7 text-5xl font-black text-slate-900">
                {loading ? "—" : card.value}
              </div>

              <p className="mt-3 leading-6 text-slate-500">
                {card.description}
              </p>

              <span className="mt-6 inline-flex font-black text-[#087531]">
                View advertisements →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <span className="font-black uppercase tracking-wider text-[#087531]">
                  Payment Overview
                </span>

                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  Advertisement Payments
                </h2>
              </div>

              <Link
                href="/admin/advertisements"
                className="w-fit rounded-xl bg-slate-900 px-5 py-3 font-black text-white"
              >
                Review Payments
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              <PaymentCard
                title="Unpaid"
                value={counts.unpaid}
                description="Payment not submitted"
                icon="💳"
              />

              <PaymentCard
                title="Pending Verification"
                value={counts.paymentPending}
                description="Reference submitted"
                icon="🔍"
              />

              <PaymentCard
                title="Paid"
                value={counts.paid}
                description="Payment confirmed"
                icon="✅"
              />
            </div>
          </section>

          <aside className="rounded-3xl bg-slate-900 p-7 text-white shadow-lg">
            <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
              Administrative Summary
            </span>

            <h2 className="mt-5 text-2xl font-black">
              Promotion Status
            </h2>

            <div className="mt-7 grid gap-5">
              <SummaryRow label="Pending review" value={counts.pending} />
              <SummaryRow label="Active" value={counts.active} />
              <SummaryRow label="Expired" value={counts.expired} />
              <SummaryRow label="Rejected" value={counts.rejected} />
              <SummaryRow label="Total" value={counts.total} />
            </div>

            <Link
              href="/admin/advertisements?status=pending"
              className="mt-8 block rounded-xl bg-[#087531] px-6 py-4 text-center font-black text-white transition hover:bg-[#0b8f3d]"
            >
              Review Pending Advertisements
            </Link>
          </aside>
        </div>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <h2 className="text-3xl font-black text-slate-900">
            Administrator Functions
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Feature
              icon="📝"
              title="Review Advertisements"
              description="Check promotional text, images, business information, and contact details before approval."
            />

            <Feature
              icon="💰"
              title="Verify Payments"
              description="Review transaction references and mark eligible paid advertisements as paid."
            />

            <Feature
              icon="🚀"
              title="Activate Promotions"
              description="Publish approved advertisements and automatically calculate their start and end dates."
            />

            <Feature
              icon="📊"
              title="Monitor Performance"
              description="Review advertisement impressions, contact clicks, publishing dates, and current status."
            />
          </div>
        </section>
      </section>
    </main>
  );
}

function PaymentCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-black text-slate-700">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-4 text-4xl font-black text-slate-900">{value}</p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-700 pb-4 last:border-none last:pb-0">
      <span className="text-slate-300">{label}</span>

      <span className="text-2xl font-black text-yellow-400">
        {value}
      </span>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6">
      <div className="text-4xl">{icon}</div>

      <h3 className="mt-4 text-xl font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}