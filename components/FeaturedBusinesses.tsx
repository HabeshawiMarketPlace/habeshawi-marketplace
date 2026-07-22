import Link from "next/link";
import Image from "next/image";
import { getBusinesses } from "@/lib/businesses/queries";

export default async function FeaturedBusinesses() {
  const businesses = await getBusinesses();

  const featured = businesses.slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Featured Businesses
          </h2>

          <p className="mt-2 text-slate-600">
            Discover trusted Ethiopian-owned businesses in your community.
          </p>
        </div>

        <Link
          href="/businesses"
          className="rounded-lg bg-green-700 px-5 py-3 text-white transition hover:bg-green-800"
        >
          Explore Businesses →
        </Link>
      </div>

      {featured.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-slate-500">
          No businesses available yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((business) => (
            <Link
              key={business.id}
              href={`/businesses/${business.id}`}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 bg-slate-100">
<Image
  src={business.coverImageUrl || "/business/business.png"}
  alt={business.name}
  fill
  className="object-cover"
/>
              </div>

              <div className="p-5">
                <h3 className="line-clamp-1 text-lg font-semibold">
                  {business.name}
                </h3>

                <p className="mt-2 text-sm font-medium text-green-700">
                  {business.category}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {business.city}, {business.state}
                </p>

                {business.rating && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="font-medium">
                      {business.rating.toFixed(1)}
                    </span>

                    {business.reviewCount ? (
                      <span className="text-slate-500">
                        ({business.reviewCount})
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}