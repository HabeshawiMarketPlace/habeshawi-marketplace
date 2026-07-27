"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ServiceFormData = {
  serviceName: string;
  category: string;
  description: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: string;
};

const initialFormData: ServiceFormData = {
  serviceName: "",
  category: "",
  description: "",
  contactName: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  price: "",
};

export default function PostServicePage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState<ServiceFormData>(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setErrorMessage("You must sign in before posting a service.");
        router.push("/login?redirect=/services/post");
        return;
      }

      const { error: insertError } = await supabase
        .from("services")
        .insert({
          user_id: user.id,
          service_name: formData.serviceName.trim(),
          category: formData.category,
          description: formData.description.trim(),
          contact_name: formData.contactName.trim() || null,
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || user.email || null,
          website: formData.website.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          zip: formData.zip.trim() || null,
          price: formData.price.trim() || null,
          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      setFormData(initialFormData);

      setMessage(
        "Service submitted successfully. It is waiting for admin approval."
      );
    } catch (error) {
      console.error("Service submission error:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "The service could not be submitted. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#087531]">
            Habeshawi Marketplace
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-[#064d2b]">
            Post a Service
          </h1>

          <p className="mt-3 text-slate-600">
            Advertise your professional service to the Habeshawi community.
          </p>

          {message && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 font-semibold text-green-800">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-6 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="serviceName"
                className="mb-2 block font-semibold text-slate-800"
              >
                Service Name
              </label>

              <input
                id="serviceName"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-semibold text-slate-800"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
                required
              >
                <option value="">Select Category</option>
                <option value="Tax Services">Tax Services</option>
                <option value="Immigration">Immigration</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Insurance">Insurance</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Transportation">Transportation</option>
                <option value="Legal">Legal</option>
                <option value="IT Services">IT Services</option>
                <option value="Child Care">Child Care</option>
                <option value="Education / Tutoring">
                  Education / Tutoring
                </option>
                <option value="Home Repair">Home Repair</option>
                <option value="Photography">Photography</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Financial Services">
                  Financial Services
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block font-semibold text-slate-800"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="contactName"
                className="mb-2 block font-semibold text-slate-800"
              >
                Contact Name
              </label>

              <input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block font-semibold text-slate-800"
              >
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-semibold text-slate-800"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="mb-2 block font-semibold text-slate-800"
              >
                Website
              </label>

              <input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block font-semibold text-slate-800"
              >
                Address
              </label>

              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="mb-2 block font-semibold text-slate-800"
              >
                City
              </label>

              <input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="mb-2 block font-semibold text-slate-800"
              >
                State
              </label>

              <input
                id="state"
                name="state"
                placeholder="MD"
                maxLength={2}
                value={formData.state}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="zip"
                className="mb-2 block font-semibold text-slate-800"
              >
                ZIP Code
              </label>

              <input
                id="zip"
                name="zip"
                inputMode="numeric"
                value={formData.zip}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="mb-2 block font-semibold text-slate-800"
              >
                Starting Price
              </label>

              <input
                id="price"
                name="price"
                placeholder="Example: $100 or Call for pricing"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#087531] focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-semibold text-slate-800">
                Service Image
              </label>

              <input
                type="file"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
                disabled
              />

              <p className="mt-2 text-sm text-slate-500">
                Image upload will be added after the database submission test.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/services")}
                className="rounded-xl border border-slate-300 px-8 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[#087531] px-8 py-4 font-bold text-white transition hover:bg-[#065d27] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Post Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}