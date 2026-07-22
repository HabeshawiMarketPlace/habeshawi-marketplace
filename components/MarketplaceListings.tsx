import Image from "next/image";
import Link from "next/link";
import FeaturedMarketplace from "@/components/marketplace/FeaturedMarketplace";

const listings = [
  {
    id: 1,
    title: "2019 Toyota Camry",
    category: "Cars",
    price: "$18,500",
    location: "Silver Spring, Maryland",
    image: "/listings/car.jpg",
    description:
      "Clean, reliable sedan with excellent fuel economy and a well-maintained interior.",
  },
  {
    id: 2,
    title: "iPhone 14 Pro",
    category: "Phones",
    price: "$650",
    location: "Washington, DC",
    image: "/listings/iphone.jpg",
    description:
      "Unlocked iPhone in excellent condition with strong battery health and no major damage.",
  },
  {
    id: 3,
    title: "Restaurant Equipment Package",
    category: "Business Equipment",
    price: "$7,500",
    location: "Alexandria, Virginia",
    image: "/listings/restaurant-equipment.jpg",
    description:
      "Commercial equipment package suitable for a restaurant, café, or food-service startup.",
  },
];

export default function MarketplaceListings() {
  return (
    <section className="bg-[#f7f8f5] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-bold uppercase tracking-wider text-[#087531]">
              Buy and Sell Locally
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#064d2b] sm:text-4xl">
              Marketplace Picks
            </h2>

            <p className="mt-2 max-w-2xl text-slate-600">
              Discover vehicles, phones, furniture, equipment, and other items
              available in the Habesha community.
            </p>

            <p className="mt-2 font-semibold text-[#087531]">
              የሐበሻዊ ገበያ ዕቃዎች
            </p>
          </div>

          <Link
            href="/marketplace"
            className="font-bold text-[#087531] transition hover:text-[#064d2b] hover:underline"
          >
            View All Listings →
          </Link>
        </div>

        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <Link
                href={`/marketplace/${listing.id}`}
                aria-label={`View ${listing.title}`}
                className="block"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-black text-[#087531] shadow">
                    {listing.category}
                  </div>
                </div>
              </Link>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/marketplace/${listing.id}`}
                    className="transition hover:text-[#087531]"
                  >
                    <h3 className="text-xl font-black text-slate-900">
                      {listing.title}
                    </h3>
                  </Link>

                  <p className="shrink-0 text-xl font-black text-[#087531]">
                    {listing.price}
                  </p>
                </div>

                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <span aria-hidden="true">📍</span>
                  {listing.location}
                </p>

                <p className="mt-4 min-h-[72px] leading-6 text-slate-600">
                  {listing.description}
                </p>

                <Link
                  href={`/marketplace/${listing.id}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#087531] px-5 py-3 font-bold text-white transition hover:bg-[#064d2b]"
                >
                  View Listing
                  <span
                    aria-hidden="true"
                    className="transition group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-8 lg:px-10">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-3xl font-black text-[#064d2b]">
                Have Something to Sell?
              </h3>

              <p className="mt-3 text-slate-600">
                Post your item and connect directly with buyers in the Habesha
                community.
              </p>

              <Link
                href="/marketplace/post"
                className="mt-5 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-bold text-white transition hover:bg-[#064d2b]"
              >
                Post an Item
              </Link>
            </div>

            <FeaturedMarketplace />
          </div>
        </div>
      </div>
    </section>
  );
}