import Image from "next/image";
import Link from "next/link";

type ListingCardProps = {
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
};

export default function ListingCard({
  href,
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  description,
  commercialType = null,
  propertyType,
  createdAt,
}: ListingCardProps) {
  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative">
        <Image
          src={image}
          alt={title}
          width={500}
          height={350}
          className="h-56 w-full object-cover"
        />

        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-white p-2 shadow hover:bg-red-50"
          aria-label="Add to favorites"
        >
          ❤️
        </button>
      </div>

      <div className="p-4">
        <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-[#087531]">
          {propertyType ?? "Rental"}
        </span>

        <h3 className="mt-3 text-lg font-bold">{title}</h3>

        <p className="mt-2 text-2xl font-bold text-[#087531]">
          ${price.toLocaleString()}/month
        </p>

        <p className="mt-2 text-slate-500">
          📍 {location}
        </p>

        <p className="mt-2 text-slate-600">
          🛏 {bedrooms ?? 0} Beds • 🛁 {bathrooms ?? 0} Baths
        </p>

        <p className="mt-3 line-clamp-3 text-slate-600">
          {description}
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Posted {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}