"use client";

type Section =
  | "overview"
  | "rentals"
  | "marketplace"
  | "jobs"
  | "businesses"
  | "services"
  | "promotions";

export type ExecutiveStatsData = {
  users: number;
  rentals: number;
  marketplace: number;
  jobs: number;
  businesses: number;
  services: number;
  promotions: number;
  featured: number;
  pending: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
};

type Props = {
  stats: ExecutiveStatsData;
  onOpenSection: (section: Section) => void;
};

type StatCard = {
  title: string;
  value: number;
  description: string;
  icon: string;
  section?: Section;
};

export default function ExecutiveStats({
  stats,
  onOpenSection,
}: Props) {
  const cards: StatCard[] = [
    {
      title: "Users",
      value: stats.users,
      description: "Registered accounts",
      icon: "👥",
    },
    {
      title: "Rentals",
      value: stats.rentals,
      description: "All rental listings",
      icon: "🏠",
      section: "rentals",
    },
    {
      title: "Marketplace",
      value: stats.marketplace,
      description: "Marketplace listings",
      icon: "🛒",
      section: "marketplace",
    },
    {
      title: "Jobs",
      value: stats.jobs,
      description: "Job postings",
      icon: "💼",
      section: "jobs",
    },
    {
      title: "Businesses",
      value: stats.businesses,
      description: "Business listings",
      icon: "🏢",
      section: "businesses",
    },
    {
      title: "Services",
      value: stats.services,
      description: "Community services",
      icon: "🛠️",
      section: "services",
    },
    {
      title: "Promotions",
      value: stats.promotions,
      description: "Advertisement campaigns",
      icon: "📢",
      section: "promotions",
    },
    {
      title: "Featured",
      value: stats.featured,
      description: "Featured marketplace items and businesses",
      icon: "⭐",
    },
    {
      title: "Pending",
      value: stats.pending,
      description: "Waiting for approval",
      icon: "⏳",
    },
    {
      title: "Today",
      value: stats.today,
      description: "Submitted today",
      icon: "📅",
    },
    {
      title: "This Week",
      value: stats.thisWeek,
      description: "Submitted in the last 7 days",
      icon: "📈",
    },
    {
      title: "This Month",
      value: stats.thisMonth,
      description: "Submitted in the last 30 days",
      icon: "🗓️",
    },
  ];

  return (
    <section className="mt-8">
      <div>
        <h2 className="text-3xl font-black text-[#064d2b]">
          Executive Overview
        </h2>

        <p className="mt-2 text-slate-600">
          Live totals across the Habeshawi Marketplace platform.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          const clickable = Boolean(card.section);

          return (
            <button
              key={card.title}
              type="button"
              disabled={!clickable}
              onClick={() => {
                if (card.section) {
                  onOpenSection(card.section);
                }
              }}
              className={`rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition ${
                clickable
                  ? "cursor-pointer hover:-translate-y-1 hover:border-[#087531] hover:shadow-lg"
                  : "cursor-default"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-4xl font-black text-[#064d2b]">
                    {card.value.toLocaleString("en-US")}
                  </p>
                </div>

                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl"
                >
                  {card.icon}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {card.description}
              </p>

              {clickable ? (
                <p className="mt-4 text-sm font-black text-[#087531]">
                  Open section →
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}