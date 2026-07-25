import JobCard from "@/components/jobs/JobCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { getApprovedJobs } from "@/lib/jobs/queries";

export default async function LatestJobs() {
  const jobs = await getApprovedJobs();
  const latestJobs = jobs.slice(0, 4);

  return (
    <Section tone="white">
      <SectionHeader
        eyebrow="Community Opportunities"
        title="Latest Jobs"
        description="Discover the newest approved job opportunities shared by our community throughout Washington, DC, Maryland, and Virginia."
        amharic="አዳዲስ የስራ እድሎች"
        actionHref="/jobs"
        actionLabel="View All Jobs"
      />

      {latestJobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <Card padding="lg" className="border-dashed bg-slate-50 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            <span aria-hidden="true">💼</span>
          </div>

          <h3 className="mt-5 text-2xl font-black text-slate-900">
            No Jobs Available Yet
          </h3>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Be the first to post a job opportunity for the Habeshawi community.
          </p>

          <div className="mt-6 flex justify-center">
            <Button href="/jobs/post" variant="primary">
              Post a Job
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-[#facc15] via-[#fde047] to-[#facc15] p-7 shadow-lg md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#064d2b]">
              Employers
            </p>

            <h3 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">
              Are You Hiring?
            </h3>

            <p className="mt-4 text-lg font-bold leading-8 text-slate-800">
              Post your job and connect with qualified job seekers across the
              DMV Habeshawi community.
            </p>

            <p className="mt-2 max-w-2xl leading-7 text-slate-700">
              Reach motivated candidates throughout Washington, DC, Maryland,
              and Virginia. Posting is free, fast, and easy.
            </p>
          </div>

          <Button
            href="/jobs/post"
            variant="primary"
            size="md"
            className="shrink-0 bg-[#064d2b] px-7 py-4 text-white hover:bg-[#043d22]"
          >
            Post a Job
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </Section>
  );
}