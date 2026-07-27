"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminMarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);

    const { data } = await supabase
      .from("marketplace_listings")
      .select("*")
      .order("created_at", { ascending: false });

    setListings(data ?? []);
    setLoading(false);
  }

  async function approve(id: string) {
    await supabase
      .from("marketplace_listings")
      .update({
        status: "approved",
      })
      .eq("id", id);

    loadListings();
  }

  async function reject(id: string) {
    await supabase
      .from("marketplace_listings")
      .update({
        status: "rejected",
      })
      .eq("id", id);

    loadListings();
  }

  async function feature(id: string, featured: boolean) {
    await supabase
      .from("marketplace_listings")
      .update({
        featured: !featured,
      })
      .eq("id", id);

    loadListings();
  }

  async function remove(id: string) {
    if (!confirm("Delete this listing?")) return;

    await supabase
      .from("marketplace_listings")
      .delete()
      .eq("id", id);

    loadListings();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f5] p-8">

      <h1 className="text-4xl font-black mb-8">
        Marketplace Administration
      </h1>

      <div className="space-y-6">

        {listings.map((listing) => (

          <div
            key={listing.id}
            className="rounded-xl bg-white shadow p-6"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {listing.title}
                </h2>

                <p className="text-gray-500">
                  {listing.category}
                </p>

                <p className="mt-2">
                  Status:
                  <span className="ml-2 font-bold">
                    {listing.status}
                  </span>
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <Link
                  href={`/admin/marketplace/edit/${listing.id}`}
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Edit
                </Link>

                <button
                  onClick={() => approve(listing.id)}
                  className="rounded bg-green-600 px-4 py-2 text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(listing.id)}
                  className="rounded bg-yellow-600 px-4 py-2 text-white"
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    feature(listing.id, listing.featured)
                  }
                  className="rounded bg-purple-600 px-4 py-2 text-white"
                >
                  {listing.featured
                    ? "Unfeature"
                    : "Feature"}
                </button>

                <button
                  onClick={() => remove(listing.id)}
                  className="rounded bg-red-600 px-4 py-2 text-white"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}