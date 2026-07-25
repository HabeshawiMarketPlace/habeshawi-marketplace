"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type BusinessStatus = "pending" | "approved" | "rejected";

type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  image_url: string | null;
  logo_url: string | null;
  featured: boolean | null;
  status: BusinessStatus | null;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: BusinessStatus | null) {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending Approval";
}

function getStatusClasses(status: BusinessStatus | null) {
  if (status === "approved") {
    return "border-green-200 bg-green-100 text-green-800";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-100 text-red-800";
  }

  return "border-yellow-200 bg-yellow-100 text-yellow-900";
}

function getStatusMessage(status: BusinessStatus | null) {
  if (status === "approved") {
    return "Your business is visible in the public business directory.";
  }

  if (status === "rejected") {
    return "This business was not approved. Review the information and make any necessary changes.";
  }

  return "Your business is waiting for administrator approval.";
}

function getBusinessImage(business: Business) {
  const imageUrl = business.logo_url || business.image_url;

  if (!imageUrl) {
    return "/business/default-business.jpg";
  }

  if (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

export default function MyBusinessesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBusinesses() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (userError) {
        setErrorMessage(userError.message);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        setBusinesses([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("businesses")
        .select(
          `
            id,
            name,
            category,
            description,
            address,
            city,
            state,
            zip_code,
            phone,
            email,
            image_url,
            logo_url,
            featured,
            status,
            created_at
          `,
        )
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Unable to load businesses:", error);
        setErrorMessage(error.message);
        setBusinesses([]);
      } else {
        setBusinesses((data ?? []) as Business[]);
      }

      setLoading(false);
    }

    loadBusinesses();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (!session?.user) {
          setBusinesses([]);
          setLoading(false);
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleDelete(business: Business) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${business.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    if (!user) {
      setErrorMessage("You must be signed in to delete a business.");
      return;
    }

    setDeletingId(business.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", business.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Unable to delete business:", error);
      setErrorMessage(error.message);
      setDeletingId(null);
      return;
    }

    setBusinesses((currentBusinesses) =>
      currentBusinesses.filter(
        (currentBusiness) => currentBusiness.id !== business.id,
      ),
    );

    setSuccessMessage(`"${business.name}" was deleted successfully.`);
    setDeletingId(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

            <p className="mt-5 font-bold text-slate-700">
              Loading your businesses...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">
              ðŸ”’
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#087531]">
              Account required
            </p>

            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Sign in to view your businesses
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
              Your submitted businesses and their approval status are connected
              to your Habeshawi Marketplace account.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login?redirect=/businesses/my-businesses"
                className="rounded-xl bg-[#087531] px-7 py-3 font-black text-white transition hover:bg-[#064d2b]"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="rounded-xl border border-[#087531] px-7 py-3 font-black text-[#087531] transition hover:bg-green-50"
              >
                Create Account
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl bg-[#064d2b] px-6 py-9 text-white shadow-lg sm:px-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
                Business Owner Dashboard
              </p>

              <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                My Businesses
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-green-50">
                View your submitted businesses, check their approval status,
                edit information, or remove a listing.
              </p>
            </div>

            <Link
              href="/businesses/post"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300"
            >
              Add Another Business
            </Link>
          </div>
        </section>

        {errorMessage ? (
          <section
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
          >
            <p className="font-black">Unable to complete the request</p>
            <p className="mt-1">{errorMessage}</p>
          </section>
        ) : null}

        {successMessage ? (
          <section
            role="status"
            className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900"
          >
            <p className="font-black">Success</p>
            <p className="mt-1">{successMessage}</p>
          </section>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <DashboardCard
            label="All Businesses"
            value={businesses.length}
          />

          <DashboardCard
            label="Pending"
            value={
              businesses.filter(
                (business) =>
                  !business.status || business.status === "pending",
              ).length
            }
          />

          <DashboardCard
            label="Approved"
            value={
              businesses.filter(
                (business) => business.status === "approved",
              ).length
            }
          />
        </section>

        {businesses.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">
              ðŸ¢
            </div>

            <h2 className="mt-6 text-3xl font-black text-slate-950">
              You have not added a business yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Add your restaurant, store, professional service, organization,
              or local business to the Habeshawi Business Directory.
            </p>

            <Link
              href="/businesses/post"
              className="mt-7 inline-flex rounded-xl bg-[#087531] px-7 py-3 font-black text-white transition hover:bg-[#064d2b]"
            >
              Add Your Business
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            {businesses.map((business) => (
              <article
                key={business.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid min-h-56 sm:grid-cols-[180px_1fr]">
                  <div className="relative min-h-52 bg-gradient-to-br from-green-100 via-yellow-50 to-red-100">
                    <Image
                      src={getBusinessImage(business)}
                      alt={`${business.name} logo`}
                      fill
                      sizes="(max-width: 640px) 100vw, 180px"
                      className="object-contain p-5"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusClasses(
                          business.status,
                        )}`}
                      >
                        {getStatusLabel(business.status)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                        {business.category}
                      </span>

                      {business.featured ? (
                        <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-black">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-950">
                      {business.name}
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Submitted {formatDate(business.created_at)}
                    </p>

                    <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
                      {business.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 p-6">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-black text-slate-800">
                      {getStatusLabel(business.status)}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {getStatusMessage(business.status)}
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <p>
                      <span className="font-black">Location:</span>{" "}
                      {business.city}, {business.state}
                    </p>

                    <p>
                      <span className="font-black">Address:</span>{" "}
                      {business.address}
                    </p>

                    {business.phone ? (
                      <p>
                        <span className="font-black">Phone:</span>{" "}
                        {business.phone}
                      </p>
                    ) : null}

                    {business.email ? (
                      <p className="break-all">
                        <span className="font-black">Email:</span>{" "}
                        {business.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      href={`/businesses/edit/${business.id}`}
                      className="rounded-xl border border-blue-300 bg-blue-50 px-5 py-3 text-center font-black text-blue-800 transition hover:bg-blue-100"
                    >
                      Edit Business
                    </Link>

                    {business.status === "approved" ? (
                      <Link
                        href={`/businesses/${business.id}`}
                        className="rounded-xl border border-[#087531] px-5 py-3 text-center font-black text-[#087531] transition hover:bg-green-50"
                      >
                        View Public Page
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleDelete(business)}
                      disabled={deletingId === business.id}
                      className="rounded-xl border border-red-300 bg-red-50 px-5 py-3 font-black text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === business.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-[#064d2b]">{value}</p>
    </div>
  );
}
