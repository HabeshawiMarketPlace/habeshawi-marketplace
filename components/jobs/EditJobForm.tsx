"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Props = {
  job: any;
};

const categories = [
  "Restaurant & Hospitality",
  "Driving & Delivery",
  "Cleaning",
  "Retail & Grocery",
  "Healthcare",
  "Information Technology",
  "Office & Administration",
  "Accounting & Finance",
  "Construction",
  "Security",
  "Childcare & Home Care",
  "Education",
  "Other",
];

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
];

export default function EditJobForm({ job }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [applyUrl, setApplyUrl] = useState("");

  useEffect(() => {
    if (!job) return;

    setTitle(job.title ?? "");
    setCompany(job.company ?? "");
    setCategory(job.category ?? "");
    setEmploymentType(job.employment_type ?? "");
    setLocation(job.location ?? "");
    setPay(job.pay ?? "");
    setDescription(job.description ?? "");

    setRequirements(
      Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : ""
    );

    setContactName(job.contact_name ?? "");
    setContactEmail(job.contact_email ?? "");
    setContactPhone(job.contact_phone ?? "");
    setApplyUrl(job.apply_url ?? "");
  }, [job]);
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please sign in again.");
        setLoading(false);
        return;
      }

      const requirementsArray = requirements
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("jobs")
        .update({
          title,
          company,
          category,
          employment_type: employmentType,
          location,
          pay: pay || null,
          description,
          requirements: requirementsArray,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          apply_url: applyUrl || null,

          // User edits require admin approval again
          status: "pending",
        })
        .eq("id", job.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      alert(
        "Your job listing has been updated and submitted for admin review."
      );

      router.push("/jobs/my-listings");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Unable to update job.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-8 shadow"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Job Title
          </label>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Company
          </label>

          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border p-3"
          >
            {categories.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Employment Type
          </label>

          <select
            value={employmentType}
            onChange={(e) =>
              setEmploymentType(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            {employmentTypes.map((item) => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Location
          </label>

          <input
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Pay
          </label>

          <input
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-semibold">
          Description
        </label>

        <textarea
          rows={7}
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">
          Requirements (one per line)
        </label>

        <textarea
          rows={6}
          value={requirements}
          onChange={(e) =>
            setRequirements(e.target.value)
          }
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Contact Name
          </label>

          <input
            value={contactName}
            onChange={(e) =>
              setContactName(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Contact Email
          </label>

          <input
            type="email"
            value={contactEmail}
            onChange={(e) =>
              setContactEmail(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Contact Phone
          </label>

          <input
            value={contactPhone}
            onChange={(e) =>
              setContactPhone(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Apply URL
          </label>

          <input
            value={applyUrl}
            onChange={(e) =>
              setApplyUrl(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
        Saving your changes will automatically submit this job for
        administrator review again.
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#087531] px-8 py-3 font-bold text-white hover:bg-[#065c26] disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/jobs/my-listings")}
          className="rounded-xl border px-8 py-3 font-bold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}