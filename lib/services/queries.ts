import { supabase } from "@/lib/supabase";

export type ApprovedService = {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
};

type ServiceRow = {
  id: string;
  service_name: string | null;
  category: string | null;
  description: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: string | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function mapService(row: ServiceRow): ApprovedService {
  return {
    id: String(row.id),
    serviceName: String(row.service_name ?? "Community Service"),
    category: String(row.category ?? "Service"),
    description: String(row.description ?? ""),
    contactName: row.contact_name ? String(row.contact_name) : null,
    phone: row.phone ? String(row.phone) : null,
    email: row.email ? String(row.email) : null,
    website: row.website ? String(row.website) : null,
    address: row.address ? String(row.address) : null,
    city: row.city ? String(row.city) : null,
    state: row.state ? String(row.state) : null,
    zip: row.zip ? String(row.zip) : null,
    price: row.price ? String(row.price) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    createdAt: String(row.created_at ?? new Date(0).toISOString()),
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function getApprovedServices(
  limit?: number,
): Promise<ApprovedService[]> {
  let query = supabase
    .from("services")
    .select(
      "id, service_name, category, description, contact_name, phone, email, website, address, city, state, zip, price, image_url, created_at, updated_at",
    )
    .ilike("status", "approved")
    .order("created_at", { ascending: false });

  if (
    typeof limit === "number" &&
    Number.isFinite(limit) &&
    limit > 0
  ) {
    query = query.limit(Math.floor(limit));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unable to load approved services:", error.message);
    return [];
  }

  return ((data ?? []) as ServiceRow[]).map(mapService);
}

export async function getApprovedServiceById(
  id: string,
): Promise<ApprovedService | null> {
  const cleanId = decodeURIComponent(id).trim();

  if (!cleanId) {
    return null;
  }

  const { data, error } = await supabase
    .from("services")
    .select(
      "id, service_name, category, description, contact_name, phone, email, website, address, city, state, zip, price, image_url, created_at, updated_at",
    )
    .eq("id", cleanId)
    .ilike("status", "approved")
    .maybeSingle();

  if (error) {
    console.error(`Unable to load service ${cleanId}:`, error.message);
    return null;
  }

  return data ? mapService(data as ServiceRow) : null;
}