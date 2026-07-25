import Link from "next/link";
import Image from "next/image";

import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";

import { getLatestRentals } from "@/lib/housing/queries";
import { getMarketplaceListings } from "@/lib/marketplace/queries";
import { getApprovedJobs } from "@/lib/jobs/queries";
import { getBusinesses } from "@/lib/businesses/queries";

type RecentItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: string;
  image: string;
  href: string;
};

export default async function RecentlyAdded() {
  const [rentals, marketplaceListings, jobs, businesses] =
    await Promise.all([
      getLatestRentals(1),
      getMarketplaceListings(),
      getApprovedJobs(),
      getBusinesses(),
    ]);

  const rental = rentals[0];
  const marketplaceListing = marketplaceListings[0];
  const job = jobs[0];
  const business = businesses[0];

  const recentItems: RecentItem[] = [];

  if (rental) {
    recentItems.push({
      id: `rental-${rental.id}`,
      title: rental.title,
      category: rental.propertyType || "Rental",
      location: rental.location,
      price: `$${rental.price.toLocaleString()}/month`,
      image: rental.imageUrl || "/housing/default-rental.jpg",
      href: `/housing/${rental.id}`,
    });
  }

  if (marketplaceListing) {
    const marketplaceLocation =
      [marketplaceListing.city, marketplaceListing.state]
        .filter(Boolean)
        .join(", ") || "Location not provided";

    recentItems.push({
      id: `marketplace-${marketplaceListing.id}`,
      title: marketplaceListing.title,
      category: marketplaceListing.category || "Marketplace",
      location: marketplaceLocation,
      price: `$${Number(
        marketplaceListing.price ?? 0,
      ).toLocaleString()}`,
      image:
        marketplaceListing.imageUrl ||
        "/marketplace/default-marketplace.jpg",
      href: `/marketplace/${marketplaceListing.id}`,
    });
  }

  if (job) {
    const jobLocation = job.location || "Location not provided";

    recentItems.push({
      id: `job-${job.id}`,
      title: job.title || "Job Opportunity",
      category:
        job.employmentType ||
        "Job",
      location: jobLocation,
      price: "View Position",
      image: "/jobs/default-job.jpg",
      href: `/jobs/${job.id}`,
    });
  }

  if (business) {
    const businessLocation =
      [business.city, business.state]
        .filter(Boolean)
        .join(", ") || "Location not provided";

    recentItems.push({
      id: `business-${business.id}`,
      title: business.name,
      category: business.category || "Business",
      location: businessLocation,
      price: business.featured
        ? "Featured Business"
        : "View Business",
      image:
        business.coverImageUrl ||
        business.logoImageUrl ||
        "/business/default-business.jpg",
      href: `/businesses/${business.id}`,
    });
  }

  recentItems.push({
    id: "services-default",
    title: "Community Services",
    category: "Services",
    location: "DMV Area",
    price: "Browse Services",
    image: "/services/default-service.jpg",
    href: "/services",
  });

  recentItems.push({
    id: "promotion-default",
    title: "Promote Your Business",
    category: "Promotion",
    location: "Habeshawi Marketplace",
    price: "View Promotion Options",
    image: "/promotion/default-promotion.jpg",
    href: "/promotion",
  });

  return (
    <Section tone="soft">
      <SectionHeader
        eyebrow="Fresh Listings"
        title="Recently Added"
        description="Discover the newest rentals, marketplace listings, jobs, businesses, services, and promotions."
        amharic="አዲስ የተጨመሩ ዝርዝሮች"
        actionHref="/marketplace"
        actionLabel="Browse Listings"
      />

      {recentItems.length === 0 ? (
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
            New rentals, products, jobs, businesses, services, and
            promotions will appear here after approval.
          </p>

          <div className="mt-6">
            <Link
              href="/post-ad"
              className="inline-flex rounded-xl bg-[#087531] px-5 py-3 font-bold text-white transition hover:bg-[#064d2b]"
            >
              Post an Ad
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group block h-full"
            >
              <Card
                hover
                padding="none"
                className="h-full overflow-hidden"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />

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




