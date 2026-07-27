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

type QuickAction = {
  title: string;
  description: string;
  icon: string;
  href: string;
  className: string;
};

const emptyCounts: DashboardCounts = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

const quickActions: QuickAction[] = [
  {
    title: "Post Rental",
    description: "List a room, apartment, house, or commercial property.",
    icon: "🏠",
    href: "/post-ad/rental",
    className: "bg-green-50 hover:bg-green-100",
  },
  {
    title: "Sell an Item",
    description: "Post an item for sale in the marketplace.",
    icon: "🛒",
    href: "/marketplace/post",
    className: "bg-blue-50 hover:bg-blue-100",
  },
  {
    title: "Post a Job",
    description: "Share a new employment opportunity.",
    icon: "💼",
    href: "/jobs/post",
    className: "bg-amber-50 hover:bg-amber-100",
  },
  {
    title: "Add Business",
    description: "Create or manage your business profile.",
    icon: "🏢",
    href: "/businesses/post",
    className: "bg-purple-50 hover:bg-purple-100",
  },
  {
    title: "Post Service",
    description: "Advertise a professional or community service.",
    icon: "🛠️",
    href: "/services/post",
    className: "bg-orange-50 hover:bg-orange-100",
  },
  {
    title: "Create Promotion",
    description: "Promote your business, event, or special offer.",
    icon: "📢",
    href: "/promotion/post",
    className: "bg-pink-50 hover:bg-pink-100",
  },
  {
    title: "Favorites",
    description: "Open listings you have saved.",
    icon: "❤️",
    href: "/favorites",
    className: "bg-red-50 hover:bg-red-100",
  },
  {
    title: "Edit Profile",
    description: "Update your name, phone number, and profile.",
    icon: "👤",
    href: "/account/profile",
    className: "bg-slate-50 hover:bg-slate-100",
  },
  {
    title: "Account Settings",
    description: "Manage password and account preferences.",
    icon: "⚙️",
    href: "/account/settings",
    className: "bg-gray-50 hover:bg-gray-100",
  },
];

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
        problems.push(
          `Marketplace: ${marketplaceResult.error.message}`,
        );
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
        problems.push(
          `Businesses: ${businessesResult.error.message}`,
        );
        setBusinesses([]);
      } else {
        setBusinesses(
          (businessesResult.data ?? []) as BusinessRow[],
        );
      }

      if (servicesResult.error) {
        problems.push(`Services: ${servicesResult.error.message}`);
        setServices([]);
      } else {
        setServices((servicesResult.data ?? []) as ServiceRow[]);
      }

      if (promotionsResult.error) {
        problems.push(
          `Promotions: ${promotionsResult.error.message}`,
        );
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
        href: "/housing/my-listings",
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
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5]">
        <div className="rounded-2xl bg-white p-8 shadow">
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
      description: "Manage your rental listings.",
      href: "/housing/my-listings",
      postHref: "/post-ad/rental",
      postLabel: "Post Rental",
      counts: stats.rentals,
    },
    {
      title: "My Marketplace",
      icon: "🛒",
      description: "Manage your marketplace items.",
      href: "/marketplace/my-listings",
      postHref: "/marketplace/post",
      postLabel: "Sell Item",
      counts: stats.marketplace,
    },
    {
      title: "My Jobs",
      icon: "💼",
      description: "Manage your job postings.",
      href: "/jobs/my-listings",
      postHref: "/jobs/post",
      postLabel: "Post Job",
      counts: stats.jobs,
    },
    {
      title: "My Businesses",
      icon: "🏢",
      description: "Manage your business listings.",
      href: "/businesses/my-businesses",
      postHref: "/businesses/post",
      postLabel: "Add Business",
      counts: stats.businesses,
    },
    {
      title: "My Services",
      icon: "🛠️",
      description: "Manage your services.",
      href: "/services/my-listings",
      postHref: "/services/post",
      postLabel: "Post Service",
      counts: stats.services,
    },
    {
      title: "My Promotions",
      icon: "📢",
      description: "Manage your promotions.",
      href: "/promotion/dashboard",
      postHref: "/promotion/post",
      postLabel: "Create Promotion",
      counts: stats.promotions,
    },
  ];

  return (    <main className="min-h-screen bg-[#f7f8f5] px-4 py-8 sm:px-6">
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
                Manage your listings, profile, favorites, and account tools
                from one place.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-white/10 px-3 py-1 font-bold">
                  {email}
                </span>

                <span className="rounded-full bg-white/10 px-3 py-1 font-bold capitalize">
                  {profile?.role || "user"} account
                </span>

                {profile?.phone ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 font-bold">
                    {profile.phone}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {profile?.role === "admin" ? (
                <Link
                  href="/admin"
                  className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
                >
                  Admin Dashboard
                </Link>
              ) : null}

              <Link
                href="/account/profile"
                className="rounded-xl border border-white/40 px-5 py-3 font-black transition hover:bg-white/10"
              >
                Edit Profile
              </Link>

              <button
                type="button"
                onClick={() => void loadAccount()}
                className="rounded-xl border border-white/40 px-5 py-3 font-black transition hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-800">
            <p className="font-black">
              Unable to load your dashboard.
            </p>

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
              Quick Actions
            </h2>

            <p className="mt-2 text-slate-600">
              Jump directly to the most common account tasks.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={`group rounded-2xl border border-slate-200 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${action.className}`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                  {action.icon}
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900 group-hover:text-[#087531]">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_2fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-3xl font-black text-[#064d2b]">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-wider text-[#087531]">
                  My Profile
                </p>

                <h2 className="mt-1 truncate text-2xl font-black text-slate-900">
                  {displayName}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-600">
                  {email}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <ProfileRow
                label="Phone"
                value={profile?.phone || "Not added"}
              />

              <ProfileRow
                label="Role"
                value={profile?.role || "User"}
              />

              <ProfileRow
                label="Email"
                value={email || "Not available"}
              />
            </div>

            <div className="mt-6 grid gap-3">
              <Link
                href="/account/profile"
                className="rounded-xl bg-[#087531] px-5 py-3 text-center font-black text-white transition hover:bg-[#064d2b]"
              >
                Edit Profile
              </Link>

              <Link
                href="/account/settings"
                className="rounded-xl border border-[#087531] px-5 py-3 text-center font-black text-[#087531] transition hover:bg-green-50"
              >
                Account Settings
              </Link>
            </div>
          </article>

          <div>
            <h2 className="text-3xl font-black text-[#064d2b]">
              My Overview
            </h2>

            <p className="mt-2 text-slate-600">
              Live totals from all your Habeshawi Marketplace content.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
              className="inline-flex w-fit rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
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
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl">
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
                    className="rounded-xl bg-[#087531] px-5 py-3 font-black text-white transition hover:bg-[#064d2b]"
                  >
                    Manage
                  </Link>

                  <Link
                    href={section.postHref}
                    className="rounded-xl border border-[#087531] px-5 py-3 font-black text-[#087531] transition hover:bg-green-50"
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
            <div>
              <h2 className="text-2xl font-black text-[#064d2b]">
                Recent Activity
              </h2>

              <p className="mt-1 text-slate-600">
                Your newest submissions across the platform.
              </p>
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

          <div className="space-y-6">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black text-[#064d2b]">
                Account Tools
              </h2>

              <div className="mt-6 grid gap-3">
                <ToolLink
                  href="/favorites"
                  title="Favorites"
                  description="Open your saved rental and marketplace listings."
                />

                <ToolLink
                  href="/account/profile"
                  title="Profile Settings"
                  description="Update your name, phone number, and profile details."
                />

                <ToolLink
                  href="/account/settings"
                  title="Account Settings"
                  description="Manage password and account preferences."
                />

                <ToolLink
                  href="/post-ad"
                  title="Post an Ad"
                  description="Choose a category and create a new listing."
                />
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-[#064d2b]">
                  Messages
                </h2>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                  Coming Soon
                </span>
              </div>

              <p className="mt-3 leading-6 text-slate-600">
                Private messaging between buyers, sellers, landlords, and
                service providers will be added later.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-[#064d2b]">
                  Payments
                </h2>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
                  Dashboard
                </span>
              </div>

              <p className="mt-3 leading-6 text-slate-600">
                Review promotion payment status and manage your active
                advertising campaigns.
              </p>

              <Link
                href="/promotion/dashboard"
                className="mt-5 inline-flex rounded-xl border border-[#087531] px-5 py-3 font-black text-[#087531] transition hover:bg-green-50"
              >
                View Promotions
              </Link>
            </article>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-700 px-6 py-3 font-black text-white transition hover:bg-red-800"
          >
            Sign Out
          </button>

          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-700 transition hover:bg-slate-50"
          >
            Return Home
          </Link>
        </div>
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

      <p className="mt-2 text-sm text-slate-600">
        {description}
      </p>
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
      <p className="text-xl font-black text-[#064d2b]">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-500">
        {label}
      </p>
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

function StatusPill({
  status,
}: {
  status: string;
}) {
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
      <p className="font-black text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </Link>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-500">
        {label}
      </span>

      <span className="break-all text-right text-sm font-black capitalize text-slate-900">
        {value}
      </span>
    </div>
  );
}