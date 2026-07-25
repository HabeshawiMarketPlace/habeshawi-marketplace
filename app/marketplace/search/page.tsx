import Image from "next/image";
import Link from "next/link";

const searchResults = [
  {
    id: "iphone-15-pro",
    title: "iPhone 15 Pro",
    price: "$750",
    location: "Silver Spring, MD",
    image: "/phone1.jpg",
    category: "Phones & Electronics",
    description: "Unlocked iPhone in excellent condition.",
  },
  {
    id: "toyota-camry",
    title: "Toyota Camry",
    price: "$18,500",
    location: "Washington, DC",
    image: "/cars1.jpg",
    category: "Cars",
    description: "Clean and reliable vehicle with low mileage.",
  },
  {
    id: "restaurant-equipment",
    title: "Restaurant Equipment",
    price: "$4,500",
    location: "Alexandria, VA",
    image: "/sofa1.jpg",
    category: "Restaurant Equipment",
    description: "Commercial equipment available as a complete package.",
  },
];

type MarketplaceSearchPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};

export default async function MarketplaceSearchPage({
  searchParams,
}: MarketplaceSearchPageProps) {
  const { search } = await searchParams;
  const searchTerm = search?.trim() || "";

  const filteredResults = searchTerm
    ? searchResults.filter((listing) => {
        const searchText = searchTerm.toLowerCase();

        return (
          listing.title.toLowerCase().includes(searchText) ||
          listing.category.toLowerCase().includes(searchText) ||
          listing.location.toLowerCase().includes(searchText) ||
          listing.description.toLowerCase().includes(searchText)
        );
      })
    : searchResults;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link
            href="/marketplace"
            className="font-medium text-green-700 hover:underline"
          >
            ← Back to Marketplace
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Search Marketplace
          </h1>

          <p className="mt-2 text-gray-600">
            Search marketplace listings by item, category, or location.
          </p>
        </div>

        <form
          action="/marketplace/search"
          method="GET"
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row"
        >
          <input
            type="search"
            name="search"
            defaultValue={searchTerm}
            placeholder="Search cars, phones, equipment..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />

          <button
            type="submit"
            className="rounded-lg bg-green-700 px-7 py-3 font-semibold text-white hover:bg-green-800"
          >
            Search
          </button>
        </form>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {searchTerm ? `Results for “${searchTerm}”` : "All Listings"}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {filteredResults.length}{" "}
              {filteredResults.length === 1 ? "listing" : "listings"} found
            </p>
          </div>

          <Link
            href="/marketplace/categories"
            className="hidden font-semibold text-green-700 hover:underline sm:block"
          >
            Browse Categories
          </Link>
        </div>

        {filteredResults.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((listing) => (
              <article
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Link href={`/marketplace/${listing.id}`}>
                  <div className="relative h-56 w-full bg-gray-100">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>

                <div className="p-5">
                  <p className="text-sm font-medium text-green-700">
                    {listing.category}
                  </p>

                  <Link href={`/marketplace/${listing.id}`}>
                    <h3 className="mt-2 text-xl font-bold text-gray-900 hover:text-green-700">
                      {listing.title}
                    </h3>
                  </Link>

                  <p className="mt-3 text-2xl font-bold text-green-700">
                    {listing.price}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {listing.location}
                  </p>

                  <p className="mt-3 text-gray-600">
                    {listing.description}
                  </p>

                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="mt-5 block rounded-lg bg-green-700 px-4 py-2.5 text-center font-semibold text-white hover:bg-green-800"
                  >
                    View Listing
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl">🔎</div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No Listings Found
            </h2>

            <p className="mt-3 text-gray-600">
              Try using a different item, category, or location.
            </p>

            <Link
              href="/marketplace/search"
              className="mt-6 inline-block rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Clear Search
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}


