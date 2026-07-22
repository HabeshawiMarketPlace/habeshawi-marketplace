import Link from "next/link";

const services = [
  {
    id: 1,
    title: "Tax Preparation",
    description:
      "Find trusted tax preparers, accountants, and bookkeeping professionals.",
    icon: "🧾",
  },
  {
    id: 2,
    title: "Immigration Services",
    description:
      "Connect with professionals who provide immigration and document assistance.",
    icon: "🛂",
  },
  {
    id: 3,
    title: "Translation Services",
    description:
      "Find Amharic and English translation and interpretation services.",
    icon: "🌐",
  },
  {
    id: 4,
    title: "Real Estate Services",
    description:
      "Connect with local real estate agents, property managers, and lenders.",
    icon: "🏡",
  },
  {
    id: 5,
    title: "Insurance Services",
    description:
      "Explore auto, home, health, life, and business insurance assistance.",
    icon: "🛡️",
  },
  {
    id: 6,
    title: "Travel Services",
    description:
      "Find flight booking, vacation planning, and travel support services.",
    icon: "✈️",
  },
];

export default function CommunityServices() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="font-bold uppercase tracking-wider text-[#087531]">
            Trusted Community Support
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#064d2b] sm:text-4xl">
            Community Services
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Find trusted professionals and essential services serving the
            Habesha community.
          </p>

          <p className="mt-2 font-semibold text-[#087531]">
            የማህበረሰብ አገልግሎቶች
          </p>
        </div>

        <Link
          href="/services"
          className="rounded-xl bg-[#087531] px-5 py-3 font-bold text-white transition hover:bg-[#064d2b]"
        >
          View All Services →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href="/services"
            className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#087531]/30 hover:shadow-lg"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-3xl transition group-hover:bg-green-100">
              <span aria-hidden="true">{service.icon}</span>
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900 transition group-hover:text-[#087531]">
              {service.title}
            </h3>

            <p className="mt-3 leading-6 text-slate-600">
              {service.description}
            </p>

            <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#087531]">
              Explore Service
              <span
                aria-hidden="true"
                className="transition group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}