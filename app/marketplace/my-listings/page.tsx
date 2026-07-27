"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MarketplaceListing = {
  id: string;
  title: string;
  category: string;
  price: number | string;
  city: string;
  state: string;
  location: string | null;
  image_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function getStatusClasses(status: MarketplaceListing["status"]) {
  if (status === "approved") {
    return "border-green-200 bg-green-100 text-green-800";
  }

  if (status === "rejected") {
    return "border-red-200 bg-red-100 text-red-800";
  }

  return "border-amber-200 bg-amber-100 text-amber-800";
}

function formatPrice(price: number | string) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
  }).format(numericPrice);
}

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
function normalizeImageUrl(imageUrl: string | null) {
  if (!imageUrl) {
    return "/default-marketplace.png";
  }

  if (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("http://")
  ) {
    return imageUrl;
  }

  return "/default-marketplace.png";
}
export default function MyListingsPage() {
  const router = useRouter();

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("marketplace_listings")
      .select(
        `
          id,
          title,
          category,
          price,
          city,
          state,
          location,
          image_url,
          status,
          created_at
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(`Unable to load your listings: ${error.message}`);
      setListings([]);
      setIsLoading(false);
      return;
    }

    setListings((data ?? []) as MarketplaceListing[]);
    setIsLoading(false);
  }, [router]);

useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadListings();
  }, 0);

  return () => window.clearTimeout(timer);
}, [loadListings]);

  async function deleteListing(listing: MarketplaceListing) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(listing.id);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setDeletingId(null);
      router.replace("/login");
      return;
    }

    const { error } = await supabase
      .from("marketplace_listings")
      .delete()
      .eq("id", listing.id)
      .eq("user_id", user.id);

    if (error) {
      setErrorMessage(`Unable to delete listing: ${error.message}`);
      setDeletingId(null);
      return;
    }

    setListings((currentListings) =>
      currentListings.filter(
        (currentListing) => currentListing.id !== listing.id
      )
    );

    setDeletingId(null);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

          <p className="mt-4 font-semibold text-slate-700">
            Loading your marketplace listings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#087531]">
              Marketplace
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#064d2b] sm:text-4xl">
              My Listings
            </h1>

            <p className="mt-3 text-slate-600">
              View and manage all marketplace items you have submitted.
            </p>
          </div>

          <Link
            href="/marketplace/post"
            className="inline-flex items-center justify-center rounded-xl bg-[#087531] px-6 py-3 font-bold text-white transition hover:bg-[#064d2b]"
          >
            + Post Marketplace Item
          </Link>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            {errorMessage}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              No Marketplace Listings Yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Marketplace items you submit while signed in will appear
              here, including pending, approved, and rejected listings.
            </p>

            <Link
              href="/marketplace/post"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#087531] px-6 py-3 font-bold text-white transition hover:bg-[#064d2b]"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {listings.map((listing) => {
              const imageUrl = normalizeImageUrl(listing.image_url);
              const displayLocation =
                listing.location?.trim() ||
                `${listing.city}, ${listing.state}`;

              return (
                <article
                  key={listing.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {listing.image_url ? (
                     <Image
  src={imageUrl}
  alt={listing.title}
  width={800}
  height={450}
  className="h-full w-full object-cover"
  unoptimized
/>
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        📦
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#087531]">
                          {listing.category}
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                          {listing.title}
                        </h2>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClasses(
                          listing.status
                        )}`}
                      >
                        {listing.status}
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-extrabold text-[#064d2b]">
                      {formatPrice(listing.price)}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      📍 {displayLocation}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Submitted {formatDate(listing.created_at)}
                    </p>

                    {listing.status === "pending" && (
                      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        This listing is waiting for administrator approval
                        and is not yet visible publicly.
                      </div>
                    )}

                    {listing.status === "rejected" && (
                      <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        This listing was not approved. Review the listing
                        information before submitting another item.
                      </div>
                    )}

                  <div className="mt-6 flex flex-wrap gap-3">
  {listing.status === "approved" && (
    <Link
      href={`/marketplace/${listing.id}`}
      className="rounded-xl bg-[#087531] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#064d2b]"
    >
      View Listing
    </Link>
  )}

  <Link
    href={`/marketplace/edit/${listing.id}`}
    className="rounded-xl border border-[#087531] bg-white px-5 py-3 text-sm font-bold text-[#087531] transition hover:bg-green-50"
  >
    ✏️ Edit Listing
  </Link>

  <button
    type="button"
    onClick={() => deleteListing(listing)}
    disabled={deletingId === listing.id}
    className="rounded-xl border border-red-300 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {deletingId === listing.id
      ? "Deleting..."
      : "Delete Listing"}
  </button>
</div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}