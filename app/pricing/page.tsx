"use client";
import { useSearchParams } from "next/navigation";
export default function PricingPage() {

  const searchParams = useSearchParams();
  const rentalId = searchParams.get("rentalId");
  
  async function startCheckout(
    listingType: "housing" | "business"
  ) { if (!rentalId) {
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
    <main className="mx-auto max-w-4xl p-10">
      <h1 className="mb-8 text-center text-4xl font-bold text-[#064d2b]">
        Choose Your Listing
      </h1>

      <div className="grid gap-8 md:grid-cols-2">

        <div className="rounded-2xl border p-8 shadow">
          <h2 className="text-2xl font-bold">🏠 Housing</h2>

          <p className="mt-4 text-5xl font-bold">
            $10.99
          </p>

          <p className="mt-2 text-gray-600">
            Valid for 90 days
          </p>

          <ul className="mt-6 space-y-2">
            <li>✔ Up to 10 photos</li>
            <li>✔ Edit anytime</li>
            <li>✔ Visible for 3 months</li>
          </ul>
          

<button
  type="button"

  onClick={() => startCheckout("housing")}
  className="mt-8 w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
>
  Pay $10.99
</button>
        </div>

        <div className="rounded-2xl border p-8 shadow">
          <h2 className="text-2xl font-bold">🏢 Business</h2>


          <p className="mt-4 text-5xl font-bold">
            $19.99
          </p>

          <p className="mt-2 text-gray-600">
            Valid for 90 days
          </p>

          <ul className="mt-6 space-y-2">
            <li>✔ Logo</li>
            <li>✔ Cover photo</li>
            <li>✔ Website</li>
            <li>✔ Social links</li>
          </ul>

<button
  type="button"
  onClick={() => startCheckout("business")}
  className="mt-8 w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
>
  Pay $19.99
</button>
        </div>

      </div>
    </main>
  );
}