import Image from "next/image";

type RentalCardProps = {
  image: string;
  title: string;
  price: string;
  location: string;
  description: string;
  phone?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  available?: boolean;
};

export default function RentalCard({
  image,
  title,
  price,
  location,
  description,
  phone,
  beds,
  baths,
  sqft,
  available = true,
}: RentalCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg">
      <Image
        src={image}
        alt={title}
        width={600}
        height={400}
        className="h-56 w-full object-cover"
      />

      <div className="p-5">
        <h3 className="text-xl font-bold">{title}</h3>

        <p className="mt-2 text-2xl font-bold text-[#087531]">
          {price}
        </p>

        <p className="mt-2 text-slate-500">
          📍 {location}
        </p>
        <div className="mt-3 flex gap-4 text-sm text-slate-600">
  {beds && <span>🛏️ {beds} Bed</span>}
  {baths && <span>🚿 {baths} Bath</span>}
  {sqft && <span>📐 {sqft} sq ft</span>}
</div>

{available && (
  <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
    Available Now
  </span>
)}

        <p className="mt-3 text-sm text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}