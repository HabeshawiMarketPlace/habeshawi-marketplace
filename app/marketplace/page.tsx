import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import {
  getFeaturedMarketplaceListings,
  getMarketplaceListings,
  getRecentMarketplaceListings,
  type MarketplaceListing,
} from "@/lib/marketplace/queries";

export const dynamic = "force-dynamic";

const categories = [
  "All",
  "Cars",
  "Phones",
  "Electronics",
  "Furniture",
  "Clothing",
  "Restaurant Equipment",
  "Business Equipment",
  "Home & Garden",
  "Tools",
  "Books",
  "Other",
];

type MarketplacePageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

function parsePrice(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const params = await searchParams;

  const search =
   params.search?.trim() ?? "";
  const category = params.category?.trim() || "All";
  const minPrice = parsePrice(params.minPrice);
  const maxPrice = parsePrice(params.maxPrice);

  const isFiltering =
    Boolean(search) ||
    category.toLowerCase() !== "all" ||
    minPrice !== undefined ||
    maxPrice !== undefined;

  let filteredListings: MarketplaceListing[] = [];
  let featuredListings: MarketplaceListing[] = [];
  let recentListings: MarketplaceListing[] = [];
  let errorMessage = "";

  try {
    if (isFiltering) {
      filteredListings = await getMarketplaceListings({
        search,
        category,
        minPrice,
        maxPrice,
      });
    } else {
      [featuredListings, recentListings] = await Promise.all([
        getFeaturedMarketplaceListings(8),
        getRecentMarketplaceListings(12),
      ]);
    }
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Marketplace"
          description="Buy and sell cars, phones, furniture, restaurant equipment, electronics, clothing, and more within the Habeshawi community."
        />

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <form
            action="/marketplace"
            method="GET"
            className="grid gap-4 lg:grid-cols-12"
          >
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search listings, city, or state..."
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#087531] lg:col-span-4"
            />

            <select
              name="category"
              defaultValue={category}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#087531] lg:col-span-3"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Categories" : item}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="minPrice"
              min="0"
              defaultValue={params.minPrice ?? ""}
              placeholder="Min price"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#087531] lg:col-span-2"
            />

            <input
              type="number"
              name="maxPrice"
              min="0"
              defaultValue={params.maxPrice ?? ""}
              placeholder="Max price"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#087531] lg:col-span-2"
            />

            <button
              type="submit"
              className="rounded-xl bg-[#087531] px-6 py-3 font-bold text-white hover:bg-[#065f28] lg:col-span-1"
            >
              Search
            </button>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-12 lg:justify-end">
              {isFiltering && (
                <Link
                  href="/marketplace"
                  className="rounded-xl border border-slate-300 px-6 py-3 text-center font-bold text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </Link>
              )}

              <Link
                href="/marketplace/post"
                className="rounded-xl bg-yellow-400 px-8 py-3 text-center font-bold text-black hover:bg-yellow-300"
              >
                + Post Item
              </Link>
            </div>
          </form>
        </section>

        {errorMessage ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            Unable to load marketplace listings: {errorMessage}
          </div>
        ) : isFiltering ? (
          <section className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-black text-[#064d2b]">
                Search Results
              </h2>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-[#064d2b]">
                {filteredListings.length}{" "}
                {filteredListings.length === 1 ? "Listing" : "Listings"}
              </span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center">
                <h3 className="text-xl font-bold text-slate-800">
                  No marketplace listings matched your search
                </h3>
                <p className="mt-2 text-slate-600">
                  Try another keyword, category, or price range.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredListings.map((listing) => (
                  <MarketplaceCard
                    key={listing.id}
                    href={`/marketplace/${listing.id}`}
                    image={listing.imageUrl || "/eth.png"}
                    title={listing.title}
                    location={
                      [listing.city, listing.state].filter(Boolean).join(", ") ||
                      "Location not provided"
                    }
                    price={listing.price}
                    featured={listing.featured}
                    condition={listing.condition}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-3xl font-black text-[#064d2b]">
                  Featured Listings
                </h2>

                <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-[#064d2b]">
                  Featured
                </span>
              </div>

              {featuredListings.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed bg-white p-8 text-center text-slate-600">
                  No featured listings are available right now.
                </div>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {featuredListings.map((listing) => (
                    <MarketplaceCard
                      key={listing.id}
                      href={`/marketplace/${listing.id}`}
                      image={listing.imageUrl || "/eth.png"}
                      title={listing.title}
                      location={
                        [listing.city, listing.state]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"
                      }
                      price={listing.price}
                      featured={listing.featured}
                      condition={listing.condition}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-3xl font-black text-[#064d2b]">
                  Recently Added
                </h2>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-[#064d2b]">
                  {recentListings.length} Live
                </span>
              </div>

              {recentListings.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed bg-white p-8 text-center text-slate-600">
                  No approved marketplace listings are available right now.
                </div>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {recentListings.map((listing) => (
                    <MarketplaceCard
                      key={listing.id}
                      href={`/marketplace/${listing.id}`}
                      image={listing.imageUrl || "/eth.png"}
                      title={listing.title}
                      location={
                        [listing.city, listing.state]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"
                      }
                      price={listing.price}
                      featured={listing.featured}
                      condition={listing.condition}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}