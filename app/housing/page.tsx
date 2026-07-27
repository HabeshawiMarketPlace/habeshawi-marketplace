import ListingCard from "@/components/housing/ListingCard";
import SearchFilters from "@/components/housing/SearchFilters";
import {
  getRentals,
  type RentalFilters,
  type RentalListing,
} from "@/lib/housing/queries";

export const dynamic = "force-dynamic";

type HousingPageProps = {
  searchParams: Promise<{
    location?: string;
    type?: string;
    commercialType?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    bathrooms?: string;
    sort?: string;
  }>;
};

function parsePositiveNumber(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function HousingPage({
  searchParams,
}: HousingPageProps) {
  const params = await searchParams;

  const filters: RentalFilters = {
    location: params.location?.trim() || undefined,
    propertyType: params.type?.trim() || undefined,
    commercialType:
      params.type === "commercial"
        ? params.commercialType?.trim() || undefined
        : undefined,
    minPrice: parsePositiveNumber(params.minPrice),
    maxPrice: parsePositiveNumber(params.maxPrice),
    bedrooms: parsePositiveNumber(params.bedrooms),
    bathrooms: parsePositiveNumber(params.bathrooms),
    sortBy:
      params.sort === "price_low" ||
      params.sort === "price_high"
        ? params.sort
        : "newest",
  };

  const rentals: RentalListing[] = await getRentals(filters);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#064d2b]">
          Rental Listings
        </h1>

        <p className="mt-2 text-slate-600">
          Browse approved rooms, apartments, houses,
          roommate spaces, and commercial properties.
        </p>
      </div>

      <SearchFilters />

      {rentals.length === 0 ? (
        <div className="mt-10 rounded-xl border bg-white p-10 text-center">
          <h2 className="text-2xl font-bold">
            No rentals found
          </h2>

          <p className="mt-3 text-slate-600">
            Try changing your search filters.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => (
            <ListingCard
              key={rental.id}
              id={rental.id}
              href={`/housing/${rental.id}`}
              image={rental.imageUrl}
              title={rental.title}
              location={rental.location}
              price={rental.price}
              bedrooms={rental.bedrooms}
              bathrooms={rental.bathrooms}
              description={rental.description}
              propertyType={rental.propertyType}
              commercialType={rental.commercialType}
              createdAt={rental.createdAt}
              phone={rental.phone}
              whatsapp={rental.whatsapp}
            />
          ))}
        </div>
      )}
    </main>
  );
}