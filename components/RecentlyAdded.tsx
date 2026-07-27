import Link from "next/link";

import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";

import { getLatestRentals } from "@/lib/housing/queries";
import { getMarketplaceListings } from "@/lib/marketplace/queries";
import { getApprovedJobs } from "@/lib/jobs/queries";
import { getBusinesses } from "@/lib/businesses/queries";
import { getApprovedServices } from "@/lib/services/queries";

type RecentItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: string;
  image: string | null;
  fallbackIcon: string;
  href: string;
  createdAt: string;
};

function validDateValue(value: string | undefined): number {
  const timestamp = new Date(value ?? "").getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default async function RecentlyAdded() {
  const [
    rentals,
    marketplaceListings,
    jobs,
    businesses,
    services,
  ] = await Promise.all([
    getLatestRentals(3),
    getMarketplaceListings({ limit: 3 }),
    getApprovedJobs({ limit: 3 }),
    getBusinesses(),
    getApprovedServices(3),
  ]);

  const recentItems: RecentItem[] = [];

  for (const rental of rentals) {
    recentItems.push({
      id: `rental-${rental.id}`,
      title: rental.title,
      category: rental.propertyType || "Rental",
      location: rental.location,
      price: `$${rental.price.toLocaleString("en-US")}/month`,
      image: rental.imageUrl || null,
      fallbackIcon: "🏠",
      href: `/housing/${rental.id}`,
      createdAt: rental.createdAt,
    });
  }

  for (const listing of marketplaceListings) {
    const location =
      [listing.city, listing.state].filter(Boolean).join(", ") ||
      "Location not provided";

    recentItems.push({
      id: `marketplace-${listing.id}`,
      title: listing.title,
      category: listing.category || "Marketplace",
      location,
      price: `$${Number(listing.price ?? 0).toLocaleString("en-US")}`,
      image: listing.imageUrl || null,
      fallbackIcon: "🛍️",
      href: `/marketplace/${listing.id}`,
      createdAt: listing.createdAt,
    });
  }

  for (const job of jobs) {
    recentItems.push({
      id: `job-${job.id}`,
      title: job.title || "Job Opportunity",
      category: job.employmentType || "Job",
      location: job.location || "Location not provided",
      price: "View Position",
      image: null,
      fallbackIcon: "💼",
      href: `/jobs/${job.id}`,
      createdAt: job.createdAt,
    });
  }

  for (const service of services) {
    const location =
      [service.city, service.state].filter(Boolean).join(", ") ||
      "DMV Area";

    recentItems.push({
      id: `service-${service.id}`,
      title: service.serviceName,
      category: service.category || "Service",
      location,
      price: service.price || "View Service",
      image: service.imageUrl,
      fallbackIcon: "🤝",
      href: "/services",
      createdAt: service.createdAt,
    });
  }

  const business = businesses[0];

  if (business) {
    const businessLocation =
      [business.city, business.state].filter(Boolean).join(", ") ||
      "Location not provided";

    recentItems.push({
      id: `business-${business.id}`,
      title: business.name,
      category: business.category || "Business",
      location: businessLocation,
      price: business.featured ? "Featured Business" : "View Business",
      image: business.coverImageUrl || business.logoImageUrl || null,
      fallbackIcon: "🏢",
      href: `/businesses/${business.id}`,
      createdAt: new Date(0).toISOString(),
    });
  }

  const newestItems = recentItems
    .sort(
      (first, second) =>
        validDateValue(second.createdAt) -
        validDateValue(first.createdAt),
    )
    .slice(0, 6);

  return (
    <Section tone="soft">
      <SectionHeader
        eyebrow="Fresh Listings"
        title="Recently Added"
        description="Discover the newest approved rentals, marketplace listings, jobs, businesses, and community services."
        amharic="አዲስ የተጨመሩ ዝርዝሮች"
        actionHref="/marketplace"
        actionLabel="Browse Listings"
      />

      {newestItems.length === 0 ? (
        <Card
          padding="lg"
          className="border-dashed bg-white text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            <span aria-hidden="true">📦</span>
          </div>

          <h3 className="mt-5 text-2xl font-black text-slate-900">
            No Recent Listings Yet
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Newly approved posts will appear here automatically.
          </p>

          <Link
            href="/post-ad"
            className="mt-6 inline-flex rounded-xl bg-[#087531] px-5 py-3 font-bold text-white transition hover:bg-[#064d2b]"
          >
            Post an Ad
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {newestItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group block h-full"
            >
              <Card hover padding="none" className="h-full overflow-hidden">
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-6xl" aria-hidden="true">
                      {item.fallbackIcon}
                    </span>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-[#087531] px-3 py-1 text-xs font-black capitalize text-white shadow">
                    {item.category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="line-clamp-1 text-xl font-black text-slate-900 transition group-hover:text-[#087531]">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                    <span aria-hidden="true">📍</span> {item.location}
                  </p>

                  <p className="mt-4 text-lg font-black text-[#087531]">
                    {item.price}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#087531]">
                    View Details
                    <span
                      aria-hidden="true"
                      className="transition group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}