import RentalCard from "@/components/housing/RentalCard";
import SearchFilters from "@/components/housing/SearchFilters";
import { Suspense } from "react";

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
<h1 className="text-4xl font-bold text-[#064d2b]">
  Rooms for Rent
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
            image="/housing/rooms/room1.jpg"
            title="Private Room for Rent"
            price="$850/month"
            location="Silver Spring, MD"
            description="Private room with shared kitchen and utilities included."
            beds={1}
            baths={1}
            sqft={250}
          />

          <RentalCard
            image="/housing/rooms/room2.jpg"
            title="Basement Room"
            price="$950/month"
            location="Takoma Park, MD"
            description="Large basement room near public transportation."
            beds={1}
            baths={1}
            sqft={400}
          />

          <RentalCard
            image="/housing/rooms/room3.jpg"
            title="Furnished Room"
            price="$800/month"
            location="Hyattsville, MD"
            description="Furnished room in a quiet shared home."
            beds={1}
            baths={1}
            sqft={220}
          />
        </div>
      </div>
    </main>
  );
}