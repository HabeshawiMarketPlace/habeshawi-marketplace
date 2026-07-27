"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EditRentalForm from "@/components/housing/EditRentalForm";

type Rental = {
  id: string;
  title: string;
  property_type: string | null;
  commercial_type: string | null;
  price: number;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  available_date: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  image_url: string | null;
  status: string;
  payment_status: string;
};

export default function AdminEditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("rentals")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        alert(error?.message ?? "Listing not found.");
        router.replace("/admin");
        return;
      }

      setRental(data);
      setLoading(false);
    }

    loadPage();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] p-8">
        <p>Loading listing...</p>
      </main>
    );
  }

  if (!rental) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] p-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 font-semibold text-[#087531] hover:underline"
        >
          ← Back to Admin Dashboard
        </button>

        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-[#064d2b]">
            Admin Edit Listing
          </h1>

          <p className="mt-2 text-slate-600">
            You can edit any housing listing from this page.
          </p>

          <div className="mt-8">
            <EditRentalForm rental={rental} />
          </div>
        </div>
      </div>
    </main>
  );
}