import { supabase } from "@/lib/supabase";
import type { BusinessDetails } from "./sample-data";

function mapBusiness(row: any): BusinessDetails {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    address: row.address,
    city: row.city,
    state: row.state,
    phone: row.phone,
    email: row.email,
    website: row.website,

coverImageUrl: row.image_url ?? undefined,
logoImageUrl: row.logo_url ?? undefined,

    // NEW
    imageUrl: row.image_url ?? null,

    featured: row.featured ?? false,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? 0,

    openNow: true,

    specialties: row.specialties ?? [],

    hours: [
      { day: "Monday", hours: row.monday_hours ?? "Closed" },
      { day: "Tuesday", hours: row.tuesday_hours ?? "Closed" },
      { day: "Wednesday", hours: row.wednesday_hours ?? "Closed" },
      { day: "Thursday", hours: row.thursday_hours ?? "Closed" },
      { day: "Friday", hours: row.friday_hours ?? "Closed" },
      { day: "Saturday", hours: row.saturday_hours ?? "Closed" },
      { day: "Sunday", hours: row.sunday_hours ?? "Closed" },
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