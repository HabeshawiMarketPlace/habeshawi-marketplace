import Link from "next/link";

type PostingOption = {
  title: string;
  description: string;
  details: string;
  href: string;
  buttonText: string;
  icon: string;
};

const postingOptions: PostingOption[] = [
  {
    title: "Post a Rental",
    description:
      "List a room, apartment, house, roommate space, or commercial property.",
    details: "Rooms • Apartments • Houses • Commercial Properties • Roommates",
    href: "/post-ad/rental",
    buttonText: "Post Rental",
    icon: "🏠",
  },
  {
    title: "Sell an Item",
    description:
      "Post products such as cars, phones, electronics, furniture, clothing, and more.",
    details: "Vehicles • Electronics • Furniture • Clothing • Equipment",
    href: "/marketplace/post",
    buttonText: "Post Marketplace Item",
    icon: "🛍️",
  },
  {
    title: "Post a Job",
    description:
      "Advertise an available position and connect with job seekers in the community.",
    details: "Full-Time • Part-Time • Contract • Temporary",
    href: "/jobs/post",
    buttonText: "Post Job",
    icon: "💼",
  },
  {
    title: "Add a Business",
    description:
      "Create a profile for your restaurant, store, professional service, or organization.",
    details: "Restaurants • Stores • Professionals • Community Organizations",
    href: "/businesses/post",
    buttonText: "Add Business",
    icon: "🏢",
  },
  {
    title: "Post a Service",
    description:
      "Advertise your professional service, trade, skill, or community service.",
    details:
      "Tax • Immigration • Cleaning • Legal • Real Estate • IT • Transportation",
    href: "/services/post",
    buttonText: "Post Service",
    icon: "🛠️",
  },
  {
    title: "Create a Promotion",
    description:
      "Promote your business, event, special offer, product, or service.",
    details: "Business Offers • Events • Specials • Announcements",
    href: "/promotion/post",
    buttonText: "Create Promotion",
    icon: "📢",
  },
];

export default function PostAdPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6 sm:py-14">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-green-100 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#087531]">
            Habeshawi Marketplace
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#064d2b] sm:text-5xl">
            Post an Ad
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Choose the type of listing you would like to create. Each option
            has a form designed specifically for that listing.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {postingOptions.map((option) => (
            <article
              key={option.title}
              className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-4xl">
                <span aria-hidden="true">{option.icon}</span>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[#064d2b]">
                {option.title}
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {option.description}
              </p>

              <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
                {option.details}
              </p>

              <div className="mt-auto pt-7">
                <Link
                  href={option.href}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#087531] px-5 py-3 font-bold text-white transition hover:bg-[#064d2b] focus:outline-none focus:ring-2 focus:ring-[#087531] focus:ring-offset-2"
                >
                  {option.buttonText}
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-7 sm:p-9">
          <h2 className="text-2xl font-bold text-amber-950">
            Need help choosing?
          </h2>

          <div className="mt-5 grid gap-5 text-sm leading-6 text-amber-950 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="font-bold">Rentals</h3>
              <p className="mt-1">
                Use this for rooms, apartments, houses, roommates, commercial
                properties, office space, retail space, restaurants, and other
                commercial listings.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Marketplace</h3>
              <p className="mt-1">
                Use this for cars, phones, electronics, furniture, clothing,
                equipment, and other items.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Jobs</h3>
              <p className="mt-1">
                Use this when an employer or business wants to advertise an
                available position.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Businesses</h3>
              <p className="mt-1">
                Use this to create a directory profile for a restaurant, store,
                company, or community organization.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Services</h3>
              <p className="mt-1">
                Use this to advertise professional services, skilled trades,
                home services, consulting, transportation, tutoring, and more.
              </p>
            </div>

            <div>
              <h3 className="font-bold">Promotions</h3>
              <p className="mt-1">
                Use this to advertise a special offer, event, service, or
                business announcement.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}