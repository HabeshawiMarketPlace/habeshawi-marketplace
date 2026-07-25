import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JobCard from "@/components/jobs/JobCard";
import {
  getApprovedJobById,
  getSimilarJobs,
} from "@/lib/jobs/queries";

type JobDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getApprovedJobById(decodeURIComponent(id));

  if (!job) {
    return { title: "Job Not Found | Habeshawi Marketplace" };
  }

  return {
    title: `${job.title} at ${job.company} | Habeshawi Marketplace`,
    description: `${job.title} opportunity in ${job.location}. ${job.description.slice(0, 140)}`,
  };
}

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  const { id } = await params;
  const job = await getApprovedJobById(decodeURIComponent(id));

  if (!job) {
    notFound();
  }

  const similarJobs = await getSimilarJobs(job, 3);

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 font-bold text-[#087531] hover:text-[#064d2b]"
        >
          ← Back to Jobs
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="bg-[#064d2b] px-6 py-9 text-white md:px-10">
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-black">
                {job.category}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                {job.employmentType}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-black md:text-5xl">
              {job.title}
            </h1>
            <p className="mt-3 text-xl font-bold text-green-50">
              {job.company}
            </p>

            <div className="mt-6 grid gap-3 text-green-50 sm:grid-cols-3">
              <p>📍 {job.location}</p>
              {job.pay ? <p>💵 {job.pay}</p> : null}
              <p>🕒 {job.postedAt}</p>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_320px] md:p-10">
            <div>
              <section>
                <h2 className="text-2xl font-black text-[#064d2b]">
                  Job Description
                </h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
                  {job.description}
                </p>
              </section>

              {job.requirements?.length ? (
                <section className="mt-9">
                  <h2 className="text-2xl font-black text-[#064d2b]">
                    Requirements
                  </h2>
                  <ul className="mt-4 space-y-3 text-slate-700">
                    {job.requirements.map((requirement, index) => (
                      <li key={`${requirement}-${index}`} className="flex gap-3">
                        <span className="font-black text-[#087531]">✓</span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="h-fit rounded-2xl border border-green-200 bg-green-50 p-6">
              <h2 className="text-xl font-black text-[#064d2b]">
                Contact Employer
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Apply directly using the employer information below.
              </p>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-bold text-slate-500">Contact</dt>
                  <dd className="mt-1 font-semibold text-slate-900">
                    {job.contactName}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Email</dt>
                  <dd className="mt-1 break-all font-semibold text-slate-900">
                    {job.contactEmail}
                  </dd>
                </div>
                {job.contactPhone ? (
                  <div>
                    <dt className="font-bold text-slate-500">Phone</dt>
                    <dd className="mt-1 font-semibold text-slate-900">
                      {job.contactPhone}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-6 space-y-3">
                <a
                  href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`Application for ${job.title}`)}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#087531] px-4 py-3 font-bold text-white transition hover:bg-[#064d2b]"
                >
                  Apply by Email
                </a>
                {job.contactPhone ? (
                  <a
                    href={`tel:${job.contactPhone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-[#087531] bg-white px-4 py-3 font-bold text-[#087531]"
                  >
                    Call Employer
                  </a>
                ) : null}
                {job.applyUrl ? (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-800"
                  >
                    Application Website
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Job-seeker safety:</strong> Never pay money to apply for a job
          or provide banking passwords to an unverified employer.
        </section>

        {similarJobs.length > 0 ? (
          <section className="mt-12">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#064d2b]">
              More in {job.category}
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              Similar Jobs
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {similarJobs.map((similarJob) => (
                <JobCard key={similarJob.id} job={similarJob} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
