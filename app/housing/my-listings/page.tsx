"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type RentalRow = {
  id: string;
  user_id?: string | null;
  email?: string | null;
  title?: string | null;
  property_type?: string | null;
  commercial_type?: string | null;
  price?: number | string | null;
  monthly_rent?: number | string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  status?: string | null;
  payment_status?: string | null;
  edit_token?: string | null;
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

function formatLabel(value?: string | null) {
  if (!value) return "Not provided";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not provided"
    : date.toLocaleDateString("en-US");
}

function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return String(value);
  }

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function HousingMyListingsPage() {
  const router = useRouter();

  const [rentals, setRentals] = useState<RentalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRentals = useCallback(async () => {
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
        router.replace("/login?redirect=/housing/my-listings");
        return;
      }

      const userEmail = user.email?.trim().toLowerCase() ?? "";

      let query = supabase
        .from("rentals")
        .select("*")
        .order("created_at", { ascending: false });

      if (userEmail) {
        query = query.or(
          `user_id.eq.${user.id},email.ilike.${userEmail}`,
        );
      } else {
        query = query.eq("user_id", user.id);
      }

      const result = await query;

      if (result.error) {
        throw new Error(
          `Rentals could not be loaded: ${errorText(result.error)}`,
        );
      }

      setRentals((result.data ?? []) as RentalRow[]);
    } catch (error) {
      console.error("Unable to load rentals:", error);
      setRentals([]);
      setPageError(errorText(error));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadRentals();
  }, [loadRentals]);

  async function deleteRental(rental: RentalRow) {
    const title = rental.title || "this rental";

    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${title}"?`,
      )
    ) {
      return;
    }

    setDeletingId(rental.id);
    setPageError("");
    setNotice("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        router.replace("/login?redirect=/housing/my-listings");
        return;
      }

      const { error } = await supabase
        .from("rentals")
        .delete()
        .eq("id", rental.id)
        .eq("user_id", user.id);

      if (error) throw error;

      setRentals((current) =>
        current.filter((item) => item.id !== rental.id),
      );

      setNotice("Rental deleted successfully.");
    } catch (error) {
      setPageError(
        `Rental could not be deleted: ${errorText(error)}`,
      );
    } finally {
      setDeletingId(null);
    }
  }

  const approvedCount = rentals.filter(
    (rental) => rental.status?.toLowerCase() === "approved",
  ).length;

  const pendingCount = rentals.filter(
    (rental) => rental.status?.toLowerCase() === "pending",
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
                My Rentals
              </h1>

              <p className="mt-4 text-green-100">
                Manage rental listings connected to your account.
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
                href="/post-ad/rental"
                className="inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-black text-black hover:bg-yellow-300"
              >
                Post a Rental
              </Link>
            </div>
          </div>
        </section>

        {pageError && (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-800">
            <p className="font-black">Unable to load your rentals.</p>
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
          <Summary title="All Rentals" value={rentals.length} />
          <Summary title="Approved" value={approvedCount} />
          <Summary title="Pending" value={pendingCount} />
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <p className="font-bold text-slate-600">
                Loading your rentals...
              </p>
            </div>
          ) : rentals.length === 0 ? (
            <EmptyState
              title="No rentals found"
              description="Your rental listings will appear here after you post them."
              href="/post-ad/rental"
              buttonText="Post a Rental"
            />
          ) : (
            <div className="grid gap-6">
              {rentals.map((rental) => {
                const location =
                  rental.location ||
                  [rental.city, rental.state, rental.zip]
                    .filter(Boolean)
                    .join(", ") ||
                  "Not provided";

                const rent =
                  rental.price ?? rental.monthly_rent ?? null;

                const editHref = rental.edit_token
                  ? `/post-ad/edit/${rental.id}?token=${encodeURIComponent(
                      rental.edit_token,
                    )}`
                  : `/post-ad/edit/${rental.id}`;

                return (
                  <article
                    key={rental.id}
                    className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="flex flex-col justify-between gap-7 lg:flex-row">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-2xl font-black text-slate-900">
                            {rental.title || "Untitled Rental"}
                          </h2>

                          <Badge value={rental.status || "unknown"} />

                          <Badge
                            value={`Payment: ${
                              rental.payment_status || "not set"
                            }`}
                          />
                        </div>

                        <p className="mt-3 font-black text-[#087531]">
                          {formatLabel(rental.property_type)}
                          {rental.commercial_type
                            ? ` • ${formatLabel(
                                rental.commercial_type,
                              )}`
                            : ""}
                        </p>

                        <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
                          <Detail label="Rent" value={formatMoney(rent)} />
                          <Detail label="Location" value={location} />
                          <Detail
                            label="Posted"
                            value={formatDate(rental.created_at)}
                          />
                          <Detail
                            label="Owner Match"
                            value={
                              rental.user_id
                                ? "User ID connected"
                                : "Email only"
                            }
                          />
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-3 lg:w-52">
                        <Link
                          href={`/housing/${rental.id}`}
                          className="rounded-xl bg-[#087531] px-5 py-3 text-center font-black text-white hover:bg-[#064d2b]"
                        >
                          View Rental
                        </Link>

                        <Link
                          href={editHref}
                          className="rounded-xl border border-[#087531] px-5 py-3 text-center font-black text-[#087531] hover:bg-green-50"
                        >
                          Edit Rental
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === rental.id}
                          onClick={() => void deleteRental(rental)}
                          className="rounded-xl border border-red-300 px-5 py-3 font-black text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          {deletingId === rental.id
                            ? "Deleting..."
                            : "Delete Rental"}
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
    normalized.includes("approved") || normalized.includes("paid")
      ? "bg-green-100 text-green-800"
      : normalized.includes("pending") ||
          normalized.includes("unpaid")
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