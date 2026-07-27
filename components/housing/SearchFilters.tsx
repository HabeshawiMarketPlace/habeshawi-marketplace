"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const commercialTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "retail_storefront", label: "Retail Storefront" },
  { value: "convenience_store", label: "Convenience Store" },
  { value: "office", label: "Office" },
  { value: "salon", label: "Salon" },
  { value: "warehouse", label: "Warehouse" },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(
    searchParams.get("location") ?? "",
  );

  const [propertyType, setPropertyType] = useState(
    searchParams.get("type") ?? "",
  );

  const [commercialType, setCommercialType] = useState(
    searchParams.get("commercialType") ?? "",
  );

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") ?? "",
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") ?? "",
  );

  const [bedrooms, setBedrooms] = useState(
    searchParams.get("bedrooms") ?? "",
  );

  const [bathrooms, setBathrooms] = useState(
    searchParams.get("bathrooms") ?? "",
  );

  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") ?? "newest",
  );

  function handlePropertyTypeChange(value: string) {
    setPropertyType(value);

    if (value !== "commercial") {
      setCommercialType("");
    }
  }

  function handleSearch() {
    const params = new URLSearchParams();

    if (location.trim()) {
      params.set("location", location.trim());
    }

    if (propertyType) {
      params.set("type", propertyType);
    }

    if (propertyType === "commercial" && commercialType) {
      params.set("commercialType", commercialType);
    }

    if (minPrice) {
      params.set("minPrice", minPrice);
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    }

    if (bedrooms) {
      params.set("bedrooms", bedrooms);
    }

    if (bathrooms) {
      params.set("bathrooms", bathrooms);
    }

    if (sortBy) {
      params.set("sort", sortBy);
    }

    const query = params.toString();

    router.push(query ? `/housing?${query}` : "/housing");
  }

  function handleReset() {
    setLocation("");
    setPropertyType("");
    setCommercialType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setSortBy("newest");

    router.push("/housing");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="City or neighborhood"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        />

        <select
          value={propertyType}
          onChange={(event) =>
            handlePropertyTypeChange(event.target.value)
          }
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        >
          <option value="">Property Type</option>
          <option value="room">Room</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="roommate">Roommate</option>
          <option value="commercial">Commercial</option>
        </select>

        {propertyType === "commercial" ? (
          <select
            value={commercialType}
            onChange={(event) =>
              setCommercialType(event.target.value)
            }
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
          >
            <option value="">Commercial Type</option>

            {commercialTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        ) : null}

        <input
          type="number"
          min="0"
          placeholder="Minimum Rent"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        />

        <input
          type="number"
          min="0"
          placeholder="Maximum Rent"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        />

        <select
          value={bedrooms}
          onChange={(event) => setBedrooms(event.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        >
          <option value="">Bedrooms</option>
          <option value="1">1+ Bedroom</option>
          <option value="2">2+ Bedrooms</option>
          <option value="3">3+ Bedrooms</option>
          <option value="4">4+ Bedrooms</option>
        </select>

        <select
          value={bathrooms}
          onChange={(event) => setBathrooms(event.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        >
          <option value="">Bathrooms</option>
          <option value="1">1+ Bathroom</option>
          <option value="2">2+ Bathrooms</option>
          <option value="3">3+ Bathrooms</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#087531]"
        >
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-100"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg bg-[#087531] px-8 py-3 font-semibold text-white transition hover:bg-[#064d2b]"
        >
          Search
        </button>
      </div>
    </div>
  );
}