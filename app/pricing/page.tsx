"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PricingContent() {
  const searchParams = useSearchParams();
  const rentalId = searchParams.get("rentalId");

  async function startCheckout(listingType: "housing" | "business") {
    if (!rentalId) {
      alert("Rental listing ID is missing.");
      return;
    }

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingType,
        rentalId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Unable to start checkout.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#064d2b]">
            Choose a Listing Plan
          </h1>

          <p className="mt-3 text-slate-600">
            Select the listing type you want to publish.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow">
            <h2 className="text-2xl font-bold text-[#064d2b]">
              Housing Listing
            </h2>

            <p className="mt-3 text-slate-600">
              Publish an apartment, house, room, or roommate listing.
            </p>

            <button
              type="button"
              onClick={() => startCheckout("housing")}
              className="mt-8 w-full rounded-lg bg-[#087531] px-6 py-3 font-semibold text-white hover:bg-[#064d2b]"
            >
              Continue with Housing
            </button>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow">
            <h2 className="text-2xl font-bold text-[#064d2b]">
              Business Listing
            </h2>

            <p className="mt-3 text-slate-600">
              Promote a business, professional service, or community organization.
            </p>

            <button
              type="button"
              onClick={() => startCheckout("business")}
              className="mt-8 w-full rounded-lg bg-[#087531] px-6 py-3 font-semibold text-white hover:bg-[#064d2b]"
            >
              Continue with Business
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading pricing...</div>}>
      <PricingContent />
    </Suspense>
  );
}