"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BusinessImageUpload from "@/components/businesses/BusinessImageUpload";

type BusinessForm = {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  website: string;
  facebook_url: string;
  instagram_url: string;
  telegram_url: string;
  whatsapp: string;
  specialties: string;
  monday_hours: string;
  tuesday_hours: string;
  wednesday_hours: string;
  thursday_hours: string;
  friday_hours: string;
  saturday_hours: string;
  sunday_hours: string;
  image_url: string;
  logo_url: string;
};

const initialForm: BusinessForm = {
  name: "",
  category: "",
  description: "",
  address: "",
  city: "",
  state: "DC",
  zip_code: "",
  phone: "",
  email: "",
  website: "",
  facebook_url: "",
  instagram_url: "",
  telegram_url: "",
  whatsapp: "",
  specialties: "",
  monday_hours: "",
  tuesday_hours: "",
  wednesday_hours: "",
  thursday_hours: "",
  friday_hours: "",
  saturday_hours: "",
  sunday_hours: "",
  image_url: "",
  logo_url: "",
};

const categories = [
  "Restaurant",
  "Coffee Shop",
  "Grocery Store",
  "Retail Store",
  "Professional Services",
  "Tax Services",
  "Legal Services",
  "Immigration Services",
  "Real Estate",
  "Insurance",
  "Travel Agency",
  "Transportation",
  "Auto Services",
  "Home Services",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Event Services",
  "Community Organization",
  "Religious Organization",
  "Other",
];

const states = [
  { value: "DC", label: "Washington, DC" },
  { value: "MD", label: "Maryland" },
  { value: "VA", label: "Virginia" },
  { value: "DE", label: "Delaware" },
  { value: "PA", label: "Pennsylvania" },
  { value: "WV", label: "West Virginia" },
  { value: "Other", label: "Other" },
];

function normalizeUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function optionalText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

export default function PostBusinessPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [form, setForm] = useState<BusinessForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setUser(currentUser);

      if (currentUser?.email) {
        setForm((currentForm) => ({
          ...currentForm,
          email: currentForm.email || currentUser.email || "",
        }));
      }

      setAuthLoading(false);
    }

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user?.email) {
          setForm((currentForm) => ({
            ...currentForm,
            email: currentForm.email || session.user.email || "",
          }));
        }

        setAuthLoading(false);
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  function updateField<K extends keyof BusinessForm>(
    field: K,
    value: BusinessForm[K],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!user) {
      setErrorMessage("You must sign in before adding a business.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const specialties = form.specialties
      .split(",")
      .map((specialty) => specialty.trim())
      .filter(Boolean);

    setSubmitting(true);

    const { error } = await supabase.from("businesses").insert({
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip_code: optionalText(form.zip_code),
      phone: optionalText(form.phone),
      email: optionalText(form.email),
      website: normalizeUrl(form.website),
      facebook_url: normalizeUrl(form.facebook_url),
      instagram_url: normalizeUrl(form.instagram_url),
      telegram_url: normalizeUrl(form.telegram_url),
      whatsapp: optionalText(form.whatsapp),
      specialties,
      monday_hours: optionalText(form.monday_hours),
      tuesday_hours: optionalText(form.tuesday_hours),
      wednesday_hours: optionalText(form.wednesday_hours),
      thursday_hours: optionalText(form.thursday_hours),
      friday_hours: optionalText(form.friday_hours),
      saturday_hours: optionalText(form.saturday_hours),
      sunday_hours: optionalText(form.sunday_hours),
      image_url: normalizeUrl(form.image_url),
      logo_url: normalizeUrl(form.logo_url),
      featured: false,
      status: "pending",
      rating: null,
      review_count: 0,
      user_id: user.id,
    });

    if (error) {
      console.error("Business submission error:", error);
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSuccessMessage(
      "Your business was submitted successfully and is waiting for administrator approval.",
    );

    setForm({
      ...initialForm,
      email: user.email ?? "",
    });

    setSubmitting(false);

    window.setTimeout(() => {
      router.push("/businesses");
      router.refresh();
    }, 2200);
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

            <p className="mt-5 font-bold text-slate-700">
              Checking your account...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">
              ðŸ”’
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#087531]">
              Account required
            </p>

            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Sign in to add your business
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
              Business submissions are connected to your account so you can
              manage them and follow their approval status.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login?redirect=/businesses/post"
                className="rounded-xl bg-[#087531] px-7 py-3 font-black text-white transition hover:bg-[#064d2b]"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="rounded-xl border border-[#087531] px-7 py-3 font-black text-[#087531] transition hover:bg-green-50"
              >
                Create Account
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/post-ad"
          className="inline-flex items-center gap-2 font-bold text-[#064d2b] hover:underline"
        >
          â† Back to Post an Ad
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl bg-[#064d2b] px-6 py-10 text-white shadow-lg sm:px-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-yellow-300">
            Habeshawi Business Directory
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Add Your Business
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-green-50">
            Create a business profile to help community members discover your
            restaurant, store, professional service, organization, or local
            business.
          </p>

          <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-green-50">
            Your submission will be marked as pending. It will appear in the
            public directory after administrator approval.
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8"
        >
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
            >
              <p className="font-black">Unable to submit business</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          ) : null}

          {successMessage ? (
            <div
              role="status"
              className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900"
            >
              <p className="font-black">Business submitted</p>
              <p className="mt-1">{successMessage}</p>
            </div>
          ) : null}

          <FormSection
            title="Business Information"
            description="Tell visitors the name, type, and purpose of your business."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Business name"
                required
                className="md:col-span-2"
              >
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  required
                  maxLength={150}
                  placeholder="Example: Gedam Sefer Ethiopian Cuisine CafÃ©"
                  className={inputClasses}
                />
              </FormField>

              <FormField
                label="Business category"
                required
              >
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  required
                  className={inputClasses}
                >
                  <option value="">Select a category</option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Owner account">
                <input
                  type="text"
                  value={user.email ?? "Signed-in user"}
                  disabled
                  className={`${inputClasses} cursor-not-allowed bg-slate-100 text-slate-500`}
                />
              </FormField>

              <FormField
                label="Business description"
                required
                className="md:col-span-2"
                hint="Describe what your business offers and what makes it special."
              >
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  required
                  rows={7}
                  maxLength={3000}
                  placeholder="Tell customers about your business, products, services, experience, and community connection."
                  className={inputClasses}
                />
              </FormField>

              <FormField
                label="Services and specialties"
                className="md:col-span-2"
                hint="Separate each specialty with a comma."
              >
                <input
                  type="text"
                  value={form.specialties}
                  onChange={(event) =>
                    updateField("specialties", event.target.value)
                  }
                  placeholder="Ethiopian food, catering, coffee, vegetarian options"
                  className={inputClasses}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Business Location"
            description="Enter the physical address customers can visit."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                label="Street address"
                required
                className="md:col-span-2"
              >
                <input
                  type="text"
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  required
                  placeholder="5411 Georgia Avenue NW"
                  className={inputClasses}
                />
              </FormField>

              <FormField
                label="City"
                required
              >
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) =>
                    updateField("city", event.target.value)
                  }
                  required
                  placeholder="Washington"
                  className={inputClasses}
                />
              </FormField>

              <FormField
                label="State"
                required
              >
                <select
                  value={form.state}
                  onChange={(event) =>
                    updateField("state", event.target.value)
                  }
                  required
                  className={inputClasses}
                >
                  {states.map((state) => (
                    <option
                      key={state.value}
                      value={state.value}
                    >
                      {state.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="ZIP code">
                <input
                  type="text"
                  value={form.zip_code}
                  onChange={(event) =>
                    updateField("zip_code", event.target.value)
                  }
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="20011"
                  className={inputClasses}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Contact Information"
            description="Give visitors reliable ways to contact your business."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Business phone">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  placeholder="(202) 555-0123"
                  className={inputClasses}
                />
              </FormField>

              <FormField label="Business email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="contact@example.com"
                  className={inputClasses}
                />
              </FormField>

              <FormField
                label="Website"
                className="md:col-span-2"
              >
                <input
                  type="text"
                  value={form.website}
                  onChange={(event) =>
                    updateField("website", event.target.value)
                  }
                  placeholder="https://www.example.com"
                  className={inputClasses}
                />
              </FormField>

              <FormField label="Facebook URL">
                <input
                  type="text"
                  value={form.facebook_url}
                  onChange={(event) =>
                    updateField("facebook_url", event.target.value)
                  }
                  placeholder="https://facebook.com/yourbusiness"
                  className={inputClasses}
                />
              </FormField>

              <FormField label="Instagram URL">
                <input
                  type="text"
                  value={form.instagram_url}
                  onChange={(event) =>
                    updateField("instagram_url", event.target.value)
                  }
                  placeholder="https://instagram.com/yourbusiness"
                  className={inputClasses}
                />
              </FormField>

              <FormField label="Telegram URL">
                <input
                  type="text"
                  value={form.telegram_url}
                  onChange={(event) =>
                    updateField("telegram_url", event.target.value)
                  }
                  placeholder="https://t.me/yourbusiness"
                  className={inputClasses}
                />
              </FormField>

              <FormField label="WhatsApp number">
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(event) =>
                    updateField("whatsapp", event.target.value)
                  }
                  placeholder="+1 202 555 0123"
                  className={inputClasses}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Business Hours"
            description="Examples: 9:00 AM â€“ 8:00 PM, Open 24 Hours, or Closed."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <HoursField
                label="Monday"
                value={form.monday_hours}
                onChange={(value) =>
                  updateField("monday_hours", value)
                }
              />

              <HoursField
                label="Tuesday"
                value={form.tuesday_hours}
                onChange={(value) =>
                  updateField("tuesday_hours", value)
                }
              />

              <HoursField
                label="Wednesday"
                value={form.wednesday_hours}
                onChange={(value) =>
                  updateField("wednesday_hours", value)
                }
              />

              <HoursField
                label="Thursday"
                value={form.thursday_hours}
                onChange={(value) =>
                  updateField("thursday_hours", value)
                }
              />

              <HoursField
                label="Friday"
                value={form.friday_hours}
                onChange={(value) =>
                  updateField("friday_hours", value)
                }
              />

              <HoursField
                label="Saturday"
                value={form.saturday_hours}
                onChange={(value) =>
                  updateField("saturday_hours", value)
                }
              />

              <HoursField
                label="Sunday"
                value={form.sunday_hours}
                onChange={(value) =>
                  updateField("sunday_hours", value)
                }
              />
            </div>
          </FormSection>

          <FormSection
  title="Business Images"
  description="Upload your business logo and cover photo."
>
  <div className="grid gap-8 md:grid-cols-2">

    <BusinessImageUpload
      label="Business Logo"
      imageType="logo"
      value={form.logo_url}
      onChange={(url) => updateField("logo_url", url)}
    />

    <BusinessImageUpload
      label="Business Cover Photo"
      imageType="cover"
      value={form.image_url}
      onChange={(url) => updateField("image_url", url)}
    />

  </div>
</FormSection>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-black text-amber-950">
                Before submitting
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-900">
                Confirm that the information is accurate and that you are
                authorized to create this business profile. The administrator
                may reject misleading, duplicate, or incomplete submissions.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/post-ad"
                className="rounded-xl border border-slate-300 px-7 py-3 text-center font-black text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#087531] px-8 py-3 font-black text-white transition hover:bg-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Business..."
                  : "Submit Business for Approval"}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

const inputClasses =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087531] focus:ring-2 focus:ring-green-100";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>

        <p className="mt-2 leading-7 text-slate-600">{description}</p>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function FormField({
  label,
  required = false,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="font-black text-slate-800">
        {label}

        {required ? (
          <span className="ml-1 text-red-600">*</span>
        ) : null}
      </span>

      {children}

      {hint ? (
        <span className="mt-2 block text-sm text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function HoursField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField label={label}>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="9:00 AM â€“ 8:00 PM"
        className={inputClasses}
      />
    </FormField>
  );
}
