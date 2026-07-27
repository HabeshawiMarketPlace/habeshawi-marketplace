"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    setJobs(data ?? []);
    setLoading(false);
  }

  async function approve(id: string) {
    await supabase
      .from("jobs")
      .update({
        status: "approved",
      })
      .eq("id", id);

    loadJobs();
  }

  async function reject(id: string) {
    await supabase
      .from("jobs")
      .update({
        status: "rejected",
      })
      .eq("id", id);

    loadJobs();
  }

  async function remove(id: string) {
    if (!confirm("Delete this job?")) return;

    await supabase
      .from("jobs")
      .delete()
      .eq("id", id);

    loadJobs();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] p-8">

      <h1 className="mb-8 text-4xl font-black">
        Jobs Administration
      </h1>

      <div className="space-y-6">

        {jobs.map((job) => (

          <div
            key={job.id}
            className="rounded-2xl bg-white p-6 shadow"
          >

            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

              <div>

                <h2 className="text-2xl font-black">
                  {job.title}
                </h2>

                <p className="mt-2 font-bold text-[#087531]">
                  {job.company}
                </p>

                <p className="mt-2 text-sm">
                  {job.location}
                </p>

                <p className="mt-2">
                  Status:
                  <strong className="ml-2">
                    {job.status}
                  </strong>
                </p>

              </div>

              <div className="flex flex-wrap gap-3">

                <Link
                  href={`/admin/jobs/edit/${job.id}`}
                  className="rounded bg-blue-600 px-5 py-3 font-bold text-white"
                >
                  Edit
                </Link>

                <button
                  onClick={() => approve(job.id)}
                  className="rounded bg-green-600 px-5 py-3 font-bold text-white"
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(job.id)}
                  className="rounded bg-yellow-600 px-5 py-3 font-bold text-white"
                >
                  Reject
                </button>

                <button
                  onClick={() => remove(job.id)}
                  className="rounded bg-red-600 px-5 py-3 font-bold text-white"
                >
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}