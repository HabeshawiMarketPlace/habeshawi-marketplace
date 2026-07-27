"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Service = {
  id: string;
  service_name: string;
  category: string;
  description: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setServices((data as Service[] | null) ?? []);
    } catch (error) {
      console.error("Services loading error:", error);

      setServices([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load services."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const categories = Array.from(
    new Set(services.map((service) => service.category).filter(Boolean))
  ).sort();

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredServices = services.filter((service) => {
    const matchesCategory =
      categoryFilter === "all" || service.category === categoryFilter;

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      service.service_name,
      service.category,
      service.description,
      service.contact_name,
      service.city,
      service.state,
      service.zip,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(normalizedSearch)
      );
  });

  function formatLocation(service: Service) {
    return [service.city, service.state, service.zip]
      .filter(Boolean)
      .join(", ");
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6 sm:py-14">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#087531]">
              Habeshawi Marketplace
            </p>

            <h1 className="mt-3 text-4xl font-black text-[#064d2b] sm:text-5xl">
              Services
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Discover trusted local professionals and businesses serving the
              Habeshawi community.
            </p>
          </div>

          <Link
            href="/services/post"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
          >
            Post a Service
          </Link>
        </div>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr_auto] lg:items-end">
            <div>
              <label
                htmlFor="categoryFilter"
                className="mb-2 block font-bold text-slate-800"
              >
                Category
              </label>

              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="all">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="serviceSearch"
                className="mb-2 block font-bold text-slate-800"
              >
                Search
              </label>

              <input
                id="serviceSearch"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search services, categories, or locations"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadServices()}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="mt-10">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-black text-[#064d2b]">
                Available Services
              </h2>

              <p className="mt-2 text-slate-600">
                {filteredServices.length} approved service
                {filteredServices.length === 1 ? "" : "s"} found.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <p className="font-bold text-slate-600">
                Loading services...
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <h3 className="text-2xl font-black text-slate-800">
                No approved services found
              </h3>

              <p className="mt-3 text-slate-500">
                Try a different search or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => {
                const location = formatLocation(service);

                return (
                  <article
                    key={service.id}
                    className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black uppercase text-green-800">
                          {service.category}
                        </span>

                        <h3 className="mt-4 text-2xl font-black text-slate-900">
                          {service.service_name}
                        </h3>
                      </div>

                      <span className="text-4xl" aria-hidden="true">
                        🛠️
                      </span>
                    </div>

                    <p className="mt-5 line-clamp-4 whitespace-pre-wrap leading-7 text-slate-600">
                      {service.description}
                    </p>

                    <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-sm">
                      {location && (
                        <DetailRow label="Location" value={location} />
                      )}

                      {service.contact_name && (
                        <DetailRow
                          label="Contact"
                          value={service.contact_name}
                        />
                      )}

                      {service.price && (
                        <DetailRow label="Price" value={service.price} />
                      )}
                    </div>

                    <div className="mt-auto grid gap-3 pt-6">
                      {service.phone && (
                        <a
                          href={`tel:${service.phone}`}
                          className="rounded-xl bg-[#087531] px-5 py-3 text-center font-black text-white transition hover:bg-[#064d2b]"
                        >
                          Call {service.phone}
                        </a>
                      )}

                      {service.email && (
                        <a
                          href={`mailto:${service.email}`}
                          className="rounded-xl border border-slate-300 px-5 py-3 text-center font-black text-slate-700 transition hover:bg-slate-50"
                        >
                          Email Provider
                        </a>
                      )}

                      {service.website && (
                        <a
                          href={service.website}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-[#087531] px-5 py-3 text-center font-black text-[#087531] transition hover:bg-green-50"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}