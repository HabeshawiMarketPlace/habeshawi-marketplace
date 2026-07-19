import RentalCard from "@/components/housing/RentalCard";
import SearchFilters from "@/components/housing/SearchFilters";
import { Suspense } from "react";

export default function HousesPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
<h1 className="text-4xl font-bold text-[#064d2b]">
  Houses
</h1>

<Suspense
  fallback={
    <div className="mt-6 rounded-xl bg-slate-100 p-6 text-center text-slate-600">
      Loading search filters...
    </div>
  }
>
  <SearchFilters />
</Suspense>

<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
<RentalCard
  id="house-1"
  image="/housing/houses/house1.jpg"
  title="Family House for Rent"
  price="$2,800/month"
  location="..."
  description="..."
  beds={3}
  baths={2}
  sqft={1800}
/>
        </div>
      </div>
    </main>
  );
}