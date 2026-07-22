import Link from "next/link";
import JobCard from "@/components/jobs/JobCard";
import { getApprovedJobs } from "@/lib/jobs/queries";

export default async function LatestJobs() {
  const jobs = await getApprovedJobs();
  const latestJobs = jobs.slice(0, 4);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-bold uppercase tracking-wider text-[#087531]">
              Community Opportunities
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#064d2b] sm:text-4xl">
              Latest Jobs
            </h2>

            <p className="mt-2 max-w-2xl text-slate-600">
              Discover the newest approved job opportunities shared by our
              community throughout the Washington DC, Maryland, and Virginia
              area.
            </p>

            <p className="mt-2 font-semibold text-[#087531]">
              አዳዲስ የስራ እድሎች
            </p>
          </div>

          <Link
            href="/jobs"
            className="font-bold text-[#087531] transition hover:text-[#064d2b] hover:underline"
          >
            View All Jobs →
          </Link>
        </div>

        {latestJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <h3 className="text-2xl font-black text-slate-900">
              No Jobs Available Yet
            </h3>

            <p className="mt-3 text-slate-600">
              Be the first to post a job for the Habeshawi community.
            </p>

            <Link
              href="/jobs/post"
              className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-bold text-white transition hover:bg-[#064d2b]"
            >
              Post a Job
            </Link>
          </div>
        )}

        <div className="mt-12 rounded-3xl bg-[#064d2b] px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 lg:px-10">
          <div>
            <h3 className="text-2xl font-black">
              Are You Hiring?
            </h3>

            <p className="mt-2 max-w-2xl text-white/75">
              Post your job opening and connect with Ethiopian and Eritrean job
              seekers across the DMV area.
            </p>
          </div>

          <Link
            href="/jobs/post"
            className="mt-6 inline-flex shrink-0 items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 font-black text-[#064d2b] transition hover:bg-yellow-300 sm:mt-0"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </section>
  );
}