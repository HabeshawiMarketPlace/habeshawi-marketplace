"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditRentalForm from "@/components/housing/EditRentalForm";
import { supabase } from "@/lib/supabase";

type Rental = {
  id: string;
  user_id: string | null;
  email: string | null;
  title: string;
  property_type: string | null;
  commercial_type: string | null;
  price: number | null;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  image_url: string | null;
  status: string | null;
  payment_status?: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String((error as { message?: unknown }).message ?? "");
  }

  return "Unable to load this rental.";
}

export default function EditRentalPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRental() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace(
            `/login?redirect=${encodeURIComponent(
              `/post-ad/edit/${params.id}`,
            )}`,
          );
          return;
        }

        const userEmail = user.email?.trim().toLowerCase() ?? "";

        /*
         * The user may edit only a rental connected to their account.
         * Email fallback supports older rentals created before user_id
         * was saved correctly.
         */
        let query = supabase
          .from("rentals")
          .select("*")
          .eq("id", params.id);

        if (userEmail) {
          query = query.or(
            `user_id.eq.${user.id},email.ilike.${userEmail}`,
          );
        } else {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Rental not found, or this rental does not belong to your account.",
          );
        }

        if (active) {
          setRental(data as Rental);
        }
      } catch (error) {
        if (active) {
          setRental(null);
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRental();

    return () => {
      active = false;
    };
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />
          <p className="mt-5 font-bold text-slate-700">
            Loading your rental...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !rental) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-600">
            Rental Edit
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Unable to open this rental
          </h1>

          <p className="mt-4 rounded-2xl bg-red-50 p-4 text-red-800">
            {errorMessage || "Rental not found."}
          </p>

          <Link
            href="/housing/my-listings"
            className="mt-7 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white hover:bg-[#064d2b]"
          >
            Return to My Listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/housing/my-listings"
          className="font-black text-[#087531] hover:text-[#064d2b]"
        >
          ← Back to My Listings
        </Link>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#087531]">
            Rental Listing
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#064d2b]">
            Edit Your Rental
          </h1>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            You can edit this rental even after it has been approved.
            Saving changes will return it to Pending status so the
            administrator can review the updated information.
          </div>

          <EditRentalForm rental={rental} />
        </section>
      </div>
    </main>
  );
}