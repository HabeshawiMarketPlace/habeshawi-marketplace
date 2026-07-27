"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import EditJobAdminForm from "@/components/admin/EditJobAdminForm";

export default function AdminEditJobPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJob();
  }, []);

  async function loadJob() {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setError("Unable to load this job.");
      setLoading(false);
      return;
    }

    setJob(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8">
        <p className="font-bold text-red-600">
          {error}
        </p>

        <Link
          href="/admin/jobs"
          className="mt-6 inline-block font-bold text-[#087531]"
        >
          ← Back to Jobs
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] py-10 px-6">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/admin/jobs"
          className="font-bold text-[#087531]"
        >
          ← Back
        </Link>

        <h1 className="mt-5 text-4xl font-black text-[#064d2b]">
          Edit Job
        </h1>

        <p className="mt-3 text-slate-600">
          Administrator changes are saved immediately without sending the job
          back for approval.
        </p>

        <div className="mt-8">
          <EditJobAdminForm job={job} />
        </div>

      </div>
    </main>
  );
}