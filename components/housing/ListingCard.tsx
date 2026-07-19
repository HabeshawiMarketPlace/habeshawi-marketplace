import Image from "next/image";
import Link from "next/link";

type ListingCardProps = {
  id: string;
  href: string;
  image: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string;
  propertyType: string | null;
  createdAt: string;
  phone: string | null;
  whatsapp: string | null;
};

export default function ListingCard({
  id,
  href,
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  description,
  propertyType,
  createdAt,
  phone,
  whatsapp,
}: ListingCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg">
<Link href={href} className="block">
  <div className="relative">
    <Image
      src={image}
      alt={title}
      width={500}
      height={350}
      className="h-56 w-full object-cover"
    />
  </div>
</Link>

      <div className="p-4">
        <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-[#087531]">
          {propertyType ?? "Rental"}
        </span>

        <Link href={href}>
  <h3 className="mt-3 text-lg font-bold hover:text-[#087531] hover:underline">
    {title}
  </h3>
</Link>

        <p className="mt-2 text-2xl font-bold text-[#087531]">
          ${price.toLocaleString()}/month
        </p>

        <p className="mt-2">📍 {location}</p>

        <p className="mt-2">
          🛏 {bedrooms ?? 0} Beds • 🛁 {bathrooms ?? 0} Baths
        </p>

        <p className="mt-3 text-slate-600 line-clamp-3">
          {description}
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
              >
                📞 Call
              </a>
            )}

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-[#25D366] px-4 py-2 font-semibold text-white hover:bg-[#1DA851]"
              >
                💬 WhatsApp
              </a>
            )}

            {phone && (
              <a
                href={`sms:${phone}`}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                💬 Text
              </a>
            )}
          </div>

          {phone && (
            <p className="text-sm text-slate-600">
              ☎ {phone}
            </p>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Posted {new Date(createdAt).toLocaleDateString()}
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            href={href}
            className="flex-1 rounded-lg bg-[#087531] px-4 py-2 text-center font-semibold text-white hover:bg-[#064d2b]"
          >
            View Details
          </Link>

          <Link
            href={`/post-ad/edit/${id}`}
            className="flex-1 rounded-lg border border-[#087531] px-4 py-2 text-center font-semibold text-[#087531] hover:bg-green-50"
          >
            Edit Listing
          </Link>
        </div>
      </div>
    </div>
  );
}