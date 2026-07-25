"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PackageName = "free" | "bronze" | "silver" | "gold" | "platinum";

const packages: Record<
  PackageName,
  {
    name: string;
    price: number;
    duration: number;
    description: string;
  }
> = {
  free: {
    name: "Free Community",
    price: 0,
    duration: 7,
    description: "Basic community promotion for 7 days.",
  },
  bronze: {
    name: "Bronze",
    price: 39.99,
    duration: 60,
    description: "Starter business promotion for 60 days.",
  },
  silver: {
    name: "Silver",
    price: 79.99,
    duration: 60,
    description: "Priority business promotion for 60 days.",
  },
  gold: {
    name: "Gold",
    price: 149.99,
    duration: 60,
    description: "Premium business promotion for 60 days.",
  },
  platinum: {
    name: "Platinum",
    price: 299.99,
    duration: 60,
    description: "Maximum platform exposure for 60 days.",
  },
};

const categories = [
  "Restaurant & Cafe",
  "Grocery Store",
  "Beauty & Salon",
  "Professional Services",
  "Real Estate",
  "Automotive",
  "Transportation",
  "Healthcare",
  "Education",
  "Entertainment",
  "Community Event",
  "Religious Organization",
  "Featured Marketplace Listing",
  "Featured Housing Listing",
  "Featured Job Listing",
  "Other",
];

export default function PromotionPostPage() {
  const router = useRouter();

  const packageFromUrl = usePackageFromUrl();
  const [selectedPackageOverride, setSelectedPackageOverride] =
    useState<PackageName | null>(null);
  const selectedPackage = selectedPackageOverride ?? packageFromUrl;

  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

  const currentPackage = packages[selectedPackage];

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const formattedPrice = useMemo(() => {
    if (currentPackage.price === 0) {
      return "$0";
    }

    return `$${currentPackage.price.toFixed(2)}`;
  }, [currentPackage.price]);

  function handleImageChange(file: File | null) {
    setMessage("");
    setMessageType("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageFile(null);
      setImagePreview("");
      setMessage("Please choose a JPG, PNG, or WebP image.");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageFile(null);
      setImagePreview("");
      setMessage("The image must be 5 MB or smaller.");
      setMessageType("error");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !businessName.trim() ||
      !title.trim() ||
      !category ||
      !description.trim() ||
      !phone.trim() ||
      !email.trim()
    ) {
      setMessage("Please complete all required fields.");
      setMessageType("error");
      return;
    }

    if (!imageFile) {
      setMessage("Please upload an advertisement image.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);

    let uploadedImagePath = "";

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setMessage(
          "You must sign in before creating an advertisement."
        );
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      const extension =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      uploadedImagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("promotion-images")
        .upload(uploadedImagePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: imageFile.type,
        });

      if (uploadError) {
        throw new Error(
          `Unable to upload the image: ${uploadError.message}`
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("promotion-images")
        .getPublicUrl(uploadedImagePath);

      const paymentStatus =
        currentPackage.price === 0 ? "paid" : "unpaid";

      const advertisementStatus =
        currentPackage.price === 0 ? "pending" : "draft";

      const { data: advertisement, error: insertError } =
        await supabase
          .from("advertisements")
          .insert({
            user_id: user.id,
            business_name: businessName.trim(),
            title: title.trim(),
            description: description.trim(),
            category,
            package: selectedPackage,
            price: currentPackage.price,
            image_url: publicUrl,
            website: website.trim() || null,
            phone: phone.trim(),
            email: email.trim(),
            status: advertisementStatus,
            duration_days: currentPackage.duration,
            clicks: 0,
            impressions: 0,
            payment_status: paymentStatus,
            payment_reference: null,
          })
          .select("id")
          .single();

      if (insertError) {
        throw new Error(
          `Unable to save the advertisement: ${insertError.message}`
        );
      }

      if (!advertisement?.id) {
        throw new Error(
          "The advertisement was saved, but its ID was not returned."
        );
      }

      if (currentPackage.price === 0) {
        router.push(
          `/promotion/success?id=${encodeURIComponent(
            advertisement.id
          )}&package=free`
        );
        return;
      }

      router.push(
        `/promotion/payment?id=${encodeURIComponent(
          advertisement.id
        )}`
      );
    } catch (error) {
      if (uploadedImagePath) {
        await supabase.storage
          .from("promotion-images")
          .remove([uploadedImagePath]);
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the advertisement.";

      setMessage(errorMessage);
      setMessageType("error");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <section className="bg-[#064d2b] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/promotion"
            className="inline-flex font-bold text-yellow-400 hover:text-yellow-300"
          >
            ← Back to Promotion
          </Link>

          <h1 className="mt-5 text-4xl font-black sm:text-5xl">
            Create Your Advertisement
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-green-50">
            Add your business information, promotion image, contact
            information, and advertising package.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
        >
          <div>
            <span className="font-black uppercase tracking-wider text-[#087531]">
              Step 1
            </span>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Choose Your Package
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {(Object.keys(packages) as PackageName[]).map(
                (packageKey) => {
                  const item = packages[packageKey];
                  const isSelected =
                    selectedPackage === packageKey;

                  return (
                    <button
                      key={packageKey}
                      type="button"
                      onClick={() =>
                        setSelectedPackageOverride(packageKey)
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#087531] bg-green-50 ring-2 ring-[#087531]"
                          : "border-slate-200 bg-white hover:border-green-300"
                      }`}
                    >
                      <div className="font-black text-slate-900">
                        {item.name}
                      </div>

                      <div className="mt-2 text-2xl font-black text-[#064d2b]">
                        {item.price === 0
                          ? "$0"
                          : `$${item.price.toFixed(2)}`}
                      </div>

                      <div className="mt-1 text-sm font-bold text-slate-600">
                        {item.duration} days
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="my-9 border-t border-slate-200" />

          <div>
            <span className="font-black uppercase tracking-wider text-[#087531]">
              Step 2
            </span>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Business Information
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Field label="Business or Organization Name" required>
                <input
                  type="text"
                  value={businessName}
                  onChange={(event) =>
                    setBusinessName(event.target.value)
                  }
                  placeholder="Example: Habesha Coffee House"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Advertisement Category" required>
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Select a category</option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-6">
              <Field label="Advertisement Title" required>
                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Example: Authentic Ethiopian Food in Silver Spring"
                  className={inputClass}
                  maxLength={120}
                  required
                />
              </Field>
            </div>

            <div className="mt-6">
              <Field label="Advertisement Description" required>
                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe your business, services, special offer, event, or announcement."
                  className={`${inputClass} min-h-40 resize-y`}
                  maxLength={1500}
                  required
                />

                <p className="mt-2 text-right text-sm text-slate-500">
                  {description.length}/1500
                </p>
              </Field>
            </div>
          </div>

          <div className="my-9 border-t border-slate-200" />

          <div>
            <span className="font-black uppercase tracking-wider text-[#087531]">
              Step 3
            </span>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Advertisement Image
            </h2>

            <p className="mt-2 text-slate-600">
              Upload a JPG, PNG, or WebP image. Maximum file size is
              5 MB.
            </p>

            <div className="mt-6">
              <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#087531] hover:bg-green-50">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(event) =>
                    handleImageChange(
                      event.target.files?.[0] || null
                    )
                  }
                  className="hidden"
                />

                {imagePreview ? (
                  <div>
                    <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl bg-slate-200">
                      <Image
                        src={imagePreview}
                        alt="Advertisement preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <p className="mt-4 font-black text-[#087531]">
                      Click here to choose a different image
                    </p>
                  </div>
                ) : (
                  <div className="py-10">
                    <div className="text-5xl">🖼️</div>

                    <p className="mt-4 text-lg font-black text-slate-900">
                      Click to upload your advertisement image
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      JPG, PNG, or WebP — Maximum 5 MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="my-9 border-t border-slate-200" />

          <div>
            <span className="font-black uppercase tracking-wider text-[#087531]">
              Step 4
            </span>

            <h2 className="mt-2 text-2xl font-black text-slate-900">
              Contact Information
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Field label="Phone Number" required>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="(301) 555-1234"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Email Address" required>
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="business@example.com"
                  className={inputClass}
                  required
                />
              </Field>
            </div>

            <div className="mt-6">
              <Field label="Website or Social Media Link">
                <input
                  type="url"
                  value={website}
                  onChange={(event) =>
                    setWebsite(event.target.value)
                  }
                  placeholder="https://www.example.com"
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {message && (
            <div
              className={`mt-8 rounded-2xl border p-4 font-bold ${
                messageType === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-xl bg-[#087531] px-7 py-4 text-lg font-black text-white transition hover:bg-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Saving Advertisement..."
              : currentPackage.price === 0
              ? "Submit Free Advertisement"
              : `Continue to Payment — ${formattedPrice}`}
          </button>

          <p className="mt-4 text-center text-sm leading-6 text-slate-500">
            Your advertisement will be reviewed before it becomes
            publicly active.
          </p>
        </form>

        <aside className="space-y-6">
          <div className="sticky top-6 rounded-3xl bg-[#064d2b] p-7 text-white shadow-lg">
            <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
              Selected Package
            </span>

            <h2 className="mt-5 text-3xl font-black">
              {currentPackage.name}
            </h2>

            <div className="mt-3 text-4xl font-black text-yellow-400">
              {formattedPrice}
            </div>

            <p className="mt-2 font-bold text-green-50">
              {currentPackage.duration} days
            </p>

            <p className="mt-5 leading-7 text-green-50">
              {currentPackage.description}
            </p>

            <div className="my-6 border-t border-green-700" />

            <div className="grid gap-4 text-sm">
              <SummaryRow
                label="Package"
                value={currentPackage.name}
              />

              <SummaryRow
                label="Duration"
                value={`${currentPackage.duration} days`}
              />

              <SummaryRow
                label="Price"
                value={formattedPrice}
              />

              <SummaryRow
                label="Approval"
                value="Required"
              />
            </div>

            <Link
              href="/promotion/pricing"
              className="mt-7 block rounded-xl border border-white px-5 py-3 text-center font-black text-white transition hover:bg-white hover:text-[#064d2b]"
            >
              Compare All Packages
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}


function isPackageName(value: string | null): value is PackageName {
  return (
    value === "free" ||
    value === "bronze" ||
    value === "silver" ||
    value === "gold" ||
    value === "platinum"
  );
}

function subscribeToUrlChanges(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);

  return () => {
    window.removeEventListener("popstate", onStoreChange);
  };
}

function getPackageSnapshot(): PackageName {
  const packageName = new URLSearchParams(window.location.search).get("package");
  return isPackageName(packageName) ? packageName : "silver";
}

function getServerPackageSnapshot(): PackageName {
  return "silver";
}

function usePackageFromUrl(): PackageName {
  return useSyncExternalStore(
    subscribeToUrlChanges,
    getPackageSnapshot,
    getServerPackageSnapshot,
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#087531] focus:ring-2 focus:ring-green-100";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-black text-slate-800">
        {label}

        {required && (
          <span className="ml-1 text-red-600">*</span>
        )}
      </span>

      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-green-100">{label}</span>
      <span className="text-right font-black">{value}</span>
    </div>
  );
}