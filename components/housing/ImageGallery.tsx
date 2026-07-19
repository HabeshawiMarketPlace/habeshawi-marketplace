"use client";

import { useEffect, useState } from "react";

type ImageGalleryProps = {
  images: string[];
  title: string;
};

export default function ImageGallery({
  images,
  title,
}: ImageGalleryProps) {
  const validImages = images.filter(
    (image): image is string =>
      typeof image === "string" && image.trim().length > 0
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  if (validImages.length === 0) {
    return (
      <div className="p-4">
        <img
          src="/housing/apartments/apartment1.jpg"
          alt="Rental property"
          className="h-[420px] w-full rounded-xl object-cover"
        />
      </div>
    );
  }

  const selectedImage =
    validImages[selectedIndex] ?? validImages[0];

  return (
    <div className="p-4">
      <img
        src={selectedImage}
        alt={`${title} main photo`}
        className="h-[420px] w-full rounded-xl object-cover"
      />

      {validImages.length > 1 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {validImages.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View photo ${index + 1}`}
              className={`overflow-hidden rounded-lg border-2 ${
                selectedIndex === index
                  ? "border-[#087531]"
                  : "border-transparent"
              }`}
            >
              <img
                src={imageUrl}
                alt={`${title} photo ${index + 1}`}
                className="h-24 w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}