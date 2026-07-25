"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const DEFAULT_RENTAL_IMAGE = "/default-rental.jpg";
const REQUEST_TIMEOUT_MS = 20000;

function withTimeout<T>(
  promise: PromiseLike<T>,
  timeoutMessage: string,
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, REQUEST_TIMEOUT_MS);
    }),
  ]);
}

export default function PostRentalPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [editLink, setEditLink] = useState("");
  const [createdRentalId, setCreatedRentalId] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");

  useEffect(() => {
    async function checkUser() {
      try {
        const {
          data: { user },
          error,
        } = await withTimeout(
          supabase.auth.getUser(),
          "Account check timed out.",
        );

        if (error || !user) {
          router.replace("/login");
          return;
        }

        setCheckingUser(false);
      } catch {
        router.replace("/login");
      }
    }

    void checkUser();
  }, [router]);

  async function copyEditLink() {
    if (!editLink) return;

    try {
      await navigator.clipboard.writeText(editLink);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setErrorMessage(
        "Unable to copy the link. Please copy it manually.",
      );
    }
  }

  async function uploadImages(
    imageFiles: File[],
    userId: string,
  ): Promise<string[]> {
    if (imageFiles.length === 0) {
      return [DEFAULT_RENTAL_IMAGE];
    }

    if (imageFiles.length > 5) {
      throw new Error("You can upload a maximum of 5 photos.");
    }

    const imageUrls: string[] = [];

    for (let index = 0; index < imageFiles.length; index += 1) {
      const imageFile = imageFiles[index];

      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error(
          `${imageFile.name} must be 5 MB or smaller.`,
        );
      }

      if (!imageFile.type.startsWith("image/")) {
        throw new Error(
          `${imageFile.name} is not a supported image file.`,
        );
      }

      setSubmitStatus(
        `Uploading photo ${index + 1} of ${imageFiles.length}...`,
      );

      const extension =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath =
        `rentals/${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await withTimeout(
        supabase.storage
          .from("housing-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          }),
        `Photo upload timed out for ${imageFile.name}.`,
      );

      if (uploadError) {
        throw new Error(
          `Unable to upload ${imageFile.name}: ${uploadError.message}`,
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("housing-images")
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error(
          `Unable to create the public URL for ${imageFile.name}.`,
        );
      }

      imageUrls.push(publicUrlData.publicUrl);
    }

    return imageUrls;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;

    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitStatus("Checking your account...");

    try {
      const {
        data: { user },
        error: userError,
      } = await withTimeout(
        supabase.auth.getUser(),
        "Account verification timed out.",
      );

      if (userError || !user) {
        router.replace("/login");
        throw new Error(
          "You must be signed in to post a rental.",
        );
      }

      const formData = new FormData(form);

      const title = String(formData.get("title") ?? "").trim();
      const propertyType = String(
        formData.get("property_type") ?? "",
      ).trim();
      const priceValue = String(formData.get("price") ?? "").trim();
      const location = String(
        formData.get("location") ?? "",
      ).trim();
      const phone = String(formData.get("phone") ?? "").trim();
      const description = String(
        formData.get("description") ?? "",
      ).trim();

      if (
        !title ||
        !propertyType ||
        !priceValue ||
        !location ||
        !phone
      ) {
        throw new Error(
          "Please complete all required rental information.",
        );
      }

      const price = Number(priceValue);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Please enter a valid monthly rent.");
      }

      const imageFiles = formData
        .getAll("photos")
        .filter(
          (value): value is File =>
            value instanceof File && value.size > 0,
        );

      const imageUrls = await uploadImages(
        imageFiles,
        user.id,
      );

      const bedroomsText = String(
        formData.get("bedrooms") ?? "",
      ).trim();

      const bathroomsText = String(
        formData.get("bathrooms") ?? "",
      ).trim();

      const availableDateText = String(
        formData.get("available_date") ?? "",
      ).trim();

      const whatsapp = String(
        formData.get("whatsapp") ?? "",
      ).trim();

      const email = String(formData.get("email") ?? "").trim();

      const editToken = crypto.randomUUID();

      setSubmitStatus("Saving your rental...");

      const { data: rental, error: rentalError } =
        await withTimeout(
          supabase
            .from("rentals")
            .insert({
              user_id: user.id,
              title,
              property_type: propertyType,
              price,
              location,
              bedrooms: bedroomsText
                ? Number(bedroomsText)
                : null,
              bathrooms: bathroomsText
                ? Number(bathroomsText)
                : null,
              available_date: availableDateText || null,
              description: description || null,
              phone,
              whatsapp: whatsapp || null,
              email: email || null,
              image_url: imageUrls[0],
              edit_token: editToken,
              status: "draft",
              payment_status: "unpaid",
            })
            .select("id")
            .single(),
          "Saving the rental timed out. Please try again.",
        );

      if (rentalError) {
        throw new Error(
          `Unable to submit rental: ${rentalError.message}`,
        );
      }

      if (!rental?.id) {
        throw new Error(
          "The rental was not created correctly because no ID was returned.",
        );
      }

      setSubmitStatus("Saving photo information...");

      const rentalImages = imageUrls.map((imageUrl, index) => ({
        rental_id: rental.id,
        image_url: imageUrl,
        display_order: index + 1,
      }));

      const { error: imagesError } = await withTimeout(
        supabase.from("rental_images").insert(rentalImages),
        "Saving the photo information timed out.",
      );

      if (imagesError) {
        throw new Error(
          `Rental saved, but photo information failed: ${imagesError.message}`,
        );
      }

      const privateEditLink =
        `${window.location.origin}/post-ad/edit/${rental.id}` +
        `?token=${editToken}`;

      localStorage.setItem(
        `rental-edit-link-${rental.id}`,
        privateEditLink,
      );

      setCreatedRentalId(String(rental.id));
      setEditLink(privateEditLink);
      setSubmitStatus("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit the rental.";

      console.error("Rental submission failed:", error);
      setErrorMessage(message);
      setSubmitStatus("");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <p className="text-lg font-semibold text-slate-700">
          Checking your account...
        </p>
      </main>
    );
  }

  if (editLink && createdRentalId) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <h1 className="text-3xl font-bold text-[#064d2b]">
              Listing Created
            </h1>

            <p className="mt-3 text-slate-700">
              Your listing was saved. It will not appear publicly
              until payment and admin approval are completed.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6">
            <h2 className="text-xl font-bold text-amber-900">
              Save Your Private Edit Link
            </h2>

            <p className="mt-2 text-sm text-amber-800">
              Anyone who has this link can edit the listing. Do not
              share it publicly.
            </p>

            <div className="mt-4 break-all rounded-lg border bg-white p-4 text-sm">
              {editLink}
            </div>

            <button
              type="button"
              onClick={copyEditLink}
              className="mt-4 rounded-lg border border-[#087531] px-5 py-3 font-semibold text-[#087531] hover:bg-green-50"
            >
              {copied ? "Link Copied" : "Copy Private Edit Link"}
            </button>
          </div>

          <div className="mt-8">
            <Link
              href={`/pricing?rentalId=${createdRentalId}`}
              className="block rounded-lg bg-[#087531] px-6 py-4 text-center text-lg font-semibold text-white hover:bg-[#064d2b]"
            >
              Continue to Payment
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow sm:p-8">
        <h1 className="text-4xl font-bold text-[#064d2b]">
          Post a Rental
        </h1>

        <p className="mt-3 text-slate-600">
          Add a room, apartment, house, roommate space, or commercial
          rental.
        </p>

        {errorMessage ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-5"
        >
          <input
            type="text"
            name="title"
            placeholder="Example: 2-bedroom apartment in Silver Spring"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />

          <select
            name="property_type"
            required
            defaultValue=""
            className="rounded-lg border border-slate-300 px-4 py-3"
          >
            <option value="" disabled>
              Select property type
            </option>

            <option value="room">Room</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="roommate">Roommate</option>
            <option value="retail">Retail Storefront</option>
            <option value="restaurant">Restaurant</option>
            <option value="office">Office</option>
            <option value="warehouse">Warehouse</option>
            <option value="salon">Salon / Barbershop</option>
            <option value="mixed-use">Mixed-Use</option>
            <option value="commercial-other">
              Other Commercial
            </option>
          </select>

          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            placeholder="Monthly rent"
            required
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            required
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <input
              type="number"
              name="bedrooms"
              min="0"
              placeholder="Bedrooms"
              className="rounded-lg border border-slate-300 px-4 py-3"
            />

            <input
              type="number"
              name="bathrooms"
              min="0"
              step="0.5"
              placeholder="Bathrooms"
              className="rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="available_date"
              className="mb-2 block font-semibold text-slate-700"
            >
              Available Date
            </label>

            <input
              id="available_date"
              type="date"
              name="available_date"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <input
            type="tel"
            name="whatsapp"
            placeholder="WhatsApp"
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <div>
            <h2 className="mb-3 text-lg font-semibold text-[#064d2b]">
              Amenities
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["parking", "Parking"],
                ["utilities-included", "Utilities Included"],
                ["wifi-included", "Wi-Fi Included"],
                ["laundry", "Laundry"],
                ["air-conditioning", "Air Conditioning"],
                ["pets-allowed", "Pets Allowed"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    name="amenities"
                    value={value}
                  />

                  {label}
                </label>
              ))}
            </div>
          </div>

          <textarea
            name="description"
            placeholder="Description"
            rows={5}
            className="rounded-lg border border-slate-300 px-4 py-3"
          />

          <div>
            <label
              htmlFor="photos"
              className="mb-2 block font-semibold text-slate-700"
            >
              Property Photos
            </label>

            <input
              id="photos"
              type="file"
              name="photos"
              multiple
              accept="image/*"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />

            <p className="mt-2 text-sm text-slate-500">
              Optional. Upload up to 5 photos, maximum 5 MB each. If
              you do not upload a photo, the default image will be
              used.
            </p>
          </div>

          {submitStatus ? (
            <p className="rounded-lg bg-blue-50 p-3 text-center font-semibold text-blue-800">
              {submitStatus}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#087531] px-6 py-3 font-semibold text-white hover:bg-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting Rental..."
              : "Submit Rental"}
          </button>
        </form>
      </div>
    </main>
  );
}