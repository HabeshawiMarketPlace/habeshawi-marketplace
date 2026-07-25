import Link from "next/link";
import { notFound } from "next/navigation";
import BusinessCard from "@/components/businesses/BusinessCard";
import Image from "next/image";
import {
  getBusinessById,
  getSimilarBusinesses,
} from "@/lib/businesses/queries";
import { sampleBusinesses } from "@/lib/businesses/sample-data";

type BusinessDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return sampleBusinesses.map((business) => ({ id: business.id }));
}

export default async function BusinessDetailsPage({
  params,
}: BusinessDetailsPageProps) {
  const { id } = await params;
  const business = await getBusinessById(id);

  if (!business) {
    notFound();
  }

  const similarBusinesses = await getSimilarBusinesses(business);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    business.address,
  )}`;

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/businesses"
          className="inline-flex items-center gap-2 font-bold text-[#064d2b] hover:underline"
        >
          ← Back to businesses
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
<div className="flex min-h-64 items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-red-100 px-6 py-12">
<div className="relative h-40 w-40 overflow-hidden rounded-3xl bg-white p-2 shadow-xl">
  <Image
    src={
      business.logoImageUrl ||
      "/business/default-logo.jpg"
    }
    alt={`${business.name} logo`}
    fill
    sizes="160px"
    className="object-contain p-2"
  />
</div>
</div>

          <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.5fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-black text-[#064d2b]">
                  {business.category}
                </span>
                {business.featured ? (
                  <span className="rounded-full bg-yellow-300 px-3 py-1 text-sm font-black text-black">
                    Featured
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-3 py-1 text-sm font-black ${
                    business.openNow
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {business.openNow ? "Open now" : "Currently closed"}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-black text-slate-950 md:text-5xl">
                {business.name}
              </h1>

              <p className="mt-3 font-semibold text-slate-500">
                {business.city}, {business.state}
              </p>

              {typeof business.rating === "number" ? (
                <p className="mt-4 text-lg font-black text-slate-800">
                  <span className="text-yellow-500">★</span>{" "}
                  {business.rating.toFixed(1)}
                  <span className="ml-2 text-sm font-semibold text-slate-500">
                    ({business.reviewCount ?? 0} reviews)
                  </span>
                </p>
              ) : null}

              <section className="mt-8">
                <h2 className="text-2xl font-black text-slate-900">
                  About this business
                </h2>
                <p className="mt-4 whitespace-pre-line text-lg leading-8 text-slate-600">
                  {business.description}
                </p>
              </section>

              {business.specialties?.length ? (
                <section className="mt-8">
                  <h2 className="text-2xl font-black text-slate-900">
                    Services and specialties
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-900"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-xl font-black text-slate-900">
                  Contact information
                </h2>
                <dl className="mt-5 space-y-4 text-sm">
                  <div>
                    <dt className="font-black text-slate-500">Address</dt>
                    <dd className="mt-1 leading-6 text-slate-800">
                      {business.address}
                    </dd>
                  </div>
                  {business.phone ? (
                    <div>
                      <dt className="font-black text-slate-500">Phone</dt>
                      <dd className="mt-1 text-slate-800">{business.phone}</dd>
                    </div>
                  ) : null}
                  {business.email ? (
                    <div>
                      <dt className="font-black text-slate-500">Email</dt>
                      <dd className="mt-1 break-all text-slate-800">
                        {business.email}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {business.phone ? (
                    <a
                      href={`tel:${business.phone}`}
                      className="rounded-xl bg-[#064d2b] px-4 py-3 text-center font-black text-white transition hover:bg-[#0a6b3c]"
                    >
                      Call
                    </a>
                  ) : null}
                  {business.email ? (
                    <a
                      href={`mailto:${business.email}`}
                      className="rounded-xl border border-[#064d2b] px-4 py-3 text-center font-black text-[#064d2b] transition hover:bg-green-50"
                    >
                      Email
                    </a>
                  ) : null}
                  {business.website ? (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-300 px-4 py-3 text-center font-black text-slate-800 transition hover:bg-white"
                    >
                      Website
                    </a>
                  ) : null}
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-yellow-400 px-4 py-3 text-center font-black text-black transition hover:bg-yellow-300"
                  >
                    Directions
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-black text-slate-900">
                  Business hours
                </h2>
                <div className="mt-5 space-y-3">
                  {business.hours.map(({ day, hours }) => (
                    <div
                      key={day}
                      className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"
                    >
                      <span className="font-bold text-slate-700">{day}</span>
                      <span className="text-right text-slate-500">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {similarBusinesses.length > 0 ? (
          <section className="mt-12">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#064d2b]">
                More in {business.category}
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                You may also like
              </h2>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {similarBusinesses.map((similarBusiness) => (
                <BusinessCard
                  key={similarBusiness.id}
                  business={similarBusiness}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
