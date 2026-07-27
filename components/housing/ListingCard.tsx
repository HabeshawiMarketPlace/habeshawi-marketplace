import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "./FavoriteButton";

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
  commercialType?: string | null;
  createdAt: string;
  phone: string | null;
  whatsapp: string | null;
};

function formatLabel(value: string | null) {
  if (!value) return "";
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

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
  commercialType = null,
  createdAt,
  phone,
  whatsapp,
}: ListingCardProps) {
  const isCommercial = propertyType === "commercial";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <Link href={href}>
          <Image
            src={image}
            alt={title}
            width={500}
            height={350}
            className="h-56 w-full object-cover"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#087531] px-3 py-1 text-sm font-semibold text-white">
            {formatLabel(propertyType) || "Rental"}
          </span>

          {isCommercial && commercialType && (
            <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-semibold text-white">
              {formatLabel(commercialType)}
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton rentalId={id} title={title} />
        </div>
      </div>

      <div className="p-4">
        <Link href={href}>
          <h3 className="mt-3 text-lg font-bold hover:text-[#087531] hover:underline">
            {title}
          </h3>
        </Link>

        <p className="mt-2 text-2xl font-bold text-[#087531]">
          ${price.toLocaleString()}/month
        </p>

        <p className="mt-2">📍 {location}</p>

        {!isCommercial && (
          <p className="mt-2">
            🛏 {bedrooms ?? 0} Beds • 🛁 {bathrooms ?? 0} Baths
          </p>
        )}

        <p className="mt-3 line-clamp-3 text-slate-600">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {phone && (
            <>
              <a href={`tel:${phone}`} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">📞 Call</a>
              <a href={`sms:${phone}`} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">💬 Text</a>
            </>
          )}

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g,"")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#25D366] px-4 py-2 font-semibold text-white"
            >
              💬 WhatsApp
            </a>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Posted {new Date(createdAt).toLocaleDateString()}
        </p>

        <div className="mt-6">
          <Link
            href={href}
            className="block rounded-lg bg-[#087531] px-4 py-2 text-center font-semibold text-white hover:bg-[#064d2b]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}