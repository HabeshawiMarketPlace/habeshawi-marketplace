import Link from "next/link";
import { getBusinesses } from "@/lib/businesses/queries";
import { getRentals } from "@/lib/housing/queries";
import { getApprovedJobs } from "@/lib/jobs/queries";
import { getMarketplaceListings } from "@/lib/marketplace/queries";

type SearchPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

type SearchResult = {
  id: string;
  type: "Rental" | "Marketplace" | "Job" | "Business" | "Service";
  icon: string;
  title: string;
  description: string;
  location?: string;
  price?: number;
  href: string;
};

const communityServices = [
  {
    id: "tax-services",
    title: "Tax Services",
    description:
      "Find tax preparation, bookkeeping and accounting services.",
    keywords: "tax accounting bookkeeping accountant income tax",
    href: "/services",
  },
  {
    id: "immigration-services",
    title: "Immigration Services",
    description:
      "Connect with immigration support and legal service providers.",
    keywords: "immigration visa citizenship green card legal",
    href: "/services",
  },
  {
    id: "legal-services",
    title: "Legal Services",
    description:
      "Find attorneys and community legal assistance providers.",
    keywords: "legal lawyer attorney court consultation",
    href: "/services",
  },
  {
    id: "translation-services",
    title: "Translation Services",
    description:
      "Find Amharic and English translation and interpretation services.",
    keywords: "translation interpreter amharic english documents",
    href: "/services",
  },
  {
    id: "real-estate-services",
    title: "Real Estate Services",
    description:
      "Connect with real estate agents, lenders and property professionals.",
    keywords: "real estate realtor house home mortgage lender",
    href: "/services",
  },
  {
    id: "insurance-services",
    title: "Insurance Services",
    description:
      "Find auto, home, business, health and life insurance services.",
    keywords: "insurance auto home business health life",
    href: "/services",
  },
  {
    id: "travel-services",
    title: "Travel Services",
    description:
      "Find travel agencies, airline assistance and vacation planning.",
    keywords: "travel agency flight airline ticket vacation",
    href: "/services",
  },
  {
    id: "home-services",
    title: "Home Services",
    description:
      "Find cleaning, repair, moving and property maintenance services.",
    keywords: "cleaning repair moving maintenance plumbing electrical",
    href: "/services",
  },
];

function containsSearch(
  search: string,
  values: Array<string | number | null | undefined>,
) {
  if (!search) {
    return true;
  }

  const combinedText = values
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();

  return combinedText.includes(search);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function ResultCard({ result }: { result: SearchResult }) {
  return (
    <Link
      href={result.href}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#087531]/40 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">
          {result.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#064d2b]">
              {result.type}
            </span>

            {typeof result.price === "number" && (
              <span className="font-black text-[#087531]">
                {formatPrice(result.price)}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-xl font-black text-slate-900 transition group-hover:text-[#087531]">
            {result.title}
          </h2>

          {result.location && (
            <p className="mt-2 text-sm font-semibold text-slate-500">
              📍 {result.location}
            </p>
          )}

          <p className="mt-3 line-clamp-3 leading-6 text-slate-600">
            {result.description || "View this listing for more information."}
          </p>

          <span className="mt-4 inline-flex items-center gap-2 font-bold text-[#087531]">
            View details
            <span className="transition group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const rawSearch = params.search?.trim() ?? "";
  const search = rawSearch.toLowerCase();

  const [
    rentalResponse,
    marketplaceResponse,
    jobResponse,
    businessResponse,
  ] = await Promise.allSettled([
    getRentals(),
    getMarketplaceListings(),
    getApprovedJobs(),
    getBusinesses(),
  ]);

  const rentals =
    rentalResponse.status === "fulfilled" ? rentalResponse.value : [];

  const marketplaceListings =
    marketplaceResponse.status === "fulfilled"
      ? marketplaceResponse.value
      : [];

  const jobs =
    jobResponse.status === "fulfilled" ? jobResponse.value : [];

  const businesses =
    businessResponse.status === "fulfilled"
      ? businessResponse.value
      : [];

  const rentalResults: SearchResult[] = rentals
    .filter((rental) =>
      containsSearch(search, [
        rental.title,
        rental.description,
        rental.location,
        rental.propertyType,
        rental.price,
        rental.bedrooms,
        rental.bathrooms,
      ]),
    )
    .slice(0, 12)
    .map((rental) => ({
      id: rental.id,
      type: "Rental",
      icon: "🏠",
      title: rental.title,
      description: rental.description,
      location: rental.location,
      price: rental.price,
      href: `/housing/${rental.id}`,
    }));

  const marketplaceResults: SearchResult[] = marketplaceListings
    .filter((listing) =>
      containsSearch(search, [
        listing.title,
        listing.description,
        listing.category,
        listing.condition,
        listing.city,
        listing.state,
        listing.price,
      ]),
    )
    .slice(0, 12)
    .map((listing) => ({
      id: listing.id,
      type: "Marketplace",
      icon: "🛍️",
      title: listing.title,
      description: listing.description,
      location: [listing.city, listing.state].filter(Boolean).join(", "),
      price: listing.price,
      href: `/marketplace/${listing.id}`,
    }));

  const jobResults: SearchResult[] = jobs
    .filter((job) =>
      containsSearch(search, [
        job.title,
        job.company,
        job.description,
        job.location,
        job.category,
        job.employmentType,
        job.pay,
      ]),
    )
    .slice(0, 12)
    .map((job) => ({
      id: job.id,
      type: "Job",
      icon: "💼",
      title: job.title,
      description: `${job.company} — ${job.description}`,
      location: job.location,
      href: `/jobs/${job.id}`,
    }));

  const businessResults: SearchResult[] = businesses
    .filter((business) =>
      containsSearch(search, [
        business.name,
        business.description,
        business.category,
        business.address,
        business.city,
        business.state,
        business.specialties?.join(" "),
      ]),
    )
    .slice(0, 12)
    .map((business) => ({
      id: String(business.id),
      type: "Business",
      icon: "🏢",
      title: business.name,
      description: business.description,
      location: [business.city, business.state].filter(Boolean).join(", "),
      href: `/businesses/${business.id}`,
    }));

  const serviceResults: SearchResult[] = communityServices
    .filter((service) =>
      containsSearch(search, [
        service.title,
        service.description,
        service.keywords,
      ]),
    )
    .map((service) => ({
      id: service.id,
      type: "Service",
      icon: "🛠️",
      title: service.title,
      description: service.description,
      href: service.href,
    }));

  const groupedResults = [
    {
      title: "Rentals",
      amharic: "የሚከራዩ ቤቶች",
      href: `/housing?search=${encodeURIComponent(rawSearch)}`,
      results: rentalResults,
    },
    {
      title: "Marketplace",
      amharic: "ገበያ",
      href: `/marketplace?search=${encodeURIComponent(rawSearch)}`,
      results: marketplaceResults,
    },
    {
      title: "Jobs",
      amharic: "ስራዎች",
      href: `/jobs?search=${encodeURIComponent(rawSearch)}`,
      results: jobResults,
    },
    {
      title: "Businesses",
      amharic: "ንግዶች",
      href: `/businesses?search=${encodeURIComponent(rawSearch)}`,
      results: businessResults,
    },
    {
      title: "Services",
      amharic: "አገልግሎቶች",
      href: `/services?search=${encodeURIComponent(rawSearch)}`,
      results: serviceResults,
    },
  ];

  const totalResults = groupedResults.reduce(
    (total, group) => total + group.results.length,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-[#043820] via-[#087531] to-[#07532f] px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold text-white/80 transition hover:text-yellow-300"
          >
            ← Back to Home
          </Link>

          <div className="mt-6 max-w-3xl">
            <p className="font-black uppercase tracking-wider text-yellow-300">
              Habeshawi Global Search
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-5xl">
              Search All Categories
            </h1>

            <p className="mt-4 text-lg leading-8 text-white/80">
              Search rentals, marketplace items, jobs, businesses and community
              services from one place.
            </p>
          </div>

          <form
            action="/search"
            className="mt-8 flex max-w-4xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
          >
            <label htmlFor="global-search" className="sr-only">
              Search all categories
            </label>

            <div className="flex min-w-0 flex-1 items-center">
              <span className="pl-4 text-xl text-slate-400">🔎</span>

              <input
                id="global-search"
                name="search"
                type="search"
                defaultValue={rawSearch}
                placeholder="Search apartments, cars, jobs, restaurants..."
                className="min-w-0 flex-1 rounded-xl px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-[#064d2b] transition hover:bg-yellow-300"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {!rawSearch ? (
          <div className="mx-auto max-w-7xl px-6 py-10">
  <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="font-bold text-[#087531]">
        {rawSearch ? "Search results for" : "All Categories"}
      </p>

      <h2 className="mt-1 text-3xl font-black text-slate-900">
        {rawSearch ? `“${rawSearch}”` : "Browse Everything"}
      </h2>
    </div>

    <p className="rounded-full bg-white px-5 py-2 font-bold text-slate-600 shadow-sm">
      {totalResults} {totalResults === 1 ? "result" : "results"}
    </p>
  </div>

  {totalResults === 0 ? (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="text-5xl">📭</div>

      <h2 className="mt-5 text-2xl font-black text-slate-900">
        No results found
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Try another word, a broader category or a nearby city.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
      >
        Return Home
      </Link>
    </div>
  ) : (
    <div className="space-y-12">
      {groupedResults.map((group) => {
        if (group.results.length === 0) {
          return null;
        }

        return (
          <section key={group.title}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-[#064d2b]">
                  {group.title}
                </h2>

                <p className="mt-1 font-bold text-[#087531]">
                  {group.amharic}
                </p>
              </div>

              <Link
                href={group.href}
                className="font-black text-[#087531] transition hover:underline"
              >
                View all {group.title} →
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {group.results.map((result) => (
                <ResultCard
                  key={`${result.type}-${result.id}`}
                  result={result}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  )}
</div>
        ) : (
          <>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-bold text-[#087531]">Search results for</p>

                <h2 className="mt-1 text-3xl font-black text-slate-900">
                  “{rawSearch}”
                </h2>
              </div>

              <p className="rounded-full bg-white px-5 py-2 font-bold text-slate-600 shadow-sm">
                {totalResults} {totalResults === 1 ? "result" : "results"}
              </p>
            </div>

            {totalResults === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="text-5xl">📭</div>

                <h2 className="mt-5 text-2xl font-black text-slate-900">
                  No results found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-slate-600">
                  Try another word, a broader category or a nearby city.
                </p>

                <Link
                  href="/"
                  className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
                >
                  Return Home
                </Link>
              </div>
            ) : (
              <div className="space-y-12">
                {groupedResults.map((group) => {
                  if (group.results.length === 0) {
                    return null;
                  }

                  return (
                    <section key={group.title}>
                      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <h2 className="text-3xl font-black text-[#064d2b]">
                            {group.title}
                          </h2>

                          <p className="mt-1 font-bold text-[#087531]">
                            {group.amharic}
                          </p>
                        </div>

                        <Link
                          href={group.href}
                          className="font-black text-[#087531] transition hover:underline"
                        >
                          View all {group.title} →
                        </Link>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {group.results.map((result) => (
                          <ResultCard
                            key={`${result.type}-${result.id}`}
                            result={result}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}