"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ServiceRow = {
  id: string;
  service_name?: string | null;
  category?: string | null;
  description?: string | null;
  price?: string | number | null;
  city?: string | null;
  state?: string | null;
  status?: string | null;
  created_at?: string | null;
};

function errorText(error: unknown): string {
  if (!error) return "Unknown database error.";
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const value = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return [
      value.message,
      value.details,
      value.hint,
      value.code ? `Code: ${value.code}` : "",
    ]
      .filter(Boolean)
      .join(" — ");
  }

  return String(error);
}

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not provided"
    : date.toLocaleDateString("en-US");
}

export default function ServicesMyListingsPage() {
  const router = useRouter();

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setPageError("");
    setNotice("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        router.replace("/login?redirect=/services/my-listings");
        return;
      }

      const result = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (result.error) {
        throw new Error(
          `Services could not be loaded: ${errorText(result.error)}`,
        );
      }

      setServices((result.data ?? []) as ServiceRow[]);
    } catch (error) {
      console.error("Unable to load services:", error);
      setServices([]);
      setPageError(errorText(error));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  async function deleteService(service: ServiceRow) {
    const title = service.service_name || "this service";

    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${title}"?`,
      )
    ) {
      return;
    }

    setDeletingId(service.id);
    setPageError("");
    setNotice("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        router.replace("/login?redirect=/services/my-listings");
        return;
      }

      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", service.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setServices((current) =>
        current.filter((item) => item.id !== service.id),
      );

      setNotice("Service deleted successfully.");
    } catch (error) {
      setPageError(
        `Service could not be deleted: ${errorText(error)}`,
      );
    } finally {
      setDeletingId(null);
    }
  }

  const approvedCount = services.filter(
    (service) => service.status?.toLowerCase() === "approved",
  ).length;

  const pendingCount = services.filter(
    (service) => service.status?.toLowerCase() === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-[#064d2b] p-7 text-white shadow-lg sm:p-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
                Habeshawi Marketplace
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                My Services
              </h1>

              <p className="mt-4 text-green-100">
                Manage service listings connected to your account.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/account"
                className="inline-flex rounded-xl border border-white/30 px-6 py-3 font-black text-white hover:bg-white/10"
              >
                Account Dashboard
              </Link>

              <Link
                href="/services/post"
                className="inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-black text-black hover:bg-yellow-300"
              >
                Post a Service
              </Link>
            </div>
          </div>
        </section>

        {pageError && (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-800">
            <p className="font-black">Unable to load your services.</p>
            <p className="mt-2 break-words font-mono text-sm">
              {pageError}
            </p>
          </div>
        )}

        {notice && (
          <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 p-5 text-green-900">
            {notice}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Summary title="All Services" value={services.length} />
          <Summary title="Approved" value={approvedCount} />
          <Summary title="Pending" value={pendingCount} />
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <p className="font-bold text-slate-600">
                Loading your services...
              </p>
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              title="No services found"
              description="Your service listings will appear here after you post them."
              href="/services/post"
              buttonText="Post a Service"
            />
          ) : (
            <div className="grid gap-6">
              {services.map((service) => {
                const location =
                  [service.city, service.state]
                    .filter(Boolean)
                    .join(", ") || "Not provided";

                return (
                  <article
                    key={service.id}
                    className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="flex flex-col justify-between gap-7 lg:flex-row">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-black text-slate-900">
                            {service.service_name || "Untitled Service"}
                          </h2>

                          <Badge value={service.status || "unknown"} />
                        </div>

                        <p className="mt-3 font-black text-[#087531]">
                          {service.category || "Not provided"}
                        </p>

                        <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
                          {service.description || "No description provided."}
                        </p>

                        <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3">
                          <Detail
                            label="Price"
                            value={
                              service.price
                                ? String(service.price)
                                : "Not provided"
                            }
                          />
                          <Detail label="Location" value={location} />
                          <Detail
                            label="Posted"
                            value={formatDate(service.created_at)}
                          />
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-3 lg:w-52">
                        <Link
                          href="/services"
                          className="rounded-xl bg-[#087531] px-5 py-3 text-center font-black text-white hover:bg-[#064d2b]"
                        >
                          View Services
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === service.id}
                          onClick={() => void deleteService(service)}
                          className="rounded-xl border border-red-300 px-5 py-3 font-black text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === service.id
                            ? "Deleting..."
                            : "Delete Service"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Summary({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <p className="font-bold text-slate-600">{title}</p>
      <p className="mt-3 text-4xl font-black text-[#064d2b]">
        {value}
      </p>
    </div>
  );
}

function Badge({ value }: { value: string }) {
  const normalized = value.toLowerCase();

  const classes =
    normalized.includes("approved")
      ? "bg-green-100 text-green-800"
      : normalized.includes("pending")
        ? "bg-yellow-100 text-yellow-800"
        : normalized.includes("rejected")
          ? "bg-red-100 text-red-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${classes}`}
    >
      {value}
    </span>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  href,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
      <h2 className="text-2xl font-black text-slate-800">{title}</h2>
      <p className="mt-3 text-slate-600">{description}</p>
      <Link
        href={href}
        className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white"
      >
        {buttonText}
      </Link>
    </div>
  );
}