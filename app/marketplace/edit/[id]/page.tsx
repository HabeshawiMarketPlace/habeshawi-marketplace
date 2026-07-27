"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import EditMarketplaceForm from "@/components/marketplace/EditMarketplaceForm";

export default function EditMarketplacePage() {
  const { id } = useParams();
  const router = useRouter();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadListing() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setError("Unable to load this listing.");
        setLoading(false);
        return;
      }

      setListing(data);
      setLoading(false);
    }

    loadListing();
  }, [id, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-10">
        <p className="text-red-600 font-bold">{error}</p>

        <Link
          href="/marketplace/my-listings"
          className="mt-6 inline-block text-green-700 font-bold"
        >
          ← Back
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] py-10 px-6">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/marketplace/my-listings"
          className="font-bold text-[#087531]"
        >
          ← Back to My Listings
        </Link>

        <h1 className="mt-5 text-4xl font-black text-[#064d2b]">
          Edit Marketplace Listing
        </h1>

        <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-5">
          Any changes you make will require administrator approval again.
        </div>

        <div className="mt-8">
          <EditMarketplaceForm listing={listing} />
        </div>

      </div>
    </main>
  );
}