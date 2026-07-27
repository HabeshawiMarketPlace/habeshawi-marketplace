"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/housing/ListingCard";
import { supabase } from "@/lib/supabase";

type Rental = {
  id: string;
  title: string;
  location: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
  property_type: string | null;
  commercial_type: string | null;
  created_at: string;
  phone: string | null;
  whatsapp: string | null;
  image_url: string | null;
  rental_images?: {
    image_url: string;
    display_order: number | null;
  }[];
};

export default function FavoritesPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const favoriteIds: string[] = JSON.parse(
          localStorage.getItem("habeshawi-favorites") ?? "[]",
        );

        if (favoriteIds.length === 0) {
          setRentals([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("rentals")
          .select(`
            *,
            rental_images (
              image_url,
              display_order
            )
          `)
          .in("id", favoriteIds)
          .eq("payment_status", "paid")
          .eq("status", "approved");

        if (error) {
          console.error(error);
          setRentals([]);
          return;
        }

        setRentals(data ?? []);
      } catch (error) {
        console.error("Unable to load favorites:", error);
        setRentals([]);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();

    function handleFavoritesUpdated() {
      loadFavorites();
    }

    window.addEventListener(
      "favorites-updated",
      handleFavoritesUpdated,
    );

    return () => {
      window.removeEventListener(
        "favorites-updated",
        handleFavoritesUpdated,
      );
    };
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div>
        <p className="font-bold uppercase tracking-wide text-[#087531]">
          Saved rentals
        </p>

        <h1 className="mt-1 text-3xl font-black text-[#064d2b] sm:text-4xl">
          My Favorites
        </h1>

        <p className="mt-2 text-slate-600">
          View the rentals you saved on this device.
        </p>
      </div>

      {loading && (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
          Loading favorites...
        </div>
      )}

      {!loading && rentals.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-slate-800">
            You have no saved rentals yet
          </h2>

          <p className="mt-2 text-slate-600">
            Tap the heart icon on any rental to save it here.
          </p>

          <Link
            href="/housing"
            className="mt-6 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-bold text-white transition hover:bg-[#064d2b]"
          >
            Browse Rentals
          </Link>
        </div>
      )}

      {!loading && rentals.length > 0 && (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => {
            const sortedImages = [...(rental.rental_images ?? [])].sort(
              (a, b) =>
                Number(a.display_order ?? 0) -
                Number(b.display_order ?? 0),
            );

            const image =
              sortedImages[0]?.image_url ||
              rental.image_url ||
              "/housing/apartments/apartment1.jpg";

            return (
              <ListingCard
                key={rental.id}
                id={rental.id}
                href={`/housing/${rental.id}`}
                image={image}
                title={rental.title}
                location={rental.location ?? "Location not provided"}
                price={Number(rental.price ?? 0)}
                bedrooms={rental.bedrooms}
                bathrooms={rental.bathrooms}
                description={rental.description ?? ""}
                propertyType={rental.property_type}
                commercialType={rental.commercial_type ?? null}
                createdAt={rental.created_at}
                phone={rental.phone}
                whatsapp={rental.whatsapp}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}