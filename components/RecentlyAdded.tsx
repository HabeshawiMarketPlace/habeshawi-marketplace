import Link from "next/link";
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
  const job = jobs[0] as any;
  const business = businesses[0];

  const recentItems: RecentItem[] = [];

  if (rental) {
    recentItems.push({
      id: `rental-${rental.id}`,
      title: rental.title,
      category: rental.propertyType || "Rental",
      location: rental.location,
      price: `$${rental.price.toLocaleString()}/month`,
      image:
        rental.imageUrl ||
        "/housing/default-rental.jpg",
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
      category:
        marketplaceListing.category || "Marketplace",
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
    const jobLocation =
      job.location ||
      [job.city, job.state].filter(Boolean).join(", ") ||
      "Location not provided";

    recentItems.push({
      id: `job-${job.id}`,
      title: job.title || "Job Opportunity",
      category:
        job.employmentType ||
        job.employment_type ||
        "Job",
      location: jobLocation,
      price:
        job.salary ||
        job.salaryRange ||
        job.salary_range ||
        "View Position",
      image:
        job.imageUrl ||
        job.image_url ||
        "/jobs/default-job.jpg",
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
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Recently Added
          </h2>

          <p className="mt-2 text-slate-600">
            Discover the newest rentals, marketplace listings,
            jobs, businesses, services, and promotions.
          </p>
        </div>

        <Link
          href="/marketplace"
          className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
        >
          Browse Listings →
        </Link>
      </div>

      {recentItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h3 className="text-xl font-bold text-slate-800">
            No recent listings yet
          </h3>

          <p className="mt-2 text-slate-600">
            New rentals, products, jobs, businesses, services,
            and promotions will appear here after approval.
          </p>

          <Link
            href="/post-ad"
            className="mt-6 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
          >
            Post an Ad
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <span className="absolute left-3 top-3 rounded-full bg-green-700 px-3 py-1 text-xs font-bold capitalize text-white shadow">
                  {item.category}
                </span>
              </div>

              <div className="p-5">
                <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                  📍 {item.location}
                </p>

                <p className="mt-3 text-lg font-bold text-green-700">
                  {item.price}
                </p>

                <p className="mt-4 font-semibold text-green-700">
                  View Details →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}