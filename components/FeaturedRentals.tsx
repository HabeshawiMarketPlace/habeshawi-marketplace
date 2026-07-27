import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ListingCard from "@/components/housing/ListingCard";

export const dynamic = "force-dynamic";

export default async function FeaturedListings() {
  const { data: rentals, error } = await supabase
    .from("rentals")
    .select(`
      *,
      rental_images (
        image_url,
        display_order
      )
    `)
    .eq("payment_status", "paid")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-bold uppercase tracking-wide text-[#087531]">
            Recently added
          </p>

          <h2 className="mt-1 text-3xl font-black text-[#064d2b] sm:text-4xl">
            Featured Rentals
          </h2>

          <p className="mt-2 text-slate-600">
            Browse the newest approved rental listings in the community.
          </p>
        </div>

        <Link
          href="/housing"
          className="font-bold text-[#087531] transition hover:text-[#064d2b] hover:underline"
        >
          View All Rentals →
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          Unable to load featured rentals: {error.message}
        </div>
      )}

      {!error && rentals?.length === 0 && (
        <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
          <p className="text-xl font-bold text-slate-800">
            No approved rentals are available yet.
          </p>

          <p className="mt-2 text-slate-600">
            Be the first person to post a rental in the community.
          </p>

          <Link
            href="/post-ad"
            className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-bold text-white transition hover:bg-[#064d2b]"
          >
            Post a Rental
          </Link>
        </div>
      )}

      {!error && rentals && rentals.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => {
            const sortedImages = [...(rental.rental_images ?? [])].sort(
              (a, b) =>
                Number(a.display_order ?? 0) -
                Number(b.display_order ?? 0),
            );

            const image =
              sortedImages[0]?.image_url ||
              rental.image_url ||
              "/housing/apartments/apartment1.jpg";

            return (
              <ListingCard
                key={rental.id}
                id={rental.id}
                href={`/housing/${rental.id}`}
                image={image}
                title={rental.title}
                location={rental.location ?? "Location not provided"}
                price={Number(rental.price ?? 0)}
                bedrooms={rental.bedrooms}
                bathrooms={rental.bathrooms}
                description={rental.description ?? ""}
                propertyType={rental.property_type}
                commercialType={rental.commercial_type ?? null}
                createdAt={rental.created_at}
                phone={rental.phone}
                whatsapp={rental.whatsapp}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}