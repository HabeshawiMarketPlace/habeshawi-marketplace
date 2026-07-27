"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import EditJobForm from "@/components/jobs/EditJobForm";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadJob();
  }, []);

  async function loadJob() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
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
      <main className="min-h-screen p-10">
        <p className="text-red-600 font-bold">
          {error}
        </p>

        <Link
          href="/jobs/my-listings"
          className="mt-6 inline-block font-bold text-[#087531]"
        >
          ← Back to My Jobs
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] py-10 px-6">
      <div className="mx-auto max-w-5xl">

        <Link
          href="/jobs/my-listings"
          className="font-bold text-[#087531]"
        >
          ← Back to My Jobs
        </Link>

        <h1 className="mt-5 text-4xl font-black text-[#064d2b]">
          Edit Job Listing
        </h1>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          Any changes you make will require administrator approval again.
        </div>

        <div className="mt-8">
          <EditJobForm job={job} />
        </div>

      </div>
    </main>
  );
}