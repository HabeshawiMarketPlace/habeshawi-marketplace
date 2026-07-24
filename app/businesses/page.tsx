import Link from "next/link";
import BusinessList from "@/components/businesses/BusinessList";
import { getBusinesses } from "@/lib/businesses/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BusinessesPage() {
  const businesses = await getBusinesses();

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl bg-[#064d2b] px-6 py-10 text-white shadow-lg md:px-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-black">
                Habeshawi Business Directory
              </span>
              <h1 className="mt-5 text-4xl font-black md:text-5xl">
                Discover Community Businesses
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-green-50">
                Find Ethiopian and Eritrean restaurants, stores, professional
                services, and trusted local businesses across the DMV area.
              </p>
            </div>

            <Link
              href="/businesses/post"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300"
            >
              Add Your Business — Free
            </Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Restaurants", "Food, catering, and coffee"],
            ["Professional Services", "Tax, legal, and real estate"],
            ["Shopping", "Groceries and local retail"],
            ["Home & Auto", "Repairs and trusted services"],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-black text-[#064d2b]">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </section>

        <BusinessList businesses={businesses} />
      </div>
    </main>
  );
}
