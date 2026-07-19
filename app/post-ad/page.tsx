"use client";

import { supabase } from "@/lib/supabase";

export default function PostAdPage() {
 
  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const bedroomsValue = formData.get("bedrooms");
  const bathroomsValue = formData.get("bathrooms");
  const imageFiles = formData
  .getAll("photos")
  .filter(
    (file): file is File =>
      file instanceof File && file.size > 0
  );

if (imageFiles.length === 0) {
  alert("Please upload at least one property photo.");
  return;
}

if (imageFiles.length > 5) {
  alert("You can upload a maximum of 5 photos.");
  return;
}

const imageUrls: string[] = [];

for (const imageFile of imageFiles) {
  if (imageFile.size > 5 * 1024 * 1024) {
    alert(`${imageFile.name} must be 5 MB or smaller.`);
    return;
  }

  const extension =
    imageFile.name.split(".").pop()?.toLowerCase() ?? "jpg";

  const filePath = `rentals/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("housing-images")
    .upload(filePath, imageFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    alert(`Unable to upload ${imageFile.name}: ${uploadError.message}`);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("housing-images")
    .getPublicUrl(filePath);

  imageUrls.push(publicUrlData.publicUrl);
}

const imageUrl = imageUrls[0];

const { data: rental, error } = await supabase
  .from("rentals")
  .insert({
  title: formData.get("title"),
  property_type: formData.get("property_type"),
  price: Number(formData.get("price")),
  location: formData.get("location"),
  bedrooms: bedroomsValue ? Number(bedroomsValue) : null,
  bathrooms: bathroomsValue ? Number(bathroomsValue) : null,
  description: formData.get("description"),
  phone: formData.get("phone"),
  whatsapp: formData.get("whatsapp") || null,
  email: formData.get("email") || null,
  image_url: imageUrl,

  status: "pending",
  payment_status: "unpaid",
})
.select("id")
.single();

  if (error) {
    alert(`Unable to submit rental: ${error.message}`);
    return;
  }

if (!rental) {
  alert("Rental was saved, but its ID could not be retrieved.");
  return;
}

const rentalImages = imageUrls.map((url, index) => ({
  rental_id: rental.id,
  image_url: url,
  display_order: index + 1,
}));

const { error: imagesError } = await supabase
  .from("rental_images")
  .insert(rentalImages);
  console.log("Rental Images:", rentalImages);
  console.log("Images Error:", imagesError);

if (imagesError) {
  alert(
    `Rental saved, but the photo records could not be saved: ${imagesError.message}`
  );
  return;
}

window.location.href = `/pricing?rentalId=${rental.id}`;
}
  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold text-[#064d2b]">
          Post a Rental
        </h1>

        <p className="mt-3 text-slate-600">
          Add your apartment, house, room, or roommate listing.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
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
              Property type
            </option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="room">Room</option>
            <option value="roommate">Roommate</option>
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

          <div className="grid gap-5 sm:grid-cols-2">
<input
  type="tel"
  name="phone"
  placeholder="Phone Number"
  required
  className="col-span-2 rounded-lg border border-slate-300 px-4 py-3"
/>

<input
  type="tel"
  name="whatsapp"
  placeholder="WhatsApp"
  className="rounded-lg border border-slate-300 px-4 py-3"
/>
          </div>

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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="amenities"
                  value="parking"
                />
                Parking
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="amenities"
                  value="utilities-included"
                />
                Utilities Included
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="amenities"
                  value="wifi-included"
                />
                Wi-Fi Included
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="amenities"
                  value="laundry"
                />
                Laundry
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="amenities"
                  value="air-conditioning"
                />
                Air Conditioning
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="amenities"
                  value="pets-allowed"
                />
                Pets Allowed
              </label>
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
    required
    accept="image/*"
    className="w-full rounded-lg border border-slate-300 px-4 py-3"
  />

  <p className="mt-2 text-sm text-slate-500">
    Upload 1 to 5 photos. Maximum 5 MB per photo.
  </p>
</div>


          <button
            type="submit"
            className="rounded-lg bg-[#087531] px-6 py-3 font-semibold text-white hover:bg-[#064d2b]"
          >
            Submit Rental
          </button>
        </form>
      </div>
    </main>
  );
}