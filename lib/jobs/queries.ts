import { supabase } from "@/lib/supabase";
import type { Job, JobRow } from "@/types/job";

export type JobFilters = {
  search?: string;
  category?: string;
  employmentType?: string;
  location?: string;
  limit?: number;
};

function formatPostedAt(createdAt: string): string {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) {
    return "Recently posted";
  }

  const now = new Date();
  const differenceMs = Math.max(0, now.getTime() - created.getTime());
  const days = Math.floor(differenceMs / 86_400_000);

  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;

  return `Posted ${created.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

export function mapJobRow(row: JobRow): Job {
  return {
    id: String(row.id),
    title: String(row.title ?? "Untitled job"),
    company: String(row.company ?? "Employer"),
    category: row.category,
    employmentType: row.employment_type,
    location: String(row.location ?? "Location not provided"),
    pay: row.pay ?? undefined,
    description: String(row.description ?? ""),
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    contactName: String(row.contact_name ?? ""),
    contactEmail: String(row.contact_email ?? ""),
    contactPhone: row.contact_phone ?? undefined,
    applyUrl: row.apply_url ?? undefined,
    postedAt: formatPostedAt(String(row.created_at ?? "")),
    createdAt: String(row.created_at ?? ""),
  };
}

function cleanSearch(value: string): string {
  return value.replaceAll(",", " ").trim();
}

export async function getApprovedJobs(
  filters: JobFilters = {},
): Promise<Job[]> {
  let query = supabase
    .from("jobs")
    .select("*")
    .ilike("status", "approved")
    .order("created_at", { ascending: false });

  const search = cleanSearch(filters.search ?? "");
  const category = filters.category?.trim();
  const employmentType = filters.employmentType?.trim();
  const location = filters.location?.trim();

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`,
    );
  }

  if (category && category.toLowerCase() !== "all") {
    query = query.ilike("category", category);
  }

  if (employmentType && employmentType.toLowerCase() !== "all") {
    query = query.ilike("employment_type", employmentType);
  }

  if (location) {
    query = query.ilike("location", `%${location}%`);
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
    console.error("Unable to load approved jobs:", error.message);
    return [];
  }

  return ((data ?? []) as JobRow[]).map(mapJobRow);
}

export async function getFeaturedJobs(limit = 6): Promise<Job[]> {
  const jobs = await getApprovedJobs({ limit });
  return jobs;
}

export async function getRecentJobs(limit = 12): Promise<Job[]> {
  return getApprovedJobs({ limit });
}

export async function getApprovedJobById(
  id: string,
): Promise<Job | null> {
  const cleanId = decodeURIComponent(id).trim();

  if (!cleanId) {
    return null;
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", cleanId)
    .ilike("status", "approved")
    .maybeSingle();

  if (error) {
    console.error(`Unable to load job ${cleanId}:`, error.message);
    return null;
  }

  return data ? mapJobRow(data as JobRow) : null;
}

export async function getSimilarJobs(
  job: Job,
  limit = 3,
): Promise<Job[]> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 3;

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .ilike("status", "approved")
    .ilike("category", String(job.category))
    .neq("id", job.id)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("Unable to load similar jobs:", error.message);
    return [];
  }

  return ((data ?? []) as JobRow[]).map(mapJobRow);
}