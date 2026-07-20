"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

type Rental = {
  id: string;
  title: string;
  property_type: string | null;
  price: number | null;
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  image_url: string | null;
};

type EditRentalFormProps = {
  rental: Rental;
};

export default function EditRentalForm({
  rental,
}: EditRentalFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(rental.title ?? "");
  const [propertyType, setPropertyType] = useState(
    rental.property_type ?? ""
  );
  const [price, setPrice] = useState(
    rental.price?.toString() ?? ""
  );
  const [location, setLocation] = useState(
    rental.location ?? ""
  );
  const [bedrooms, setBedrooms] = useState(
    rental.bedrooms?.toString() ?? ""
  );
  const [bathrooms, setBathrooms] = useState(
    rental.bathrooms?.toString() ?? ""
  );
  const [description, setDescription] = useState(
    rental.description ?? ""
  );
  const [phone, setPhone] = useState(rental.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(
    rental.whatsapp ?? ""
  );
  const [email, setEmail] = useState(rental.email ?? "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    rental.image_url
  );

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(rental.image_url);
      return;
    }

    const temporaryUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(temporaryUrl);

    return () => {
      URL.revokeObjectURL(temporaryUrl);
    };
  }, [imageFile, rental.image_url]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    let imageUrl: string | null = rental.image_url ?? null;

    if (imageFile) {
      if (imageFile.size > 5 * 1024 * 1024) {
        setMessage("Image must be 5 MB or smaller.");
        setLoading(false);
        return;
      }

      const fileExtension =
        imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";

      const filePath = `${rental.id}/${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("housing-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setMessage(
          `Unable to upload image: ${uploadError.message}`
        );
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("housing-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;

      if (!imageUrl) {
        setMessage(
          "The image uploaded, but its URL could not be created."
        );
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase
      .from("rentals")
      .update({
        title,
        property_type: propertyType || null,
        price: price ? Number(price) : null,
        location: location || null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        description: description || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email: email || null,
        image_url: imageUrl,
      })
      .eq("id", rental.id);

    if (error) {
      setMessage(`Unable to update listing: ${error.message}`);
      setLoading(false);
      return;
    }

    setMessage("Listing updated successfully.");
    setLoading(false);

    router.push("/admin");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#087531]";

  return (
    <>
      <div className="mt-6">
        <h2 className="mb-3 text-xl font-bold text-[#064d2b]">
          Submitted Rental Photo
        </h2>

        <div className="overflow-hidden rounded-xl border bg-slate-100">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={rental.title}
              width={900}
              height={500}
              unoptimized={previewUrl.startsWith("blob:")}
              className="h-80 w-full object-contain"
            />
          ) : (
            <div className="flex h-80 items-center justify-center text-slate-500">
              No image was submitted for this rental.
            </div>
          )}
        </div>

        {rental.image_url && (
          <a
            href={rental.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-semibold text-[#087531] hover:underline"
          >
            Open full-size submitted image
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block font-semibold">
            Replace Image
          </label>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) =>
              setImageFile(event.target.files?.[0] ?? null)
            }
            className="block w-full rounded-lg border border-gray-300 p-3"
          />

          <p className="mt-1 text-sm text-gray-500">
            Leave this empty to keep the renter&apos;s submitted
            image. JPG, PNG or WebP. Maximum size: 5 MB.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Listing title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Property type
          </label>

          <select
            value={propertyType}
            onChange={(event) =>
              setPropertyType(event.target.value)
            }
            className={inputClass}
          >
            <option value="">Select property type</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Room">Room</option>
            <option value="Roommate">Roommate</option>
            <option value="Basement">Basement</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Monthly rent
          </label>

          <input
            type="number"
            min="0"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Location
          </label>

          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Bedrooms
            </label>

            <input
              type="number"
              min="0"
              value={bedrooms}
              onChange={(event) =>
                setBedrooms(event.target.value)
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Bathrooms
            </label>

            <input
              type="number"
              min="0"
              step="0.5"
              value={bathrooms}
              onChange={(event) =>
                setBathrooms(event.target.value)
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            className={`${inputClass} min-h-32`}
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Phone
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            WhatsApp
          </label>

          <input
            type="tel"
            value={whatsapp}
            onChange={(event) =>
              setWhatsapp(event.target.value)
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </div>

        {message && (
          <p
            className={
              message.includes("successfully")
                ? "font-semibold text-green-700"
                : "font-semibold text-red-600"
            }
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#087531] px-6 py-3 font-semibold text-white hover:bg-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Listing"}
        </button>
      </form>
    </>
  );
}