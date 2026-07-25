"use client";

import { useSyncExternalStore } from "react";

type FavoriteButtonProps = {
  rentalId: string;
  title?: string;
};

const FAVORITES_KEY = "habeshawi-favorites";
const FAVORITES_EVENT = "favorites-updated";

function readFavorites(): string[] {
  try {
    const storedValue = localStorage.getItem(FAVORITES_KEY);
    const parsedValue: unknown = JSON.parse(storedValue ?? "[]");

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (value): value is string => typeof value === "string",
    );
  } catch {
    return [];
  }
}

function subscribeToFavorites(callback: () => void) {
  function handleFavoritesUpdated() {
    callback();
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === FAVORITES_KEY) {
      callback();
    }
  }

  window.addEventListener(FAVORITES_EVENT, handleFavoritesUpdated);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(
      FAVORITES_EVENT,
      handleFavoritesUpdated,
    );
    window.removeEventListener("storage", handleStorage);
  };
}

export default function FavoriteButton({
  rentalId,
  title = "rental",
}: FavoriteButtonProps) {
  const isFavorite = useSyncExternalStore(
    subscribeToFavorites,
    () => readFavorites().includes(rentalId),
    () => false,
  );

  function toggleFavorite() {
    try {
      const savedFavorites = readFavorites();

      const updatedFavorites = savedFavorites.includes(rentalId)
        ? savedFavorites.filter((id) => id !== rentalId)
        : [...savedFavorites, rentalId];

      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites),
      );

      window.dispatchEvent(new Event(FAVORITES_EVENT));
    } catch {
      console.error("Unable to update favorites.");
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-label={
        isFavorite
          ? `Remove ${title} from favorites`
          : `Save ${title} to favorites`
      }
      aria-pressed={isFavorite}
      title={isFavorite ? "Remove from favorites" : "Save to favorites"}
      className="rounded-full bg-white p-2 text-2xl shadow transition hover:scale-110"
    >
      {isFavorite ? "❤️" : "♡"}
    </button>
  );
}