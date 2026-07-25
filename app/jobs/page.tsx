import Link from "next/link";
import JobCard from "@/components/jobs/JobCard";
import { getApprovedJobs } from "@/lib/jobs/queries";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await getApprovedJobs();

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl bg-[#064d2b] px-6 py-10 text-white shadow-lg md:px-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-black">
                Free Community Job Board
              </span>

              <h1 className="mt-5 text-4xl font-black md:text-5xl">
                Find Jobs in Our Community
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-green-50">
                Discover approved job opportunities shared for the Habeshawi
                and DMV community. Employers can post openings at no cost.
              </p>
            </div>

            <Link
              href="/jobs/post"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300"
            >
              Post a Job — Free
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm leading-6 text-green-950">
          <strong>Community safety:</strong> Every submitted job is reviewed
          before it is published. Job seekers should never pay money to apply
          for a job.
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#087531]">
                Community Opportunities
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Available Jobs
              </h2>
            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-[#064d2b]">
              {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h3 className="text-2xl font-black text-slate-900">
                No Jobs Available Yet
              </h3>

              <p className="mt-3 text-slate-600">
                Be the first to post a job opportunity for the Habeshawi
                community.
              </p>

              <Link
                href="/jobs/post"
                className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-bold text-white transition hover:bg-[#064d2b]"
              >
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}