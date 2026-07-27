"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string | null;
};

type StatusRow = {
  id: string;
  status: string | null;
  created_at: string | null;
};

type RentalRow = StatusRow & {
  title: string | null;
};

type MarketplaceRow = StatusRow & {
  title: string | null;
  featured: boolean | null;
};

type JobRow = StatusRow & {
  title: string | null;
};

type BusinessRow = StatusRow & {
  name: string | null;
  featured: boolean | null;
};

type ServiceRow = StatusRow & {
  service_name: string | null;
};

type PromotionRow = StatusRow & {
  title: string | null;
  business_name: string | null;
  payment_status: string | null;
};

type DashboardCounts = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  featured?: number;
};

type ActivityItem = {
  id: string;
  section: string;
  title: string;
  status: string;
  createdAt: string;
  href: string;
};

const emptyCounts: DashboardCounts = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "pending").trim().toLowerCase();
}

function getCounts<T extends StatusRow>(
  rows: T[],
  featuredCount = 0,
): DashboardCounts {
  return {
    total: rows.length,
    pending: rows.filter(
      (row) => normalizeStatus(row.status) === "pending",
    ).length,
    approved: rows.filter((row) =>
      ["approved", "active"].includes(normalizeStatus(row.status)),
    ).length,
    rejected: rows.filter(
      (row) => normalizeStatus(row.status) === "rejected",
    ).length,
    featured: featuredCount,
  };
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function errorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Unknown error";
}

export default function AccountPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const [rentals, setRentals] = useState<RentalRow[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    setNotice("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/login?redirect=/account");
        return;
      }

      const userEmail = user.email?.trim().toLowerCase() ?? "";
      setEmail(user.email ?? "");

      const profileResult = await supabase
        .from("profiles")
        .select("id,full_name,phone,avatar_url,role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileResult.error) {
        console.error("Profile error:", profileResult.error);
      } else {
        setProfile(profileResult.data as Profile | null);
      }

      let rentalsQuery = supabase
        .from("rentals")
        .select("id,title,status,created_at")
        .order("created_at", { ascending: false });

      if (userEmail) {
        rentalsQuery = rentalsQuery.or(
          `user_id.eq.${user.id},email.ilike.${userEmail}`,
        );
      } else {
        rentalsQuery = rentalsQuery.eq("user_id", user.id);
      }

      const [
        rentalsResult,
        marketplaceResult,
        jobsResult,
        businessesResult,
        servicesResult,
        promotionsResult,
      ] = await Promise.all([
        rentalsQuery,
        supabase
          .from("marketplace_listings")
          .select("id,title,status,featured,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("jobs")
          .select("id,title,status,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("businesses")
          .select("id,name,status,featured,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("services")
          .select("id,service_name,status,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("advertisements")
          .select(
            "id,title,business_name,status,payment_status,created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const problems: string[] = [];

      if (rentalsResult.error) {
        problems.push(`Rentals: ${rentalsResult.error.message}`);
        setRentals([]);
      } else {
        setRentals((rentalsResult.data ?? []) as RentalRow[]);
      }

      if (marketplaceResult.error) {
        problems.push(`Marketplace: ${marketplaceResult.error.message}`);
        setMarketplace([]);
      } else {
        setMarketplace(
          (marketplaceResult.data ?? []) as MarketplaceRow[],
        );
      }

      if (jobsResult.error) {
        problems.push(`Jobs: ${jobsResult.error.message}`);
        setJobs([]);
      } else {
        setJobs((jobsResult.data ?? []) as JobRow[]);
      }

      if (businessesResult.error) {
        problems.push(`Businesses: ${businessesResult.error.message}`);
        setBusinesses([]);
      } else {
        setBusinesses((businessesResult.data ?? []) as BusinessRow[]);
      }

      if (servicesResult.error) {
        problems.push(`Services: ${servicesResult.error.message}`);
        setServices([]);
      } else {
        setServices((servicesResult.data ?? []) as ServiceRow[]);
      }

      if (promotionsResult.error) {
        problems.push(`Promotions: ${promotionsResult.error.message}`);
        setPromotions([]);
      } else {
        setPromotions(
          (promotionsResult.data ?? []) as PromotionRow[],
        );
      }

      if (problems.length > 0) {
        setNotice(
          `Some dashboard sections could not be loaded: ${problems.join(
            " | ",
          )}`,
        );
      }
    } catch (error) {
      console.error("Unable to load account dashboard:", error);
      setErrorMessage(errorText(error));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const stats = useMemo(
    () => ({
      rentals: getCounts(rentals),
      marketplace: getCounts(
        marketplace,
        marketplace.filter((item) => item.featured).length,
      ),
      jobs: getCounts(jobs),
      businesses: getCounts(
        businesses,
        businesses.filter((item) => item.featured).length,
      ),
      services: getCounts(services),
      promotions: getCounts(promotions),
    }),
    [businesses, jobs, marketplace, promotions, rentals, services],
  );

  const overall = useMemo(() => {
    const sections = Object.values(stats);

    return {
      total: sections.reduce((sum, section) => sum + section.total, 0),
      pending: sections.reduce(
        (sum, section) => sum + section.pending,
        0,
      ),
      approved: sections.reduce(
        (sum, section) => sum + section.approved,
        0,
      ),
      rejected: sections.reduce(
        (sum, section) => sum + section.rejected,
        0,
      ),
      featured:
        (stats.marketplace.featured ?? 0) +
        (stats.businesses.featured ?? 0),
    };
  }, [stats]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const rows: ActivityItem[] = [
      ...rentals.map((item) => ({
        id: `rental-${item.id}`,
        section: "Rental",
        title: item.title || "Untitled rental",
        status: normalizeStatus(item.status),
        createdAt: item.created_at || "",
        href:"/housing/my-listings",
      })),
      ...marketplace.map((item) => ({
        id: `marketplace-${item.id}`,
        section: "Marketplace",
        title: item.title || "Untitled marketplace item",
        status: normalizeStatus(item.status),
        createdAt: item.created_at || "",
        href: "/marketplace/my-listings",
      })),
      ...jobs.map((item) => ({
        id: `job-${item.id}`,
        section: "Job",
        title: item.title || "Untitled job",
        status: normalizeStatus(item.status),
        createdAt: item.created_at || "",
        href: "/jobs/my-listings",
      })),
      ...businesses.map((item) => ({
        id: `business-${item.id}`,
        section: "Business",
        title: item.name || "Untitled business",
        status: normalizeStatus(item.status),
        createdAt: item.created_at || "",
        href: "/businesses/my-businesses",
      })),
      ...services.map((item) => ({
        id: `service-${item.id}`,
        section: "Service",
        title: item.service_name || "Untitled service",
        status: normalizeStatus(item.status),
        createdAt: item.created_at || "",
        href: "/services/my-listings",
      })),
      ...promotions.map((item) => ({
        id: `promotion-${item.id}`,
        section: "Promotion",
        title:
          item.title ||
          item.business_name ||
          "Untitled promotion",
        status: normalizeStatus(item.status),
        createdAt: item.created_at || "",
        href: "/promotion/dashboard",
      })),
    ];

    return rows
      .filter((item) => item.createdAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 8);
  }, [businesses, jobs, marketplace, promotions, rentals, services]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-4">
        <div className="rounded-2xl bg-white p-8 font-bold text-[#064d2b] shadow">
          Loading your dashboard...
        </div>
      </main>
    );
  }

  const displayName =
    profile?.full_name?.trim() ||
    email.split("@")[0] ||
    "Habeshawi User";

  const sections = [
    {
      title: "My Rentals",
      icon: "🏠",
      description:
        "Manage rooms, apartments, houses, roommates, and commercial rentals.",
      href: "/housing/my-listings",
      postHref: "/post-ad/rental",
      postLabel: "Post Rental",
      counts: stats.rentals,
    },
    {
      title: "My Marketplace",
      icon: "🛒",
      description:
        "Manage items you are selling in the community marketplace.",
      href: "/marketplace/my-listings",
      postHref: "/marketplace/post",
      postLabel: "Sell an Item",
      counts: stats.marketplace,
    },
    {
      title: "My Jobs",
      icon: "💼",
      description:
        "Manage job opportunities you have posted for the community.",
      href: "/jobs/my-listings",
      postHref: "/jobs/post",
      postLabel: "Post a Job",
      counts: stats.jobs,
    },
    {
      title: "My Businesses",
      icon: "🏢",
      description:
        "Manage your business directory profiles and featured status.",
      href: "/businesses/my-businesses",
      postHref: "/businesses/post",
      postLabel: "Add Business",
      counts: stats.businesses,
    },
    {
      title: "My Services",
      icon: "🛠️",
      description:
        "Manage professional and community services you have submitted.",
      href: "/services/my-listings",
      postHref: "/services/post",
      postLabel: "Post Service",
      counts: stats.services,
    },
    {
      title: "My Promotions",
      icon: "📢",
      description:
        "Manage advertisement packages, payment status, and promotions.",
      href: "/promotion/dashboard",
      postHref: "/promotion/post",
      postLabel: "Create Promotion",
      counts: stats.promotions,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1450px]">
        <header className="rounded-3xl bg-[#064d2b] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
                Habeshawi Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Welcome, {displayName}
              </h1>

              <p className="mt-3 text-green-100">
                Manage everything you have posted from one dashboard.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-white/10 px-3 py-1 font-bold">
                  {email}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 font-bold capitalize">
                  {profile?.role || "user"} account
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {profile?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black hover:bg-yellow-300"
                >
                  Admin Dashboard
                </Link>
              ) : null}

              <Link
                href="/account/profile"
                className="rounded-xl border border-white/40 px-5 py-3 font-black hover:bg-white/10"
              >
                Edit Profile
              </Link>

              <button
                type="button"
                onClick={() => void loadAccount()}
                className="rounded-xl border border-white/40 px-5 py-3 font-black hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-800">
            <p className="font-black">Unable to load your dashboard.</p>
            <p className="mt-2 break-words">{errorMessage}</p>
          </div>
        ) : null}

        {notice ? (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
            {notice}
          </div>
        ) : null}

        <section className="mt-8">
          <div>
            <h2 className="text-3xl font-black text-[#064d2b]">
              My Overview
            </h2>
            <p className="mt-2 text-slate-600">
              Live totals from all of your Habeshawi Marketplace content.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryCard
              title="All Content"
              value={overall.total}
              description="Everything you posted"
            />
            <SummaryCard
              title="Pending"
              value={overall.pending}
              description="Waiting for approval"
            />
            <SummaryCard
              title="Approved"
              value={overall.approved}
              description="Visible or active"
            />
            <SummaryCard
              title="Rejected"
              value={overall.rejected}
              description="Needs attention"
            />
            <SummaryCard
              title="Featured"
              value={overall.featured}
              description="Promoted listings"
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black text-[#064d2b]">
                Manage My Content
              </h2>
              <p className="mt-2 text-slate-600">
                Open a section to view, edit, or delete your posts.
              </p>
            </div>

            <Link
              href="/post-ad"
              className="inline-flex w-fit rounded-xl bg-[#087531] px-6 py-3 font-black text-white hover:bg-[#064d2b]"
            >
              + Post an Ad
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => (
              <article
                key={section.title}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl"
                  >
                    {section.icon}
                  </span>

                  <StatusBadge
                    value={section.counts.pending}
                    label="pending"
                  />
                </div>

                <h3 className="mt-5 text-2xl font-black text-slate-900">
                  {section.title}
                </h3>

                <p className="mt-2 min-h-12 leading-6 text-slate-600">
                  {section.description}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <MiniCount
                    label="Total"
                    value={section.counts.total}
                  />
                  <MiniCount
                    label="Approved"
                    value={section.counts.approved}
                  />
                  <MiniCount
                    label="Rejected"
                    value={section.counts.rejected}
                  />
                </div>

                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                  <Link
                    href={section.href}
                    className="rounded-xl bg-[#087531] px-5 py-3 font-black text-white hover:bg-[#064d2b]"
                  >
                    Manage
                  </Link>

                  <Link
                    href={section.postHref}
                    className="rounded-xl border border-[#087531] px-5 py-3 font-black text-[#087531] hover:bg-green-50"
                  >
                    {section.postLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#064d2b]">
                  Recent Activity
                </h2>
                <p className="mt-1 text-slate-600">
                  Your newest submissions across the platform.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y">
              {recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col justify-between gap-3 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:px-3"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.section} • {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <StatusPill status={item.status} />
                </Link>
              ))}

              {recentActivity.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  You have not posted anything yet.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-[#064d2b]">
              Account Tools
            </h2>

            <div className="mt-6 grid gap-3">
              <ToolLink
                href="/favorites"
                title="Favorites"
                description="Open your saved listings."
              />
              <ToolLink
                href="/account/profile"
                title="Profile Settings"
                description="Update your name and phone number."
              />
              <ToolLink
                href="/post-ad"
                title="Post an Ad"
                description="Choose a category and create a new post."
              />

              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-amber-950">Messages</p>
                  <span className="rounded-full bg-amber-200 px-3 py-1 text-xs font-black text-amber-900">
                    Coming Soon
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Private messaging between members will be added later.
                </p>
              </div>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-10 rounded-xl bg-red-700 px-6 py-3 font-black text-white hover:bg-red-800"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-4xl font-black text-[#064d2b]">
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function MiniCount({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xl font-black text-[#064d2b]">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800">
      {value} {label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const classes =
    status === "approved" || status === "active"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : status === "expired"
          ? "bg-slate-200 text-slate-700"
          : "bg-amber-100 text-amber-800";

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-black capitalize ${classes}`}
    >
      {status}
    </span>
  );
}

function ToolLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#087531] hover:bg-green-50"
    >
      <p className="font-black text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </Link>
  );
}