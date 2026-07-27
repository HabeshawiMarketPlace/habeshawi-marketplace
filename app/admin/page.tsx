"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import JobTable from "@/components/admin/JobTable";
import ExecutiveStats, {
  type ExecutiveStatsData,
} from "@/components/admin/ExecutiveStats";
import { supabase } from "@/lib/supabase";

type Section =
  | "overview"
  | "rentals"
  | "marketplace"
  | "jobs"
  | "businesses"
  | "services"
  | "promotions";

type Status = "pending" | "approved" | "rejected";
type RentalStatus = "draft" | Status;
type PromotionStatus =
  | "draft"
  | "pending"
  | "active"
  | "expired"
  | "rejected";

type Rental = {
  id: string;
  title: string;
  price: number | null;
  status: RentalStatus;
  payment_status: string;
  property_type: string | null;
  location: string | null;
  created_at: string;
};

type MarketplaceItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  condition: string | null;
  city: string;
  state: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  image_url: string | null;
  featured: boolean;
  status: Status;
  created_at: string;
};

type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  featured: boolean;
  status: Status;
  created_at: string;
};

type Service = {
  id: string;
  service_name: string;
  category: string;
  description: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: string | null;
  image_url: string | null;
  status: Status;
  created_at: string;
};

type Promotion = {
  id: string;
  business_name: string;
  title: string;
  package: string;
  status: PromotionStatus;
  payment_status: string;
  price: number;
  created_at: string;
};

type ReviewItem =
  | { kind: "rental"; item: Rental }
  | { kind: "marketplace"; item: MarketplaceItem }
  | { kind: "business"; item: Business }
  | { kind: "service"; item: Service }
  | { kind: "promotion"; item: Promotion };

type Counts = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

export default function AdminPage() {
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<Section>("overview");
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [executiveStats, setExecutiveStats] =
    useState<ExecutiveStatsData>({
      users: 0,
      rentals: 0,
      marketplace: 0,
      jobs: 0,
      businesses: 0,
      services: 0,
      promotions: 0,
      featured: 0,
      pending: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    });

  const loadAll = useCallback(async () => {
    setLoading(true);

    const [
      rentalsResult,
      marketplaceResult,
      businessesResult,
      servicesResult,
      promotionsResult,
      jobsResult,
      profilesResult,
    ] = await Promise.all([
      supabase
        .from("rentals")
        .select(
          "id,title,price,status,payment_status,property_type,location,created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("marketplace_listings")
        .select(
          "id,title,category,description,price,condition,city,state,seller_name,seller_email,seller_phone,image_url,featured,status,created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("businesses")
        .select(
          "id,name,category,description,address,city,state,zip_code,phone,email,website,featured,status,created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("services")
        .select(
          "id,service_name,category,description,contact_name,phone,email,website,address,city,state,zip,price,image_url,status,created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("advertisements")
        .select(
          "id,business_name,title,package,status,payment_status,price,created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("jobs")
        .select("id,status,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id"),
    ]);

    const firstError =
      rentalsResult.error ||
      marketplaceResult.error ||
      businessesResult.error ||
      servicesResult.error ||
      promotionsResult.error ||
      jobsResult.error ||
      profilesResult.error;

    if (firstError) {
      alert(`Unable to load admin data: ${firstError.message}`);
    }

    setRentals((rentalsResult.data ?? []) as Rental[]);
    setMarketplace(
      (marketplaceResult.data ?? []) as MarketplaceItem[],
    );
    setBusinesses((businessesResult.data ?? []) as Business[]);
    setServices((servicesResult.data ?? []) as Service[]);
    setPromotions((promotionsResult.data ?? []) as Promotion[]);

    const rentalRows = (rentalsResult.data ?? []) as Rental[];
    const marketplaceRows =
      (marketplaceResult.data ?? []) as MarketplaceItem[];
    const businessRows = (businessesResult.data ?? []) as Business[];
    const serviceRows = (servicesResult.data ?? []) as Service[];
    const promotionRows =
      (promotionsResult.data ?? []) as Promotion[];
    const jobRows =
      (jobsResult.data ?? []) as Array<{
        id: string;
        status: string;
        created_at: string;
      }>;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const allCreatedItems: Array<{ created_at: string }> = [
      ...rentalRows,
      ...marketplaceRows,
      ...jobRows,
      ...businessRows,
      ...serviceRows,
      ...promotionRows,
    ];

    setExecutiveStats({
      users: profilesResult.data?.length ?? 0,
      rentals: rentalRows.length,
      marketplace: marketplaceRows.length,
      jobs: jobRows.length,
      businesses: businessRows.length,
      services: serviceRows.length,
      promotions: promotionRows.length,
      featured:
        marketplaceRows.filter((item) => item.featured).length +
        businessRows.filter((item) => item.featured).length,
      pending:
        countPending(rentalRows) +
        countPending(marketplaceRows) +
        countPending(jobRows) +
        countPending(businessRows) +
        countPending(serviceRows) +
        countPending(promotionRows),
      today: countCreatedSince(allCreatedItems, startOfToday),
      thisWeek: countCreatedSince(allCreatedItems, sevenDaysAgo),
      thisMonth: countCreatedSince(allCreatedItems, thirtyDaysAgo),
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error || profile?.role !== "admin") {
          alert("You do not have permission to access this page.");
          router.replace("/account");
          return;
        }

        await loadAll();
      } finally {
        if (mounted) {
          setCheckingAccess(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [loadAll, router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const requestedSection = new URLSearchParams(
      window.location.search,
    ).get("section");

    const allowedSections: Section[] = [
      "overview",
      "rentals",
      "marketplace",
      "jobs",
      "businesses",
      "services",
      "promotions",
    ];

    if (
      requestedSection &&
      allowedSections.includes(requestedSection as Section)
    ) {
      setActiveSection(requestedSection as Section);
    }
  }, []);

  useEffect(() => {
    setSearch("");
    setStatusFilter("pending");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);

      if (activeSection === "overview") {
        url.searchParams.delete("section");
      } else {
        url.searchParams.set("section", activeSection);
      }

      window.history.replaceState({}, "", url.toString());
    }
  }, [activeSection]);

  const counts = {
    rentals: getCounts(rentals),
    marketplace: getCounts(marketplace),
    businesses: getCounts(businesses),
    services: getCounts(services),
    promotions: getPromotionCounts(promotions),
  };

  async function moderate(
    kind: ReviewItem["kind"],
    id: string,
    action:
      | "approve"
      | "reject"
      | "pending"
      | "delete"
      | "feature"
      | "unfeature"
      | "expire",
  ) {
    const label =
      action === "delete"
        ? "permanently delete"
        : action === "approve"
          ? "approve"
          : action === "reject"
            ? "reject"
            : action === "expire"
              ? "expire"
              : action === "feature"
                ? "mark as featured"
                : action === "unfeature"
                  ? "remove featured status from"
                  : "return to pending";

    if (
      !confirm(
        `Are you sure you want to ${label} this ${kind}?`,
      )
    ) {
      return;
    }

    setWorkingKey(`${kind}-${id}`);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ kind, id, action }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update item.");
      }

      await loadAll();

      if (action === "delete") {
        setReviewItem(null);
      } else {
        setReviewItem((current) => {
          if (!current || current.kind !== kind || current.item.id !== id) {
            return current;
          }

          const updatedStatus =
            action === "approve"
              ? kind === "promotion"
                ? "active"
                : "approved"
              : action === "reject"
                ? "rejected"
                : action === "pending"
                  ? "pending"
                  : action === "expire"
                    ? "expired"
                    : current.item.status;

          return {
            ...current,
            item: {
              ...current.item,
              status: updatedStatus,
              ...("featured" in current.item
                ? {
                    featured:
                      action === "feature"
                        ? true
                        : action === "unfeature"
                          ? false
                          : current.item.featured,
                  }
                : {}),
            },
          } as ReviewItem;
        });
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update item.",
      );
    } finally {
      setWorkingKey(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 font-bold text-[#064d2b] shadow">
          Verifying administrator access...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-3xl bg-[#064d2b] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
                Habeshawi Marketplace
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Unified Admin Dashboard
              </h1>
              <p className="mt-3 text-green-100">
                Review, approve, reject, feature, expire, and delete submissions from one page.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="rounded-xl border border-white/40 px-5 py-3 font-black hover:bg-white/10"
              >
                My Account
              </button>
              <button
                type="button"
                onClick={() => void loadAll()}
                className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black hover:bg-yellow-300"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={signOut}
                className="rounded-xl border border-white/40 px-5 py-3 font-black hover:bg-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <nav className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border bg-white p-2 shadow-sm">
          <AdminTab
            active={activeSection === "overview"}
            label="Overview"
            onClick={() => setActiveSection("overview")}
          />
          <AdminTab
            active={activeSection === "rentals"}
            label={`Rentals (${counts.rentals.pending})`}
            onClick={() => setActiveSection("rentals")}
          />
          <AdminTab
            active={activeSection === "marketplace"}
            label={`Marketplace (${counts.marketplace.pending})`}
            onClick={() => setActiveSection("marketplace")}
          />
          <AdminTab
            active={activeSection === "jobs"}
            label="Jobs"
            onClick={() => setActiveSection("jobs")}
          />
          <AdminTab
            active={activeSection === "businesses"}
            label={`Businesses (${counts.businesses.pending})`}
            onClick={() => setActiveSection("businesses")}
          />
          <AdminTab
            active={activeSection === "services"}
            label={`Services (${counts.services.pending})`}
            onClick={() => setActiveSection("services")}
          />
          <AdminTab
            active={activeSection === "promotions"}
            label={`Promotions (${counts.promotions.pending})`}
            onClick={() => setActiveSection("promotions")}
          />
        </nav>

        {loading ? (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center font-bold shadow-sm">
            Loading dashboard...
          </div>
        ) : null}

        {!loading && activeSection === "overview" ? (
          <>
            <ExecutiveStats
              stats={executiveStats}
              onOpenSection={setActiveSection}
            />

            <Overview
              counts={counts}
              onOpen={setActiveSection}
            />
          </>
        ) : null}

        {!loading && activeSection === "jobs" ? (
          <div className="mt-8">
            <JobTable />
          </div>
        ) : null}

        {!loading && activeSection !== "overview" && activeSection !== "jobs" ? (
          <ContentSection
            section={activeSection}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            rentals={rentals}
            marketplace={marketplace}
            businesses={businesses}
            services={services}
            promotions={promotions}
            workingKey={workingKey}
            onReview={setReviewItem}
            moderate={moderate}
          />
        ) : null}
      </div>

      {reviewItem ? (
        <ReviewModal
          review={reviewItem}
          workingKey={workingKey}
          onClose={() => setReviewItem(null)}
          moderate={moderate}
        />
      ) : null}
    </main>
  );
}

function Overview({
  counts,
  onOpen,
}: {
  counts: {
    rentals: Counts;
    marketplace: Counts;
    businesses: Counts;
    services: Counts;
    promotions: Counts;
  };
  onOpen: (section: Section) => void;
}) {
  const cards: Array<{
    title: string;
    section: Section;
    counts: Counts;
  }> = [
    { title: "Rentals", section: "rentals", counts: counts.rentals },
    {
      title: "Marketplace",
      section: "marketplace",
      counts: counts.marketplace,
    },
    {
      title: "Businesses",
      section: "businesses",
      counts: counts.businesses,
    },
    { title: "Services", section: "services", counts: counts.services },
    {
      title: "Promotions",
      section: "promotions",
      counts: counts.promotions,
    },
  ];

  return (
    <section className="mt-8">
      <h2 className="text-3xl font-black text-[#064d2b]">
        Content Overview
      </h2>
      <p className="mt-2 text-slate-600">
        Open any section to review pending submissions.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.section}
            type="button"
            onClick={() => onOpen(card.section)}
            className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">
                {card.title}
              </h3>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800">
                {card.counts.pending} pending
              </span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <MiniCount label="Total" value={card.counts.total} />
              <MiniCount label="Approved" value={card.counts.approved} />
              <MiniCount label="Rejected" value={card.counts.rejected} />
            </div>

            <p className="mt-6 font-black text-[#087531]">
              Review submissions →
            </p>
          </button>
        ))}

        <button
          type="button"
          onClick={() => onOpen("jobs")}
          className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h3 className="text-2xl font-black text-slate-900">Jobs</h3>
          <p className="mt-4 leading-7 text-slate-600">
            Open the existing job moderation table to review, approve, reject, and delete job postings.
          </p>
          <p className="mt-6 font-black text-[#087531]">
            Manage jobs →
          </p>
        </button>
      </div>
    </section>
  );
}

function ContentSection({
  section,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  rentals,
  marketplace,
  businesses,
  services,
  promotions,
  workingKey,
  onReview,
  moderate,
}: {
  section: Exclude<Section, "overview" | "jobs">;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  rentals: Rental[];
  marketplace: MarketplaceItem[];
  businesses: Business[];
  services: Service[];
  promotions: Promotion[];
  workingKey: string | null;
  onReview: (item: ReviewItem) => void;
  moderate: (
    kind: ReviewItem["kind"],
    id: string,
    action:
      | "approve"
      | "reject"
      | "pending"
      | "delete"
      | "feature"
      | "unfeature"
      | "expire",
  ) => Promise<void>;
}) {
  const normalized = search.trim().toLowerCase();

  const statusOptions =
    section === "rentals"
      ? ["all", "draft", "pending", "approved", "rejected"]
      : section === "promotions"
        ? ["all", "draft", "pending", "active", "expired", "rejected"]
        : ["all", "pending", "approved", "rejected"];

  const rows = useMemo(() => {
    const source =
      section === "rentals"
        ? rentals.map((item) => ({
            key: item.id,
            title: item.title,
            subtitle: `${item.property_type || "Rental"} • ${item.location || "No location"}`,
            status: item.status,
            created_at: item.created_at,
            review: { kind: "rental", item } as ReviewItem,
            featured: undefined,
            payment: item.payment_status,
          }))
        : section === "marketplace"
          ? marketplace.map((item) => ({
              key: item.id,
              title: item.title,
              subtitle: `${item.category} • ${formatMoney(item.price)}`,
              status: item.status,
              created_at: item.created_at,
              review: { kind: "marketplace", item } as ReviewItem,
              featured: item.featured,
              payment: undefined,
            }))
          : section === "businesses"
            ? businesses.map((item) => ({
                key: item.id,
                title: item.name,
                subtitle: `${item.category} • ${item.city}, ${item.state}`,
                status: item.status,
                created_at: item.created_at,
                review: { kind: "business", item } as ReviewItem,
                featured: item.featured,
                payment: undefined,
              }))
            : section === "services"
              ? services.map((item) => ({
                  key: item.id,
                  title: item.service_name,
                  subtitle: `${item.category} • ${item.city || "No city"}`,
                  status: item.status,
                  created_at: item.created_at,
                  review: { kind: "service", item } as ReviewItem,
                  featured: undefined,
                  payment: undefined,
                }))
              : promotions.map((item) => ({
                  key: item.id,
                  title: item.business_name,
                  subtitle: `${item.title} • ${item.package} • ${formatMoney(item.price)}`,
                  status: item.status,
                  created_at: item.created_at,
                  review: { kind: "promotion", item } as ReviewItem,
                  featured: undefined,
                  payment: item.payment_status,
                }));

    return source.filter((row) => {
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;

      const matchesSearch =
        !normalized ||
        `${row.title} ${row.subtitle} ${row.status} ${row.payment || ""}`
          .toLowerCase()
          .includes(normalized);

      return matchesStatus && matchesSearch;
    });
  }, [
    businesses,
    marketplace,
    normalized,
    promotions,
    rentals,
    section,
    services,
    statusFilter,
  ]);

  const title =
    section === "rentals"
      ? "Rental Management"
      : section === "marketplace"
        ? "Marketplace Management"
        : section === "businesses"
          ? "Business Management"
          : section === "services"
            ? "Service Management"
            : "Promotion Management";

  return (
    <section className="mt-8">
      <div>
        <h2 className="text-3xl font-black text-[#064d2b]">{title}</h2>
        <p className="mt-2 text-slate-600">
          Review submissions before approving, rejecting, or deleting them.
        </p>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border bg-white p-5 shadow-sm lg:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search submissions"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "all"
                ? "All statuses"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-4">Submission</th>
              <th className="p-4">Status</th>
              <th className="p-4">Payment / Featured</th>
              <th className="p-4">Submitted</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const kind = row.review.kind;
              const isWorking = workingKey === `${kind}-${row.key}`;

              return (
                <tr key={row.key} className="border-t align-top hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-black text-slate-900">{row.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{row.subtitle}</p>
                  </td>

                  <td className="p-4">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="p-4">
                    {row.payment ? (
                      <span className="font-bold capitalize">{row.payment}</span>
                    ) : typeof row.featured === "boolean" ? (
                      <span className="font-bold">
                        {row.featured ? "Featured" : "Not featured"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-4">{formatDate(row.created_at)}</td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Action
                        label="Review"
                        tone="blue"
                        disabled={isWorking}
                        onClick={() => onReview(row.review)}
                      />

                      {row.status !==
                        (kind === "promotion" ? "active" : "approved") ? (
                        <Action
                          label={kind === "promotion" ? "Activate" : "Approve"}
                          tone="green"
                          disabled={isWorking}
                          onClick={() =>
                            void moderate(kind, row.key, "approve")
                          }
                        />
                      ) : null}

                      {row.status !== "rejected" ? (
                        <Action
                          label="Reject"
                          tone="red"
                          disabled={isWorking}
                          onClick={() =>
                            void moderate(kind, row.key, "reject")
                          }
                        />
                      ) : null}

                      {row.status !== "pending" ? (
                        <Action
                          label="Pending"
                          tone="amber"
                          disabled={isWorking}
                          onClick={() =>
                            void moderate(kind, row.key, "pending")
                          }
                        />
                      ) : null}

                      {kind === "promotion" && row.status === "active" ? (
                        <Action
                          label="Expire"
                          tone="amber"
                          disabled={isWorking}
                          onClick={() =>
                            void moderate(kind, row.key, "expire")
                          }
                        />
                      ) : null}

                      {typeof row.featured === "boolean" ? (
                        <Action
                          label={row.featured ? "Unfeature" : "Feature"}
                          tone="slate"
                          disabled={isWorking}
                          onClick={() =>
                            void moderate(
                              kind,
                              row.key,
                              row.featured ? "unfeature" : "feature",
                            )
                          }
                        />
                      ) : null}

                      <Action
                        label={isWorking ? "Working..." : "Delete"}
                        tone="dark"
                        disabled={isWorking}
                        onClick={() =>
                          void moderate(kind, row.key, "delete")
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-500">
                  No submissions match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReviewModal({
  review,
  workingKey,
  onClose,
  moderate,
}: {
  review: ReviewItem;
  workingKey: string | null;
  onClose: () => void;
  moderate: (
    kind: ReviewItem["kind"],
    id: string,
    action:
      | "approve"
      | "reject"
      | "pending"
      | "delete"
      | "feature"
      | "unfeature"
      | "expire",
  ) => Promise<void>;
}) {
  const item = review.item;
  const isWorking = workingKey === `${review.kind}-${item.id}`;
  const details = getReviewDetails(review);
  const featured =
    "featured" in item ? Boolean(item.featured) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-[#087531]">
              {review.kind} review
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              {details.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 font-black hover:bg-slate-100"
          >
            Close
          </button>
        </header>

        {details.image ? (
          <div className="border-b bg-slate-100 p-6">
            <img
              src={details.image}
              alt={details.title}
              className="mx-auto max-h-96 w-full rounded-2xl object-contain"
            />
          </div>
        ) : null}

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {details.fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                {label}
              </p>
              <p className="mt-1 break-words font-semibold text-slate-800">
                {value || "Not provided"}
              </p>
            </div>
          ))}

          {details.description ? (
            <div className="md:col-span-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                {details.description}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="flex flex-wrap gap-3 border-t p-6">
          {item.status !==
          (review.kind === "promotion" ? "active" : "approved") ? (
            <Action
              label={review.kind === "promotion" ? "Activate" : "Approve"}
              tone="green"
              disabled={isWorking}
              onClick={() =>
                void moderate(review.kind, item.id, "approve")
              }
            />
          ) : null}

          {item.status !== "rejected" ? (
            <Action
              label="Reject"
              tone="red"
              disabled={isWorking}
              onClick={() =>
                void moderate(review.kind, item.id, "reject")
              }
            />
          ) : null}

          {item.status !== "pending" ? (
            <Action
              label="Move to Pending"
              tone="amber"
              disabled={isWorking}
              onClick={() =>
                void moderate(review.kind, item.id, "pending")
              }
            />
          ) : null}

          {review.kind === "promotion" && item.status === "active" ? (
            <Action
              label="Expire"
              tone="amber"
              disabled={isWorking}
              onClick={() =>
                void moderate(review.kind, item.id, "expire")
              }
            />
          ) : null}

          {typeof featured === "boolean" ? (
            <Action
              label={featured ? "Remove Featured" : "Mark Featured"}
              tone="slate"
              disabled={isWorking}
              onClick={() =>
                void moderate(
                  review.kind,
                  item.id,
                  featured ? "unfeature" : "feature",
                )
              }
            />
          ) : null}

          <Action
            label={isWorking ? "Working..." : "Delete Permanently"}
            tone="dark"
            disabled={isWorking}
            onClick={() =>
              void moderate(review.kind, item.id, "delete")
            }
          />
        </footer>
      </div>
    </div>
  );
}

function getReviewDetails(review: ReviewItem) {
  if (review.kind === "rental") {
    return {
      title: review.item.title,
      image: null,
      description: null,
      fields: [
        ["Property Type", review.item.property_type],
        ["Location", review.item.location],
        ["Price", formatMoney(review.item.price)],
        ["Status", review.item.status],
        ["Payment", review.item.payment_status],
        ["Submitted", formatDate(review.item.created_at)],
      ],
    };
  }

  if (review.kind === "marketplace") {
    return {
      title: review.item.title,
      image: review.item.image_url,
      description: review.item.description,
      fields: [
        ["Category", review.item.category],
        ["Condition", review.item.condition],
        ["Price", formatMoney(review.item.price)],
        ["Location", `${review.item.city}, ${review.item.state}`],
        ["Seller", review.item.seller_name],
        ["Seller Email", review.item.seller_email],
        ["Seller Phone", review.item.seller_phone],
        ["Status", review.item.status],
        ["Featured", review.item.featured ? "Yes" : "No"],
        ["Submitted", formatDate(review.item.created_at)],
      ],
    };
  }

  if (review.kind === "business") {
    return {
      title: review.item.name,
      image: null,
      description: review.item.description,
      fields: [
        ["Category", review.item.category],
        [
          "Address",
          `${review.item.address}, ${review.item.city}, ${review.item.state} ${review.item.zip_code || ""}`,
        ],
        ["Phone", review.item.phone],
        ["Email", review.item.email],
        ["Website", review.item.website],
        ["Status", review.item.status],
        ["Featured", review.item.featured ? "Yes" : "No"],
        ["Submitted", formatDate(review.item.created_at)],
      ],
    };
  }

  if (review.kind === "service") {
    return {
      title: review.item.service_name,
      image: review.item.image_url,
      description: review.item.description,
      fields: [
        ["Category", review.item.category],
        ["Contact", review.item.contact_name],
        ["Phone", review.item.phone],
        ["Email", review.item.email],
        ["Website", review.item.website],
        [
          "Address",
          [
            review.item.address,
            review.item.city,
            review.item.state,
            review.item.zip,
          ]
            .filter(Boolean)
            .join(", "),
        ],
        ["Price", review.item.price],
        ["Status", review.item.status],
        ["Submitted", formatDate(review.item.created_at)],
      ],
    };
  }

  return {
    title: review.item.business_name,
    image: null,
    description: null,
    fields: [
      ["Promotion Title", review.item.title],
      ["Package", review.item.package],
      ["Price", formatMoney(review.item.price)],
      ["Status", review.item.status],
      ["Payment", review.item.payment_status],
      ["Submitted", formatDate(review.item.created_at)],
    ],
  };
}

function AdminTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-xl px-4 py-3 font-black transition ${
        active
          ? "bg-[#064d2b] text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );
}

function Action({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: "blue" | "green" | "red" | "amber" | "slate" | "dark";
  disabled: boolean;
  onClick: () => void;
}) {
  const styles = {
    blue: "bg-blue-700 hover:bg-blue-800",
    green: "bg-green-700 hover:bg-green-800",
    red: "bg-red-700 hover:bg-red-800",
    amber: "bg-amber-600 hover:bg-amber-700",
    slate: "bg-slate-500 hover:bg-slate-600",
    dark: "bg-slate-900 hover:bg-black",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles[tone]}`}
    >
      {label}
    </button>
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
      <p className="text-2xl font-black text-[#064d2b]">{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "approved" || status === "active"
      ? "bg-green-100 text-green-800"
      : status === "rejected" || status === "expired"
        ? "bg-red-100 text-red-800"
        : status === "draft"
          ? "bg-slate-100 text-slate-700"
          : "bg-amber-100 text-amber-800";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-black capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

function getCounts<T extends { status: string }>(items: T[]): Counts {
  return {
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    rejected: items.filter((item) => item.status === "rejected").length,
    total: items.length,
  };
}

function getPromotionCounts(items: Promotion[]): Counts {
  return {
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "active").length,
    rejected: items.filter((item) => item.status === "rejected").length,
    total: items.length,
  };
}

function countPending<T extends { status: string }>(items: T[]) {
  return items.filter((item) => item.status === "pending").length;
}

function countCreatedSince(
  items: Array<{ created_at: string }>,
  since: Date,
) {
  return items.filter((item) => {
    const createdAt = new Date(item.created_at);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= since;
  }).length;
}

function formatMoney(value: number | null) {
  if (value === null || Number.isNaN(Number(value))) {
    return "Not provided";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
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