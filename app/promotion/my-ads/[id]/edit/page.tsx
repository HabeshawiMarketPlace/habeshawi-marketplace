"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";


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

type Advertisement = {
  id: string;
  user_id: string;
  business_name: string;
  title: string;
  description: string;
  category: string;
  package: string;
  price: number;
  duration_days: number;
  image_url: string | null;
  website: string | null;
  phone: string;
  email: string;
  status: string;
  payment_status: string;
};

export default function EditAdvertisementPage() {
  const params = useParams();
  const router = useRouter();

  const advertisementId = params.id as string;

  const [advertisement, setAdvertisement] =
    useState<Advertisement | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(
    null
  );
  const [newImagePreview, setNewImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"error" | "success" | "">("");

  const loadAdvertisement = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "You must sign in to edit an advertisement."
        );
      }

      const { data, error } = await supabase
        .from("advertisements")
        .select(
          `
            id,
            user_id,
            business_name,
            title,
            description,
            category,
            package,
            price,
            duration_days,
            image_url,
            website,
            phone,
            email,
            status,
            payment_status
          `
        )
        .eq("id", advertisementId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw new Error(
          `Unable to load the advertisement: ${error.message}`
        );
      }

      if (!data) {
        throw new Error("Advertisement not found.");
      }

      const loadedAdvertisement = data as Advertisement;

      setAdvertisement(loadedAdvertisement);
      setBusinessName(loadedAdvertisement.business_name || "");
      setTitle(loadedAdvertisement.title || "");
      setCategory(loadedAdvertisement.category || "");
      setDescription(loadedAdvertisement.description || "");
      setWebsite(loadedAdvertisement.website || "");
      setPhone(loadedAdvertisement.phone || "");
      setEmail(loadedAdvertisement.email || "");
      setCurrentImageUrl(loadedAdvertisement.image_url || "");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load the advertisement.";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [advertisementId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdvertisement();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAdvertisement]);

  useEffect(() => {
    return () => {
      if (newImagePreview) {
        URL.revokeObjectURL(newImagePreview);
      }
    };
  }, [newImagePreview]);

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setMessage("");
    setMessageType("");

    const file = event.target.files?.[0] || null;

    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
    }

    if (!file) {
      setNewImageFile(null);
      setNewImagePreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setNewImageFile(null);
      setNewImagePreview("");
      setMessage("Please choose a JPG, PNG, or WebP image.");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNewImageFile(null);
      setNewImagePreview("");
      setMessage("The image must be 5 MB or smaller.");
      setMessageType("error");
      return;
    }

    setNewImageFile(file);
    setNewImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!advertisement) {
      setMessage("Advertisement information is unavailable.");
      setMessageType("error");
      return;
    }

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

    setSaving(true);

    let uploadedImagePath = "";
    let replacementImageUrl = currentImageUrl;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (newImageFile) {
        const extension =
          newImageFile.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        uploadedImagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("promotion-images")
          .upload(uploadedImagePath, newImageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: newImageFile.type,
          });

        if (uploadError) {
          throw new Error(
            `Unable to upload the new image: ${uploadError.message}`
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("promotion-images")
          .getPublicUrl(uploadedImagePath);

        replacementImageUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("advertisements")
        .update({
          business_name: businessName.trim(),
          title: title.trim(),
          category,
          description: description.trim(),
          website: website.trim() || null,
          phone: phone.trim(),
          email: email.trim(),
          image_url: replacementImageUrl || null,
          status:
            advertisement.status === "active"
              ? "pending"
              : advertisement.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", advertisement.id)
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(
          `Unable to update the advertisement: ${updateError.message}`
        );
      }

      if (
        newImageFile &&
        currentImageUrl &&
        currentImageUrl !== replacementImageUrl
      ) {
        const oldImagePath = getStoragePathFromPublicUrl(
          currentImageUrl,
          "promotion-images"
        );

        if (oldImagePath) {
          await supabase.storage
            .from("promotion-images")
            .remove([oldImagePath]);
        }
      }

      router.push(
        `/promotion/my-ads/${encodeURIComponent(
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
          : "Something went wrong while updating the advertisement.";

      setMessage(errorMessage);
      setMessageType("error");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

          <p className="mt-5 font-bold text-slate-700">
            Loading advertisement...
          </p>
        </div>
      </main>
    );
  }

  if (!advertisement) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">⚠️</div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            Advertisement Unavailable
          </h1>

          <p className="mt-4 leading-7 text-red-700">
            {message || "The advertisement could not be found."}
          </p>

          <Link
            href="/promotion/my-ads"
            className="mt-7 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white"
          >
            Return to My Advertisements
          </Link>
        </div>
      </main>
    );
  }

  const previewImage = newImagePreview || currentImageUrl;

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <section className="bg-[#064d2b] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/promotion/my-ads/${advertisement.id}`}
            className="font-bold text-yellow-400 hover:text-yellow-300"
          >
            ← Back to Advertisement
          </Link>

          <h1 className="mt-5 text-4xl font-black sm:text-5xl">
            Edit Advertisement
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-green-50">
            Update your advertisement information, contact details,
            description, or promotional image.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Business or Organization Name"
              required
            >
              <input
                type="text"
                value={businessName}
                onChange={(event) =>
                  setBusinessName(event.target.value)
                }
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
                className={`${inputClass} min-h-40 resize-y`}
                maxLength={1500}
                required
              />

              <p className="mt-2 text-right text-sm text-slate-500">
                {description.length}/1500
              </p>
            </Field>
          </div>

          <div className="my-9 border-t border-slate-200" />

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Advertisement Image
            </h2>

            <p className="mt-2 text-slate-600">
              Upload a new image only when you want to replace the
              existing image.
            </p>

            <label className="mt-6 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#087531] hover:bg-green-50">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {previewImage ? (
                <div>
                  <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl bg-slate-200">
                    <Image
                      src={previewImage}
                      alt="Advertisement preview"
                      fill
                      unoptimized={Boolean(newImagePreview)}
                      className="object-cover"
                    />
                  </div>

                  <p className="mt-4 font-black text-[#087531]">
                    Click here to replace the image
                  </p>
                </div>
              ) : (
                <div className="py-10">
                  <div className="text-5xl">🖼️</div>

                  <p className="mt-4 text-lg font-black text-slate-900">
                    Click to upload an advertisement image
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    JPG, PNG, or WebP — Maximum 5 MB
                  </p>
                </div>
              )}
            </label>

            {newImageFile && (
              <button
                type="button"
                onClick={() => {
                  if (newImagePreview) {
                    URL.revokeObjectURL(newImagePreview);
                  }

                  setNewImageFile(null);
                  setNewImagePreview("");
                }}
                className="mt-4 rounded-xl border border-red-300 px-5 py-3 font-black text-red-700 transition hover:bg-red-50"
              >
                Cancel New Image
              </button>
            )}
          </div>

          <div className="my-9 border-t border-slate-200" />

          <div>
            <h2 className="text-2xl font-black text-slate-900">
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
                  className={inputClass}
                  placeholder="https://www.example.com"
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

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#087531] px-7 py-4 text-lg font-black text-white transition hover:bg-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Changes..."
                : "Save Advertisement Changes"}
            </button>

            <Link
              href={`/promotion/my-ads/${advertisement.id}`}
              className="rounded-xl border-2 border-slate-300 px-7 py-4 text-center font-black text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>

          {advertisement.status === "active" && (
            <p className="mt-5 rounded-2xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
              Editing an active advertisement will return it to
              pending review before it can become active again.
            </p>
          )}
        </form>

        <aside>
          <div className="sticky top-6 rounded-3xl bg-slate-900 p-7 text-white shadow-lg">
            <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
              Advertisement Summary
            </span>

            <h2 className="mt-5 text-2xl font-black">
              {advertisement.title}
            </h2>

            <div className="my-6 border-t border-slate-700" />

            <div className="grid gap-4">
              <SummaryRow
                label="Package"
                value={advertisement.package}
              />

              <SummaryRow
                label="Duration"
                value={`${advertisement.duration_days} days`}
              />

              <SummaryRow
                label="Price"
                value={`$${Number(
                  advertisement.price
                ).toFixed(2)}`}
              />

              <SummaryRow
                label="Status"
                value={advertisement.status}
              />

              <SummaryRow
                label="Payment"
                value={advertisement.payment_status}
              />
            </div>

            <div className="mt-7 rounded-2xl bg-slate-800 p-5">
              <p className="text-sm leading-6 text-slate-300">
                Package, price, duration, and payment status cannot
                be changed from this page.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
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
    <div className="flex items-start justify-between gap-5">
      <span className="text-slate-400">{label}</span>

      <span className="text-right font-black capitalize">
        {value}
      </span>
    </div>
  );
}

function getStoragePathFromPublicUrl(
  publicUrl: string,
  bucketName: string
) {
  try {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const markerIndex = publicUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      publicUrl.substring(markerIndex + marker.length)
    );
  } catch {
    return null;
  }
}