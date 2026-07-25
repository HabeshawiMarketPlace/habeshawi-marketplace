import ListingCard from "@/components/housing/ListingCard";
import SearchFilters from "@/components/housing/SearchFilters";
import { getRentals, type RentalFilters, type RentalListing } from "@/lib/housing/queries";

export const dynamic = "force-dynamic";

type HousingPageProps = {
  searchParams: Promise<{
    location?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
  }>;
};

function parsePositiveNumber(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
}

export default async function HousingPage({ searchParams }: HousingPageProps) {
  const params = await searchParams;

  const filters: RentalFilters = {
    location: params.location?.trim() || undefined,
    propertyType: params.type?.trim() || undefined,
    minPrice: parsePositiveNumber(params.minPrice),
    maxPrice: parsePositiveNumber(params.maxPrice),
    bedrooms: parsePositiveNumber(params.bedrooms),
  };

  let rentals: RentalListing[] = [];
  let errorMessage = "";

  try {
    rentals = await getRentals(filters);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div>
        <p className="font-bold uppercase tracking-wide text-[#087531]">
          Find your next home
        </p>

        <h1 className="mt-1 text-3xl font-black text-[#064d2b] sm:text-4xl">
          Rental Listings
        </h1>

        <p className="mt-2 text-slate-600">
          Browse approved rooms, apartments, houses, basements, and roommate listings.
        </p>
      </div>

      <div className="mt-6">
        <SearchFilters />
      </div>

      {errorMessage ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          Unable to load listings: {errorMessage}
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between">
            <p className="font-semibold text-slate-700">
              {rentals.length} {rentals.length === 1 ? "rental found" : "rentals found"}
            </p>
          </div>

          {rentals.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center">
              <h2 className="text-xl font-bold text-slate-800">
                No matching rentals found
              </h2>

              <p className="mt-2 text-slate-600">
                Try changing the location, price, property type, or bedroom filters.
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
                  createdAt={rental.createdAt}
                  phone={rental.phone}
                  whatsapp={rental.whatsapp}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
