import Link from "next/link";

const quickCategories = [
  {
    title: "Rentals",
    amharic: "የሚከራይ ቤት",
    icon: "🏠",
    description: "Rooms, apartments, houses and roommates",
    href: "/housing",
  },
  {
    title: "Marketplace",
    amharic: "ገበያ",
    icon: "🛍️",
    description: "Cars, phones, furniture and more",
    href: "/marketplace",
  },
  {
    title: "Promotions",
    amharic: "ማስታወቂያ",
    icon: "📢",
    description: "Businesses, events, sales and services",
    href: "/businesses",
  },
  {
    title: "Jobs",
    amharic: "ስራ",
    icon: "💼",
    description: "Find jobs or connect with employees",
    href: "/jobs",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#043820] via-[#087531] to-[#07532f] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-28 top-12 h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-1">
        <div className="w-1/3 bg-green-500" />
        <div className="w-1/3 bg-yellow-400" />
        <div className="w-1/3 bg-red-500" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-4 pb-8 sm:pt-5 sm:pb-10 lg:pt-5 lg:pb-10">
        <div className="grid items-center gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          {/* Left side */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              <span aria-hidden="true">🌍</span>
              Ethiopian & Eritrean Community Marketplace
            </div>

            <h1 className="mt-3 max-w-4xl text-2xl font-black leading-[1.08] sm:text-3xl lg:text-[44px]">
              Everything the Habesha Community Needs
            </h1>

            <p className="mt-4 text-2xl font-black text-yellow-300 sm:text-3xl">
              ሐበሻዊ ገበያ
            </p>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85 sm:text-xl">
              Buy, sell, rent, find jobs and promote your business in one
              trusted community marketplace.
            </p>

            <p className="mt-2 max-w-3xl font-semibold text-white/70">
              ይግዙ • ይሽጡ • ይከራዩ • ስራ ያግኙ • ንግድዎን ያስተዋውቁ
            </p>

            {/* Universal marketplace search */}
            <form
              action="/marketplace"
              method="get"
              className="mt-5 overflow-hidden rounded-2xl bg-white p-2 text-slate-900 shadow-2xl"
            >
              <div className="grid md:grid-cols-[1.4fr_0.8fr_auto]">
                <div className="flex items-center">
                  <span
                    aria-hidden="true"
                    className="pl-4 text-xl text-slate-400"
                  >
                    🔎
                  </span>

                  <label className="sr-only" htmlFor="marketplace-search">
                    Search Habeshawi Marketplace
                  </label>

                  <input
                    id="marketplace-search"
                    name="q"
                    type="search"
                    placeholder="Search apartments, cars, jobs, businesses..."
                    className="min-w-0 flex-1 rounded-xl px-4 py-3 outline-none placeholder:text-slate-400"
                  />
                </div>

                <label className="sr-only" htmlFor="category">
                  Select category
                </label>

                <select
                  id="category"
                  name="category"
                  defaultValue="all"
                  className="border-t border-slate-200 bg-white px-5 py-4 outline-none md:border-l md:border-t-0"
                >
                  <option value="all">All Categories</option>
                  <option value="rentals">Rentals</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="businesses">Promotions</option>
                  <option value="jobs">Jobs</option>
                </select>

                <button
                  type="submit"
                  className="m-1 rounded-xl bg-[#087531] px-7 py-4 font-black text-white transition hover:bg-[#064d2b]"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Popular searches */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="mr-1 font-semibold text-white/65">
                Popular:
              </span>

              <Link
                href="/housing"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
              >
                Apartments
              </Link>

              <Link
                href="/marketplace"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
              >
                Cars
              </Link>

              <Link
                href="/jobs"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
              >
                Jobs
              </Link>

              <Link
                href="/businesses"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
              >
                Restaurants
              </Link>
            </div>
          </div>

          {/* Right action panel */}
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-4xl font-black text-yellow-300 sm:text-5xl">
                  ሐበሻዊ
                </p>

                <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em] text-white/70">
                  Marketplace
                </p>
              </div>

              <div className="rounded-2xl bg-yellow-400 px-3 py-2 text-2xl shadow-lg">
                🚀
              </div>
            </div>

            <div className="my-6 h-1 w-24 rounded-full bg-yellow-300" />

            <h2 className="text-3xl font-black leading-tight">
              Start Posting Today
            </h2>

            <p className="mt-3 leading-7 text-white/80">
              Reach Ethiopian and Eritrean customers, renters, employers and
              community members across the DMV area.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/post-ad"
                className="flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-3 font-black text-[#053b24] transition hover:bg-yellow-300"
              >
                <span aria-hidden="true">🏠</span>
                Post Rental
              </Link>

              <Link
                href="/marketplace"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-bold transition hover:bg-white/20"
              >
                <span aria-hidden="true">🛍️</span>
                Sell an Item
              </Link>

              <Link
                href="/jobs"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-bold transition hover:bg-white/20"
              >
                <span aria-hidden="true">💼</span>
                Post a Job
              </Link>

              <Link
                href="/businesses"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-bold transition hover:bg-white/20"
              >
                <span aria-hidden="true">📢</span>
                Promote Business
              </Link>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-white/65">
              Washington, DC • Maryland • Virginia
            </p>
          </div>
        </div>

        {/* Four marketplace pillars */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickCategories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm transition hover:-translate-y-1 hover:border-yellow-300/60 hover:bg-white/15 hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow">
                  {category.icon}
                </div>

                <div>
                  <h2 className="text-base font-black group-hover:text-yellow-300">
                    {category.title}
                  </h2>

                  <p className="mt-0.5 font-bold text-yellow-300">
                    {category.amharic}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-white/70">
                {category.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                Explore
                <span
                  aria-hidden="true"
                  className="transition group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}