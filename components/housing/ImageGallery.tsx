"use client";

import Image from "next/image";
import { useState } from "react";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

const FALLBACK_IMAGE = "/housing/apartments/apartment1.jpg";

export default function ImageGallery({
  images,
  title,
}: ImageGalleryProps) {
  const validImages = images.filter(
    (image): image is string =>
      typeof image === "string" && image.trim().length > 0
  );

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const activeImage =
    selectedImage && validImages.includes(selectedImage)
      ? selectedImage
      : validImages[0] ?? FALLBACK_IMAGE;

  const hasImages = validImages.length > 0;

  return (
    <div className="p-4">
      <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={activeImage}
          alt={hasImages ? `${title} main photo` : "Rental property"}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
        />
      </div>

      {validImages.length > 1 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {validImages.map((imageUrl, index) => {
            const isSelected = activeImage === imageUrl;

            return (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => setSelectedImage(imageUrl)}
                aria-label={`View photo ${index + 1}`}
                aria-pressed={isSelected}
                className={`relative h-24 overflow-hidden rounded-lg border-2 bg-slate-100 transition ${
                  isSelected
                    ? "border-[#087531]"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <Image
                  src={imageUrl}
                  alt={`${title} photo ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 33vw, 180px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}