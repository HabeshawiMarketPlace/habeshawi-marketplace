import ListingCard from "@/components/housing/ListingCard";
import SearchFilters from "@/components/housing/SearchFilters";
import {
  getRentals,
  type RentalListing,
} from "@/lib/housing/queries";

type RentalCategoryPageProps = {
  title: string;
  description: string;
  propertyType: string;
  emptyMessage: string;
};

export default async function RentalCategoryPage({
  title,
  description,
  propertyType,
  emptyMessage,
}: RentalCategoryPageProps) {
  let rentals: RentalListing[] = [];
  let errorMessage = "";

  try {
    rentals = await getRentals({ propertyType });
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <p className="font-bold uppercase tracking-wide text-[#087531]">
          Rentals
        </p>

        <h1 className="mt-1 text-4xl font-black text-[#064d2b]">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-slate-600">
          {description}
        </p>

        <div className="mt-6">
          <SearchFilters />
        </div>

        {errorMessage ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            Unable to load listings: {errorMessage}
          </div>
        ) : (
          <>
            <p className="mt-8 font-semibold text-slate-700">
              {rentals.length}{" "}
              {rentals.length === 1
                ? "rental found"
                : "rentals found"}
            </p>

            {rentals.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center">
                <h2 className="text-xl font-bold text-slate-800">
                  {emptyMessage}
                </h2>

                <p className="mt-2 text-slate-600">
                  Approved listings will appear here automatically.
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
      </div>
    </main>
  );
}
