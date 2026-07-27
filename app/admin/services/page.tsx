"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ServiceStatus = "pending" | "approved" | "rejected";

type Service = {
  id: string;
  user_id: string;
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
  status: ServiceStatus;
  created_at: string;
};

type StatusFilter = "all" | ServiceStatus;

export default function AdminServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("pending");

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const verifyAdmin = useCallback(async () => {
    setCheckingAdmin(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.replace("/login?redirect=/admin/services");
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profile?.role !== "admin") {
        router.replace("/account");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Admin verification error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to verify administrator access."
      );

      return false;
    } finally {
      setCheckingAdmin(false);
    }
  }, [router]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      let query = supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

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
  }, [statusFilter]);

  useEffect(() => {
    async function initializePage() {
      const isAdmin = await verifyAdmin();

      if (isAdmin) {
        await loadServices();
      }
    }

    void initializePage();
  }, [verifyAdmin, loadServices]);

  async function updateServiceStatus(
    serviceId: string,
    status: ServiceStatus
  ) {
    setActionId(serviceId);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("services")
        .update({ status })
        .eq("id", serviceId);

      if (error) {
        throw error;
      }

      setMessage(`Service status changed to ${status}.`);
      await loadServices();
    } catch (error) {
      console.error("Service status update error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the service."
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteService(serviceId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service permanently?"
    );

    if (!confirmed) {
      return;
    }

    setActionId(serviceId);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) {
        throw error;
      }

      setMessage("Service deleted successfully.");
      await loadServices();
    } catch (error) {
      console.error("Service deletion error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete the service."
      );
    } finally {
      setActionId(null);
    }
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredServices = services.filter((service) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    return [
      service.service_name,
      service.category,
      service.description,
      service.contact_name,
      service.email,
      service.phone,
      service.city,
      service.state,
      service.zip,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(normalizedSearchTerm)
      );
  });

  const pendingCount = services.filter(
    (service) => service.status === "pending"
  ).length;

  const approvedCount = services.filter(
    (service) => service.status === "approved"
  ).length;

  const rejectedCount = services.filter(
    (service) => service.status === "rejected"
  ).length;

  if (checkingAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-lg font-bold text-[#064d2b]">
            Verifying administrator access...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-[#064d2b] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex rounded-full bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black">
                Administrator Area
              </span>

              <h1 className="mt-5 text-4xl font-black sm:text-5xl">
                Manage Services
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-green-100">
                Review, approve, reject, and remove services submitted by
                marketplace users.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="rounded-xl bg-white px-6 py-3 font-black text-[#064d2b] transition hover:bg-green-50"
              >
                Admin Dashboard
              </Link>

              <button
                type="button"
                onClick={() => void loadServices()}
                disabled={loading}
                className="rounded-xl border border-white px-6 py-3 font-black text-white transition hover:bg-white hover:text-[#064d2b] disabled:opacity-60"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 font-bold text-green-800">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <CountCard
            title="Currently Loaded"
            value={services.length}
            description="Services matching the selected status"
          />

          <CountCard
            title="Pending"
            value={pendingCount}
            description="Waiting for administrator review"
          />

          <CountCard
            title="Approved"
            value={approvedCount}
            description="Published services"
          />

          <CountCard
            title="Rejected"
            value={rejectedCount}
            description="Services not approved"
          />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div>
              <label
                htmlFor="statusFilter"
                className="mb-2 block font-bold text-slate-800"
              >
                Status
              </label>

              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Services</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="serviceSearch"
                className="mb-2 block font-bold text-slate-800"
              >
                Search services
              </label>

              <input
                id="serviceSearch"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, category, city, email, or phone"
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-3xl font-black text-[#064d2b]">
              Service Submissions ({filteredServices.length})
            </h2>

            <p className="mt-2 text-slate-600">
              Review the service information before approving it.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <p className="font-bold text-slate-600">
                Loading services...
              </p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-xl font-black text-slate-800">
                No services found
              </p>

              <p className="mt-2 text-slate-500">
                There are no services matching this status and search.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredServices.map((service) => {
                const isWorking = actionId === service.id;

                return (
                  <article
                    key={service.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-black text-slate-900">
                            {service.service_name}
                          </h3>

                          <StatusBadge status={service.status} />
                        </div>

                        <p className="mt-2 font-bold text-[#087531]">
                          {service.category}
                        </p>

                        <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-600">
                          {service.description}
                        </p>

                        <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-3">
                          <Detail
                            label="Contact"
                            value={service.contact_name}
                          />

                          <Detail label="Phone" value={service.phone} />

                          <Detail label="Email" value={service.email} />

                          <Detail
                            label="Location"
                            value={[
                              service.city,
                              service.state,
                              service.zip,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          />

                          <Detail
                            label="Starting Price"
                            value={service.price}
                          />

                          <Detail
                            label="Submitted"
                            value={new Date(
                              service.created_at
                            ).toLocaleDateString("en-US")}
                          />
                        </div>

                        {service.website && (
                          <a
                            href={service.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-5 inline-flex font-bold text-blue-700 underline"
                          >
                            Visit website
                          </a>
                        )}
                      </div>

                      <div className="flex w-full flex-col gap-3 lg:w-48">
                        {service.status !== "approved" && (
                          <button
                            type="button"
                            disabled={isWorking}
                            onClick={() =>
                              void updateServiceStatus(
                                service.id,
                                "approved"
                              )
                            }
                            className="rounded-xl bg-[#087531] px-5 py-3 font-black text-white transition hover:bg-[#064d2b] disabled:opacity-60"
                          >
                            Approve
                          </button>
                        )}

                        {service.status !== "rejected" && (
                          <button
                            type="button"
                            disabled={isWorking}
                            onClick={() =>
                              void updateServiceStatus(
                                service.id,
                                "rejected"
                              )
                            }
                            className="rounded-xl bg-amber-500 px-5 py-3 font-black text-white transition hover:bg-amber-600 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        )}

                        {service.status !== "pending" && (
                          <button
                            type="button"
                            disabled={isWorking}
                            onClick={() =>
                              void updateServiceStatus(
                                service.id,
                                "pending"
                              )
                            }
                            className="rounded-xl border border-slate-300 px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                          >
                            Return to Pending
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => void deleteService(service.id)}
                          className="rounded-xl bg-red-700 px-5 py-3 font-black text-white transition hover:bg-red-800 disabled:opacity-60"
                        >
                          {isWorking ? "Working..." : "Delete"}
                        </button>
                      </div>
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

function CountCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="font-bold text-slate-600">{title}</p>

      <p className="mt-3 text-4xl font-black text-[#064d2b]">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const styles: Record<ServiceStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${styles[status]}`}
    >
      {status}
    </span>
  );
}