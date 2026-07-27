import Link from "next/link";

import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { getApprovedServices } from "@/lib/services/queries";

function getServiceIcon(category: string): string {
  const value = category.toLowerCase();

  if (value.includes("tax") || value.includes("account")) return "🧾";
  if (value.includes("immigration")) return "🛂";
  if (value.includes("translation")) return "🌐";
  if (value.includes("real estate")) return "🏡";
  if (value.includes("insurance")) return "🛡️";
  if (value.includes("travel")) return "✈️";
  if (value.includes("legal")) return "⚖️";
  if (value.includes("clean")) return "🧹";
  if (value.includes("repair")) return "🛠️";
  if (value.includes("beauty") || value.includes("hair")) return "💇";
  if (value.includes("transport")) return "🚐";

  return "🤝";
}

export default async function CommunityServices() {
  const services = await getApprovedServices(6);

  return (
    <Section tone="white">
      <SectionHeader
        eyebrow="Trusted Community Support"
        title="Community Services"
        description="Discover newly approved professionals and essential services serving the Habesha community."
        amharic="የማህበረሰብ አገልግሎቶች"
        actionHref="/services"
        actionLabel="View All Services"
      />

      {services.length === 0 ? (
        <Card
          padding="lg"
          className="border-dashed bg-slate-50 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            <span aria-hidden="true">🤝</span>
          </div>

          <h3 className="mt-5 text-2xl font-black text-slate-900">
            No Approved Services Yet
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Approved community services will appear here automatically.
          </p>

          <Link
            href="/services/post"
            className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
          >
            Post a Service
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const location =
              [service.city, service.state]
                .filter(Boolean)
                .join(", ") || "DMV Area";

            return (
              <Link
                key={service.id}
                href="/services"
                className="group block h-full"
              >
                <Card hover padding="none" className="h-full overflow-hidden">
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-green-50">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.serviceName}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-6xl" aria-hidden="true">
                        {getServiceIcon(service.category)}
                      </span>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-[#087531] px-3 py-1 text-xs font-black text-white shadow">
                      {service.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="line-clamp-1 text-xl font-black text-slate-900 transition group-hover:text-[#087531]">
                      {service.serviceName}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      <span aria-hidden="true">📍</span> {location}
                    </p>

                    <p className="mt-3 line-clamp-3 leading-6 text-slate-600">
                      {service.description}
                    </p>

                    {service.price && (
                      <p className="mt-4 font-black text-[#087531]">
                        {service.price}
                      </p>
                    )}

                    <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#087531]">
                      View Service
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
            );
          })}
        </div>
      )}
    </Section>
  );
}