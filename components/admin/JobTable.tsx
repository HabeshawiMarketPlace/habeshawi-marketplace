"use client";


import JobStatusBadge, {
  type JobStatus,
} from "@/components/admin/JobStatusBadge";
import {
  deleteAdminJob,
  getAdminJobs,
  type AdminJob,
  updateAdminJobStatus,
} from "@/lib/jobs/admin";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const sections: Array<{
  status: JobStatus;
  title: string;
  description: string;
}> = [
  {
    status: "pending",
    title: "Pending Jobs",
    description: "Free community job posts waiting for review.",
  },
  {
    status: "approved",
    title: "Approved Jobs",
    description: "Jobs currently published on the public Jobs page.",
  },
  {
    status: "rejected",
    title: "Rejected Jobs",
    description: "Posts that were not approved.",
  },
  {
    status: "expired",
    title: "Expired Jobs",
    description: "Older jobs that are no longer active.",
  },
];

export default function JobTable() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      setJobs(await getAdminJobs());
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load jobs.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
const hasLoaded = useRef(false);

useEffect(() => {
  if (hasLoaded.current) return;

  hasLoaded.current = true;
  void loadJobs();
}, [loadJobs]);
  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return jobs;

    return jobs.filter((job) =>
      [
        job.title,
        job.company,
        job.category,
        job.employment_type,
        job.location,
        job.contact_name,
        job.contact_email,
        job.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [jobs, search]);

  const counts = useMemo(
    () => ({
      pending: jobs.filter((job) => job.status === "pending").length,
      approved: jobs.filter((job) => job.status === "approved").length,
      rejected: jobs.filter((job) => job.status === "rejected").length,
      expired: jobs.filter((job) => job.status === "expired").length,
    }),
    [jobs],
  );

  async function changeStatus(jobId: string, status: JobStatus) {
    setWorkingId(jobId);

    try {
      await updateAdminJobStatus(jobId, status);
      setJobs((current) =>
        current.map((job) => (job.id === jobId ? { ...job, status } : job)),
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update the job status.",
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function removeJob(jobId: string) {
    const confirmed = confirm(
      "Permanently delete this job? This action cannot be undone.",
    );

    if (!confirmed) return;

    setWorkingId(jobId);

    try {
      await deleteAdminJob(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete job.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Pending" count={counts.pending} description="Needs review" />
        <SummaryCard title="Approved" count={counts.approved} description="Published jobs" />
        <SummaryCard title="Rejected" count={counts.rejected} description="Not approved" />
        <SummaryCard title="Expired" count={counts.expired} description="No longer active" />
      </div>

      <div className="mt-8 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block flex-1" htmlFor="admin-job-search">
            <span className="mb-2 block font-semibold text-slate-700">
              Search jobs
            </span>
            <input
              id="admin-job-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, company, category, location or contact"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
            />
          </label>

          <button
            type="button"
            onClick={() => void loadJobs()}
            className="rounded-lg border border-[#087531] bg-white px-4 py-3 font-semibold text-[#087531] hover:bg-green-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          Unable to load jobs: {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
          <p>Loading jobs...</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {sections.map((section) => {
            const sectionJobs = filteredJobs.filter(
              (job) => job.status === section.status,
            );

            return (
              <section key={section.status}>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-[#064d2b]">
                    {section.title} ({sectionJobs.length})
                  </h2>
                  <p className="text-slate-600">{section.description}</p>
                </div>

                <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
                  <table className="w-full min-w-[1050px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-left">
                        <th className="border-b p-3">Job</th>
                        <th className="border-b p-3">Category</th>
                        <th className="border-b p-3">Type</th>
                        <th className="border-b p-3">Pay</th>
                        <th className="border-b p-3">Contact</th>
                        <th className="border-b p-3">Status</th>
                        <th className="border-b p-3">Submitted</th>
                        <th className="border-b p-3">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {sectionJobs.map((job) => {
                        const isWorking = workingId === job.id;

                        return (
                          <tr key={job.id} className="align-top hover:bg-slate-50">
                            <td className="border-b p-3">
                              <p className="font-semibold text-slate-900">
                                {job.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                {job.company}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {job.location}
                              </p>
                            </td>
                            <td className="border-b p-3">{job.category}</td>
                            <td className="border-b p-3">{job.employment_type}</td>
                            <td className="border-b p-3 font-semibold">
                              {job.pay || "Not provided"}
                            </td>
                            <td className="border-b p-3">
                              <p className="font-medium">{job.contact_name}</p>
                              <a
                                href={`mailto:${job.contact_email}`}
                                className="mt-1 block text-sm text-blue-700 hover:underline"
                              >
                                {job.contact_email}
                              </a>
                              {job.contact_phone && (
                                <a
                                  href={`tel:${job.contact_phone}`}
                                  className="mt-1 block text-sm text-blue-700 hover:underline"
                                >
                                  {job.contact_phone}
                                </a>
                              )}
                            </td>
                            <td className="border-b p-3">
                              <JobStatusBadge status={job.status} />
                            </td>
                            <td className="border-b p-3">
                              {formatDate(job.created_at)}
                            </td>
                            <td className="border-b p-3">
                              <div className="flex flex-wrap gap-2">
                                {job.status !== "approved" && (
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => void changeStatus(job.id, "approved")}
                                    className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                )}

                                {job.status !== "rejected" && (
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => void changeStatus(job.id, "rejected")}
                                    className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                )}

                                {job.status === "approved" && (
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => void changeStatus(job.id, "pending")}
                                    className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                                  >
                                    Unpublish
                                  </button>
                                )}

                                {(job.status === "rejected" || job.status === "expired") && (
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => void changeStatus(job.id, "pending")}
                                    className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                                  >
                                    Restore
                                  </button>
                                )}

                                {job.status !== "expired" && (
                                  <button
                                    type="button"
                                    disabled={isWorking}
                                    onClick={() => void changeStatus(job.id, "expired")}
                                    className="rounded-lg bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                                  >
                                    Expire
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={isWorking}
                                  onClick={() => void removeJob(job.id)}
                                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                                >
                                  {isWorking ? "Working..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {sectionJobs.length === 0 && (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500">
                            No jobs in this section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="font-semibold text-slate-600">{title}</p>
      <p className="mt-2 text-4xl font-bold text-[#064d2b]">{count}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
