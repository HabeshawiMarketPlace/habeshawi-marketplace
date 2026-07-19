import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ImageGallery from "@/components/housing/ImageGallery";

export const dynamic = "force-dynamic";

type HousingDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function HousingDetailsPage({
  params,
}: HousingDetailsPageProps) {
 const { id } = await params;


  // Load rental
  const { data: rental, error: rentalError } = await supabase
    .from("rentals")
    .select("*")
    .eq("id", id)
    .eq("payment_status", "paid")
    .eq("status", "approved")
    .single();

  if (rentalError || !rental) {
    notFound();
  }

  // Load uploaded images
  const { data: rentalImages, error: imagesError } = await supabase
    .from("rental_images")
    .select("image_url, display_order")
    .eq("rental_id", id)
    .order("display_order", { ascending: true });

  if (imagesError) {
    console.error(imagesError);
  }

  const uploadedImages =
    rentalImages?.map((image) => image.image_url) ?? [];
    console.log("Rental ID:", id);
console.log("Rental Images:", rentalImages);
console.log("Uploaded Images:", uploadedImages);

  const images =
    uploadedImages.length > 0
      ? uploadedImages
      : [
          rental.image_url ||
            "/housing/apartments/apartment1.jpg",
        ];

  const phoneLink = rental.phone
    ? `tel:${String(rental.phone).replace(/[^\d+]/g, "")}`
    : null;

  const whatsappLink = rental.whatsapp
    ? `https://wa.me/${String(rental.whatsapp).replace(/\D/g, "")}`
    : null;

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">

        <a
          href="/housing"
          className="font-semibold text-[#087531] hover:underline"
        >
          ← Back to Listings
        </a>

        <div className="mt-6 rounded-2xl bg-white shadow overflow-hidden">

          {/* Photo Gallery */}
          <ImageGallery
            images={images}
            title={rental.title}
          />

          <div className="grid gap-8 p-8 md:grid-cols-[2fr_1fr]">

            <section>

              <p className="text-sm uppercase tracking-wide font-semibold text-[#087531]">
                {rental.property_type}
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {rental.title}
              </h1>

              <p className="mt-3 text-lg text-gray-600">
                {rental.location}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                {rental.bedrooms && (
                  <span className="rounded-full bg-gray-100 px-4 py-2">
                    🛏 {rental.bedrooms} Bedrooms
                  </span>
                )}

                {rental.bathrooms && (
                  <span className="rounded-full bg-gray-100 px-4 py-2">
                    🚿 {rental.bathrooms} Bathrooms
                  </span>
                )}

                {rental.available_date && (
                  <span className="rounded-full bg-gray-100 px-4 py-2">
                    Available{" "}
                    {new Date(
                      `${rental.available_date}T00:00:00`
                    ).toLocaleDateString()}
                  </span>
                )}

              </div>

              <div className="mt-8 border-t pt-8">

                <h2 className="text-2xl font-bold">
                  Description
                </h2>

                <p className="mt-4 whitespace-pre-line leading-8 text-gray-700">
                  {rental.description || "No description provided."}
                </p>

              </div>

            </section>

            <aside className="rounded-2xl border p-6 h-fit">

              <p className="text-gray-500">
                Monthly Rent
              </p>

              <h2 className="mt-1 text-4xl font-bold text-[#064d2b]">
                ${Number(rental.price).toLocaleString()}
              </h2>

              <div className="mt-6 grid gap-3">

                {phoneLink && (
                  <a
                    href={phoneLink}
                    className="rounded-lg bg-[#087531] px-5 py-3 text-center font-semibold text-white hover:bg-[#064d2b]"
                  >
                    📞 Call
                  </a>
                )}

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-[#087531] px-5 py-3 text-center font-semibold text-[#087531]"
                  >
                    WhatsApp
                  </a>
                )}

                {rental.email && (
                  <a
                    href={`mailto:${rental.email}`}
                    className="rounded-lg border px-5 py-3 text-center"
                  >
                    Email
                  </a>
                )}

              </div>

              <p className="mt-6 text-xs text-gray-500">
                Never send money before seeing the property in person.
              </p>

            </aside>

          </div>

        </div>

      </div>
    </main>
  );
}