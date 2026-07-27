"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import EditMarketplaceAdminForm from "@/components/admin/EditMarketplaceAdminForm";

export default function AdminEditMarketplacePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadListing();
  }, []);

  async function loadListing() {
    setLoading(true);

    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setError("Listing not found.");
      setLoading(false);
      return;
    }

    setListing(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-600 font-bold">{error}</p>

        <Link
          href="/admin/marketplace"
          className="mt-6 inline-block text-green-700 font-bold"
        >
          ← Back to Marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8f5] py-10 px-8">
      <div className="mx-auto max-w-6xl">

        <Link
          href="/admin/marketplace"
          className="font-bold text-[#087531]"
        >
          ← Back
        </Link>

        <h1 className="mt-5 text-4xl font-black">
          Edit Marketplace Listing
        </h1>

        <p className="mt-3 text-gray-600">
          Changes made here are saved immediately and do not change the listing status.
        </p>

        <div className="mt-8">
          <EditMarketplaceAdminForm listing={listing} />
        </div>

      </div>
    </main>
  );
}