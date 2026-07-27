"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type JobListing = {
  id: string;
  title: string;
  company: string;
  category: string;
  employment_type: string;
  location: string;
  pay: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function MyJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setJobs((data ?? []) as JobListing[]);
    setLoading(false);
  }

  async function deleteJob(job: JobListing) {
    if (!confirm(`Delete "${job.title}"?`)) return;

    setDeletingId(job.id);

    await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id);

    setJobs((current) =>
      current.filter((item) => item.id !== job.id)
    );

    setDeletingId(null);
  }

  function statusColor(status: string) {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";

      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading your jobs...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-6xl">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-black text-[#064d2b]">
              My Job Listings
            </h1>

            <p className="mt-2 text-slate-600">
              Manage the jobs you have posted.
            </p>

          </div>

          <Link
            href="/jobs/post"
            className="rounded-xl bg-[#087531] px-6 py-3 font-bold text-white hover:bg-[#064d2b]"
          >
            + Post Job
          </Link>

        </div>        {jobs.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-2xl font-black text-slate-900">
              You haven't posted any jobs yet.
            </h2>

            <p className="mt-3 text-slate-600">
              Start helping the community by posting your first job opening.
            </p>

            <Link
              href="/jobs/post"
              className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-bold text-white hover:bg-[#064d2b]"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black text-slate-900">
                        {job.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${statusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="mt-2 font-bold text-[#087531]">
                      {job.company}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span>📍 {job.location}</span>
                      <span>💼 {job.category}</span>
                      <span>{job.employment_type}</span>

                      {job.pay && <span>💵 {job.pay}</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {job.status === "approved" && (
                      <Link
                        href={`/jobs/${job.id}`}
                        className="rounded-xl bg-[#087531] px-5 py-3 text-sm font-bold text-white hover:bg-[#064d2b]"
                      >
                        View
                      </Link>
                    )}

                    <Link
                      href={`/jobs/edit/${job.id}`}
                      className="rounded-xl border border-[#087531] px-5 py-3 text-sm font-bold text-[#087531] hover:bg-green-50"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteJob(job)}
                      disabled={deletingId === job.id}
                      className="rounded-xl border border-red-300 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === job.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}