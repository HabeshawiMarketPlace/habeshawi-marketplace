import { supabase } from "@/lib/supabase";

export type MarketplaceListing = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  condition: string | null;
  city: string;
  state: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  imageUrl: string | null;
  featured: boolean;
  createdAt: string;
};

export type MarketplaceFilters = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  limit?: number;
};

function mapListing(
  row: Record<string, unknown>,
): MarketplaceListing {
  return {
    id: String(row.id),
    title: String(row.title ?? "Untitled listing"),
    category: String(row.category ?? "Other"),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    condition: row.condition ? String(row.condition) : null,
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    sellerName: String(row.seller_name ?? ""),
    sellerEmail: String(row.seller_email ?? ""),
    sellerPhone: String(row.seller_phone ?? ""),
    imageUrl: row.image_url ? String(row.image_url) : null,
    featured: Boolean(row.featured),
    createdAt: String(row.created_at ?? new Date(0).toISOString()),
  };
}

function isValidNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export async function getMarketplaceListings(
  filters: MarketplaceFilters = {},
): Promise<MarketplaceListing[]> {
  let query = supabase
    .from("marketplace_listings")
    .select("*")
    .ilike("status", "approved")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const search = filters.search?.trim();
  const category = filters.category?.trim();

  if (search) {
    const safeSearch = search.replaceAll(",", " ");
    query = query.or(
      `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,city.ilike.%${safeSearch}%,state.ilike.%${safeSearch}%`,
    );
  }

  if (category && category.toLowerCase() !== "all") {
    query = query.ilike("category", category);
  }

  if (isValidNumber(filters.minPrice)) {
    query = query.gte("price", filters.minPrice);
  }

  if (isValidNumber(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }

  if (typeof filters.featured === "boolean") {
    query = query.eq("featured", filters.featured);
  }

  if (
    typeof filters.limit === "number" &&
    Number.isFinite(filters.limit) &&
    filters.limit > 0
  ) {
    query = query.limit(Math.floor(filters.limit));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unable to load marketplace listings:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(mapListing);
}

export async function getFeaturedMarketplaceListings(limit = 8) {
  const featuredListings = await getMarketplaceListings({
    featured: true,
    limit,
  });

  // If there are featured listings, show them.
  if (featuredListings.length > 0) {
    return featuredListings;
  }

  // Otherwise, show the newest approved listings.
  return getMarketplaceListings({
    limit,
  });
}

export async function getRecentMarketplaceListings(
  limit = 12,
): Promise<MarketplaceListing[]> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 12;

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .ilike("status", "approved")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("Unable to load recent marketplace listings:", error);
    return [];
  }

  return (data ?? []).map(mapListing);
}

export async function getMarketplaceListingById(
  id: string,
): Promise<MarketplaceListing | null> {
  const cleanId = id.trim();

  if (!cleanId) {
    return null;
  }

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("id", cleanId)
    .ilike("status", "approved")
    .maybeSingle();

  if (error) {
    console.error(`Unable to load marketplace listing ${cleanId}:`, error);
    return null;
  }

  return data ? mapListing(data) : null;
}

export async function getSimilarMarketplaceListings(
  listing: MarketplaceListing,
  limit = 4,
): Promise<MarketplaceListing[]> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 4;

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .ilike("status", "approved")
    .ilike("category", listing.category)
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("Unable to load similar marketplace listings:", error);
    return [];
  }

  return (data ?? []).map(mapListing);
}
