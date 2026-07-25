import { supabase } from "@/lib/supabase";
import type { BusinessDetails } from "./sample-data";
import type { BusinessCategory } from "@/types/business";

function mapBusiness(
  row: Record<string, unknown>,
): BusinessDetails {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    category: (row.category ?? "Other") as BusinessCategory,
    description: String(row.description ?? ""),
    address: String(row.address ?? ""),
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    phone: String(row.phone ?? ""),
    email: row.email ? String(row.email) : undefined,
    website: row.website ? String(row.website) : undefined,

    coverImageUrl: row.image_url ? String(row.image_url) : undefined,
    logoImageUrl: row.logo_url ? String(row.logo_url) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,

    featured: Boolean(row.featured),
    rating:
      typeof row.rating === "number"
        ? row.rating
        : undefined,
    reviewCount: Number(row.review_count ?? 0),

    openNow: true,

    specialties: Array.isArray(row.specialties)
      ? row.specialties.map(String)
      : [],

    hours: [
      { day: "Monday", hours: String(row.monday_hours ?? "Closed") },
      { day: "Tuesday", hours: String(row.tuesday_hours ?? "Closed") },
      { day: "Wednesday", hours: String(row.wednesday_hours ?? "Closed") },
      { day: "Thursday", hours: String(row.thursday_hours ?? "Closed") },
      { day: "Friday", hours: String(row.friday_hours ?? "Closed") },
      { day: "Saturday", hours: String(row.saturday_hours ?? "Closed") },
      { day: "Sunday", hours: String(row.sunday_hours ?? "Closed") },
    ],
  };
}
export async function getBusinesses(): Promise<BusinessDetails[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error(error);
    return [];
  }

  return data.map(mapBusiness);
}

export async function getBusinessById(
  id: string,
): Promise<BusinessDetails | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !data) {
    return null;
  }

  return mapBusiness(data);
}

export async function getSimilarBusinesses(
  business: BusinessDetails,
  limit = 3,
): Promise<BusinessDetails[]> {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "approved")
    .eq("category", business.category)
    .neq("id", business.id)
    .limit(limit);

  return (data ?? []).map(mapBusiness);
}