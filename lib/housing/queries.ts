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
  commercialType: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  imageUrl: string;
  images: RentalImage[];
  availableDate: string | null;
  createdAt: string;
};

export type RentalFilters = {
  location?: string;
  propertyType?: string;
  commercialType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: "newest" | "price_low" | "price_high";
};

const FALLBACK_IMAGE = "/housing/apartments/apartment1.jpg";

const rentalSelect = `
  *,
  rental_images (
    image_url,
    display_order
  )
`;

function mapRental(row: Record<string, unknown>): RentalListing {
  const rawImages = Array.isArray(row.rental_images)
    ? row.rental_images
    : [];

  const images: RentalImage[] = rawImages
    .map((image) => {
      const imageRecord = image as Record<string, unknown>;

      return {
        imageUrl: String(imageRecord.image_url ?? ""),
        displayOrder: Number(imageRecord.display_order ?? 0),
      };
    })
    .filter((image) => Boolean(image.imageUrl))
    .sort(
      (first, second) =>
        first.displayOrder - second.displayOrder,
    );

  return {
    id: String(row.id),
    title: String(row.title ?? "Untitled rental"),
    description: String(row.description ?? ""),
    location: String(
      row.location ?? "Location not provided",
    ),
    price: Number(row.price ?? 0),

    bedrooms:
      row.bedrooms === null || row.bedrooms === undefined
        ? null
        : Number(row.bedrooms),

    bathrooms:
      row.bathrooms === null || row.bathrooms === undefined
        ? null
        : Number(row.bathrooms),

    propertyType:
      row.property_type === null ||
      row.property_type === undefined
        ? null
        : String(row.property_type),

    commercialType:
      row.commercial_type === null ||
      row.commercial_type === undefined
        ? null
        : String(row.commercial_type),

    phone:
      row.phone === null || row.phone === undefined
        ? null
        : String(row.phone),

    whatsapp:
      row.whatsapp === null || row.whatsapp === undefined
        ? null
        : String(row.whatsapp),

    email:
      row.email === null || row.email === undefined
        ? null
        : String(row.email),

    imageUrl:
      images[0]?.imageUrl ||
      (row.image_url
        ? String(row.image_url)
        : FALLBACK_IMAGE),

    images,

    availableDate:
      row.available_date === null ||
      row.available_date === undefined
        ? null
        : String(row.available_date),

    createdAt: String(
      row.created_at ?? new Date(0).toISOString(),
    ),
  };
}

function isPositiveNumber(
  value: number | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

export async function getRentals(
  filters: RentalFilters = {},
): Promise<RentalListing[]> {
  let query = supabase
    .from("rentals")
    .select(rentalSelect)
    .ilike("payment_status", "paid")
    .ilike("status", "approved");

  const location = filters.location?.trim();
  const propertyType = filters.propertyType?.trim();
  const commercialType = filters.commercialType?.trim();

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  if (propertyType) {
    query = query.ilike("property_type", propertyType);
  }

  if (
    propertyType === "commercial" &&
    commercialType
  ) {
    query = query.ilike(
      "commercial_type",
      commercialType,
    );
  }

  if (isPositiveNumber(filters.minPrice)) {
    query = query.gte("price", filters.minPrice);
  }

  if (isPositiveNumber(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }

  if (isPositiveNumber(filters.bedrooms)) {
    query = query.gte("bedrooms", filters.bedrooms);
  }

  if (isPositiveNumber(filters.bathrooms)) {
    query = query.gte("bathrooms", filters.bathrooms);
  }

  if (filters.sortBy === "price_low") {
    query = query.order("price", { ascending: true });
  } else if (filters.sortBy === "price_high") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", {
      ascending: false,
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unable to load rentals:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map((rental) =>
    mapRental(rental as Record<string, unknown>),
  );
}

export async function getLatestRentals(
  limit = 4,
): Promise<RentalListing[]> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.floor(limit)
      : 4;

  const { data, error } = await supabase
    .from("rentals")
    .select(rentalSelect)
    .ilike("payment_status", "paid")
    .ilike("status", "approved")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error(
      "Unable to load latest rentals:",
      error,
    );
    return [];
  }

  return (data ?? []).map((rental) =>
    mapRental(rental as Record<string, unknown>),
  );
}

export async function getRentalById(
  id: string,
): Promise<RentalListing | null> {
  const cleanId = id.trim();

  if (!cleanId) {
    return null;
  }

  const { data, error } = await supabase
    .from("rentals")
    .select(rentalSelect)
    .eq("id", cleanId)
    .maybeSingle();

  if (error) {
    console.error(
      `Unable to load rental ${cleanId}:`,
      error,
    );

    return null;
  }

  return data
    ? mapRental(data as Record<string, unknown>)
    : null;
}

export async function getSimilarRentals(
  rental: RentalListing,
  limit = 3,
): Promise<RentalListing[]> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.floor(limit)
      : 3;

  let query = supabase
    .from("rentals")
    .select(rentalSelect)
    .ilike("payment_status", "paid")
    .ilike("status", "approved")
    .neq("id", rental.id)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (rental.propertyType) {
    query = query.ilike(
      "property_type",
      rental.propertyType,
    );
  }

  if (
    rental.propertyType === "commercial" &&
    rental.commercialType
  ) {
    query = query.ilike(
      "commercial_type",
      rental.commercialType,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "Unable to load similar rentals:",
      error,
    );

    return [];
  }

  return (data ?? []).map((similarRental) =>
    mapRental(
      similarRental as Record<string, unknown>,
    ),
  );
}