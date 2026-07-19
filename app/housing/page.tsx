import SearchFilters from "@/components/housing/SearchFilters";
import { supabase } from "@/lib/supabase";
import ListingCard from "@/components/housing/ListingCard";

export const dynamic = "force-dynamic";
export default async function HousingPage() {
const { data: rentals, error } = await supabase
  .from("rentals")
  .select("*")
  .eq("payment_status", "paid")
  .eq("status", "approved")
  .order("created_at", { ascending: false });
  if (error) {
    return <p className="p-8">Unable to load listings: {error.message}</p>;
  }
  

  return (
    <main className="p-8">
<h1 className="text-3xl font-bold">Housing Listings</h1>

<div className="mt-6">
  <SearchFilters />
</div>

<div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
{rentals?.map((rental) => (
<ListingCard
  key={rental.id}
  id={rental.id}
  href={`/housing/${rental.id}`}
  image={
  rental.image_url ||
  "/housing/apartments/apartment1.jpg"
}
  title={rental.title}
  location={rental.location ?? "Location not provided"}
  price={Number(rental.price ?? 0)}
  bedrooms={rental.bedrooms}
  bathrooms={rental.bathrooms}
  description={rental.description ?? ""}
  propertyType={rental.property_type}
  createdAt={rental.created_at}
  phone={rental.phone}
  whatsapp={rental.whatsapp}
/>
))}
      </div>
    </main>
  );
}