import RentalCard from "@/components/housing/RentalCard";
import SearchFilters from "@/components/housing/SearchFilters";
import { Suspense } from "react";

export default function RoommatesPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-[#064d2b]">
          Roommates
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
            image="/housing/roommates/room-share1.jpg"
            title="Looking for a Roommate"
            price="$700/month"
            location="Hyattsville, MD"
            description="Private room • Shared kitchen • Utilities included"
            beds={1}
            baths={1}
            sqft={180}
          />
        </div>
      </div>
    </main>
  );
}