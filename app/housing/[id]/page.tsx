import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/housing/ImageGallery";
import ListingCard from "@/components/housing/ListingCard";
import { getRentalById, getSimilarRentals } from "@/lib/housing/queries";

export const dynamic = "force-dynamic";

type HousingDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function makePhoneLink(phone: string | null): string | null {
  if (!phone) return null;
  const cleanedPhone = phone.replace(/[^\d+]/g, "");
  return cleanedPhone ? `tel:${cleanedPhone}` : null;
}

function makeWhatsAppLink(whatsapp: string | null): string | null {
  if (!whatsapp) return null;
  const cleanedNumber = whatsapp.replace(/\D/g, "");
  return cleanedNumber ? `https://wa.me/${cleanedNumber}` : null;
}

export default async function HousingDetailsPage({ params }: HousingDetailsPageProps) {
  const { id } = await params;
  const rental = await getRentalById(id);

  if (!rental) {
    notFound();
  }

  const similarRentals = await getSimilarRentals(rental, 3);
  const images = rental.images.length > 0
    ? rental.images.map((image) => image.imageUrl)
    : [rental.imageUrl];

  const phoneLink = makePhoneLink(rental.phone);
  const whatsappLink = makeWhatsAppLink(rental.whatsapp);

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/housing" className="font-semibold text-[#087531] hover:underline">
          ← Back to Rentals
        </Link>

        <article className="mt-6 overflow-hidden rounded-2xl bg-white shadow">
          <ImageGallery images={images} title={rental.title} />

          <div className="grid gap-8 p-6 md:grid-cols-[2fr_1fr] md:p-8">
            <section>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#087531]">
                {rental.propertyType ?? "Rental"}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
                {rental.title}
              </h1>

              <p className="mt-3 text-lg text-gray-600">{rental.location}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {rental.bedrooms !== null && (
                  <span className="rounded-full bg-gray-100 px-4 py-2">
                    🛏 {rental.bedrooms} {rental.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                  </span>
                )}

                {rental.bathrooms !== null && (
                  <span className="rounded-full bg-gray-100 px-4 py-2">
                    🚿 {rental.bathrooms} {rental.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
                  </span>
                )}

                {rental.availableDate && (
                  <span className="rounded-full bg-gray-100 px-4 py-2">
                    Available {new Date(`${rental.availableDate}T00:00:00`).toLocaleDateString("en-US")}
                  </span>
                )}
              </div>

              <div className="mt-8 border-t pt-8">
                <h2 className="text-2xl font-bold">Description</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                  {rental.description || "No description was provided for this rental."}
                </p>
              </div>
            </section>

            <aside className="h-fit rounded-2xl border p-6">
              <p className="text-gray-500">Monthly Rent</p>
              <h2 className="mt-1 text-4xl font-bold text-[#064d2b]">
                ${rental.price.toLocaleString("en-US")}
              </h2>

              <div className="mt-6 grid gap-3">
                {phoneLink && (
                  <a href={phoneLink} className="rounded-lg bg-[#087531] px-5 py-3 text-center font-semibold text-white hover:bg-[#064d2b]">
                    📞 Call
                  </a>
                )}

                {rental.phone && (
                  <a href={`sms:${rental.phone.replace(/[^\d+]/g, "")}`} className="rounded-lg border border-[#087531] px-5 py-3 text-center font-semibold text-[#087531] hover:bg-green-50">
                    💬 Text
                  </a>
                )}

                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[#087531] px-5 py-3 text-center font-semibold text-[#087531] hover:bg-green-50">
                    WhatsApp
                  </a>
                )}

                {rental.email && (
                  <a href={`mailto:${rental.email}`} className="rounded-lg border px-5 py-3 text-center font-semibold hover:bg-slate-50">
                    Email
                  </a>
                )}
              </div>

              <p className="mt-6 text-xs leading-5 text-gray-500">
                Never send money before seeing the property and verifying the owner or property manager.
              </p>
            </aside>
          </div>
        </article>

        {similarRentals.length > 0 && (
          <section className="mt-12">
            <div>
              <p className="font-bold uppercase tracking-wide text-[#087531]">You may also like</p>
              <h2 className="mt-1 text-2xl font-black text-[#064d2b] sm:text-3xl">Similar Rentals</h2>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {similarRentals.map((similarRental) => (
                <ListingCard
                  key={similarRental.id}
                  id={similarRental.id}
                  href={`/housing/${similarRental.id}`}
                  image={similarRental.imageUrl}
                  title={similarRental.title}
                  location={similarRental.location}
                  price={similarRental.price}
                  bedrooms={similarRental.bedrooms}
                  bathrooms={similarRental.bathrooms}
                  description={similarRental.description}
                  propertyType={similarRental.propertyType}
                  commercialType={similarRental.commercialType ?? null}
                  createdAt={similarRental.createdAt}
                  phone={similarRental.phone}
                  whatsapp={similarRental.whatsapp}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
