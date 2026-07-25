import Image from "next/image";
import Link from "next/link";
import type { Business } from "@/types/business";

type BusinessCardProps = {
  business: Business;
};

export default function BusinessCard({
  business,
}: BusinessCardProps) {
  const location =
    [business.city, business.state].filter(Boolean).join(", ") ||
    "Location unavailable";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 p-4">
        <div className="relative h-40 w-40 overflow-hidden rounded-3xl bg-white shadow-lg">
          <Image
            src={business.logoImageUrl || "/business/default-logo.jpg"}
            alt={`${business.name} logo`}
            fill
            sizes="160px"
            className="object-contain p-2"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-[#064d2b]">
              {business.category}
            </span>

            <h2 className="mt-3 text-xl font-black text-slate-900">
              {business.name}
            </h2>
          </div>

          {business.featured ? (
            <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-black">
              Featured
            </span>
          ) : null}
        </div>

        <p className="mt-2 text-sm font-semibold text-slate-500">
          {location}
        </p>

        <p className="mt-4 line-clamp-3 min-h-[72px] leading-6 text-slate-600">
          {business.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            {typeof business.rating === "number" ? (
              <p className="text-sm font-bold text-slate-800">
                <span className="text-yellow-500">★</span>{" "}
                {business.rating.toFixed(1)}
                <span className="font-medium text-slate-500">
                  {" "}
                  ({business.reviewCount ?? 0})
                </span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-500">
                New listing
              </p>
            )}
          </div>

          <Link
            href={`/businesses/${business.id}`}
            className="rounded-xl bg-[#064d2b] px-4 py-2.5 text-sm font-black text-white transition group-hover:bg-[#0a6b3c]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
