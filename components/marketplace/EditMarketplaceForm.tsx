"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Props = {
  listing: any;
};

export default function EditMarketplaceForm({ listing }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!listing) return;

    setTitle(listing.title ?? "");
    setDescription(listing.description ?? "");
    setPrice(listing.price?.toString() ?? "");
    setCategory(listing.category ?? "");
    setCondition(listing.condition ?? "");
    setLocation(listing.location ?? "");
    setPhone(listing.phone ?? "");
    setEmail(listing.email ?? "");

    setExistingImage(listing.image_url ?? "");
    setPreview(listing.image_url ?? "");
  }, [listing]);

  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

      let imageUrl = existingImage;

      // Upload a new image if selected
      if (imageFile) {
        const extension = imageFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("marketplace")
          .upload(fileName, imageFile, {
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("marketplace")
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("marketplace_listings")
        .update({
          title,
          description,
          price: price === "" ? null : Number(price),
          category,
          condition,
          location,
          phone,
          email,
          image_url: imageUrl,

          // User edits require approval again
          status: "pending",
        })
        .eq("id", listing.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      alert("Listing updated successfully. It is now pending admin approval.");

      router.push("/marketplace/my-listings");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Unable to update listing.");
    } finally {
      setLoading(false);
    }
  }  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-8 shadow"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Title
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
            Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-semibold">
          Description
        </label>

        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Category
          </label>

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Condition
          </label>

          <input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold">
            Location
          </label>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Phone
          </label>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-semibold">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div>
        <label className="mb-3 block font-semibold">
          Replace Image (optional)
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
        />

        {preview && (
          <div className="mt-5">
            <Image
              src={preview}
              alt="Preview"
              width={320}
              height={220}
              className="rounded-xl border object-cover"
              unoptimized
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
        Saving your changes will automatically submit this listing for
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
          onClick={() => router.push("/marketplace/my-listings")}
          className="rounded-xl border px-8 py-3 font-bold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}