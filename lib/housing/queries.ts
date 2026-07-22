import { supabase } from "@/lib/supabase";

export type RentalImage = {
  imageUrl: string;
  displayOrder: number;
};

export type RentalListing = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  propertyType: string | null;
  phone: string | null;
  whatsapp: string | null;
  imageUrl: string | null;
  images: RentalImage[];
  createdAt: string;
};

function mapRental(row: any): RentalListing {
  const images: RentalImage[] = [...(row.rental_images ?? [])]
    .map((image: any) => ({
      imageUrl: image.image_url,
      displayOrder: Number(image.display_order ?? 0),
    }))
    .filter((image) => Boolean(image.imageUrl))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    location: row.location ?? "Location not provided",
    price: Number(row.price ?? 0),
    bedrooms: row.bedrooms ?? null,
    bathrooms: row.bathrooms ?? null,
    propertyType: row.property_type ?? null,
    phone: row.phone ?? null,
    whatsapp: row.whatsapp ?? null,
    imageUrl:
      images[0]?.imageUrl ||
      row.image_url ||
      "/housing/apartments/apartment1.jpg",
    images,
    createdAt: row.created_at,
  };
}

const rentalSelect = `
  *,
  rental_images (
    image_url,
    display_order
  )
`;

export async function getRentals(): Promise<RentalListing[]> {
  const { data, error } = await supabase
    .from("rentals")
    .select(rentalSelect)
    .eq("payment_status", "paid")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Unable to load rentals:", error);
    return [];
  }

  return data.map(mapRental);
}

export async function getLatestRentals(
  limit = 4,
): Promise<RentalListing[]> {
  const { data, error } = await supabase
    .from("rentals")
    .select(rentalSelect)
    .eq("payment_status", "paid")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Unable to load latest rentals:", error);
    return [];
  }

  return data.map(mapRental);
}

export async function getRentalById(
  id: string,
): Promise<RentalListing | null> {
  const { data, error } = await supabase
    .from("rentals")
    .select(rentalSelect)
    .eq("id", id)
    .eq("payment_status", "paid")
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRental(data);
}

export async function getSimilarRentals(
  rental: RentalListing,
  limit = 3,
): Promise<RentalListing[]> {
  let query = supabase
    .from("rentals")
    .select(rentalSelect)
    .eq("payment_status", "paid")
    .eq("status", "approved")
    .neq("id", rental.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (rental.propertyType) {
    query = query.eq("property_type", rental.propertyType);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map(mapRental);
}