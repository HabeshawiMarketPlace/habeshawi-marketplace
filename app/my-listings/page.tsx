"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SavedListing = {
  id: string;
  editLink: string;
};

export default function MyListingsPage() {
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const timer = window.setTimeout(() => {
    const savedListings: SavedListing[] = [];

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);

      if (!key || !key.startsWith("rental-edit-link-")) {
        continue;
      }

      const editLink = localStorage.getItem(key);

      if (!editLink) {
        continue;
      }

      const id = key.replace("rental-edit-link-", "");

      savedListings.push({
        id,
        editLink,
      });
    }

    setListings(savedListings);
    setIsLoading(false);
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

  function removeListing(id: string) {
    localStorage.removeItem(`rental-edit-link-${id}`);

    setListings((currentListings) =>
      currentListings.filter((listing) => listing.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-4xl font-bold text-[#064d2b]">
            My Listings
          </h1>

          <p className="mt-3 text-slate-600">
            Listings created using this browser appear here.
          </p>

          <p className="mt-2 text-sm text-amber-700">
            Do not clear your browser storage unless you saved your
            private edit links somewhere else.
          </p>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="rounded-2xl bg-white p-8 shadow">
              <p>Loading your listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 shadow">
              <h2 className="text-2xl font-bold text-slate-800">
                No saved listings
              </h2>

              <p className="mt-3 text-slate-600">
                Listings you create will appear here automatically.
              </p>

              <Link
                href="/post-ad"
                className="mt-6 inline-block rounded-lg bg-[#087531] px-5 py-3 font-semibold text-white hover:bg-[#064d2b]"
              >
                Post a Rental
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <p className="text-sm font-semibold text-slate-500">
                    Listing ID
                  </p>

                  <p className="mt-1 break-all font-mono text-sm">
                    {listing.id}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/housing/${listing.id}`}
                      className="rounded-lg bg-[#087531] px-5 py-3 font-semibold text-white hover:bg-[#064d2b]"
                    >
                      View Listing
                    </Link>

                    <a
                      href={listing.editLink}
                      className="rounded-lg border border-[#087531] px-5 py-3 font-semibold text-[#087531] hover:bg-green-50"
                    >
                      Edit Listing
                    </a>

                    <button
                      type="button"
                      onClick={() => removeListing(listing.id)}
                      className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-50"
                    >
                      Remove From This Browser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}