"use client";

import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type BusinessImageUploadProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  description?: string;
  imageType?: "logo" | "cover";
  disabled?: boolean;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

function getFileExtension(file: File) {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  switch (file.type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

function createSafeFileName(file: File) {
  const extension = getFileExtension(file);
  const uniqueId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${uniqueId}.${extension}`;
}

export default function BusinessImageUpload({
  label,
  value,
  onChange,
  description,
  imageType = "cover",
  disabled = false,
}: BusinessImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setErrorMessage("");
    setSuccessMessage("");

    if (!file) {
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage(
        "Please choose a JPG, PNG, WebP, or GIF image.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("The image must be smaller than 5 MB.");

      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("You must be signed in to upload an image.");
      }

      const safeFileName = createSafeFileName(file);

      const filePath = `${user.id}/${imageType}/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("business-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("business-images")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      if (!publicUrl) {
        throw new Error("The image uploaded, but its public URL was not found.");
      }

      onChange(publicUrl);

      setSuccessMessage("Image uploaded successfully.");
    } catch (error) {
      console.error("Business image upload failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload the image. Please try again.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleChooseImage() {
    if (uploading || disabled) {
      return;
    }

    inputRef.current?.click();
  }

  function handleRemoveImage() {
    if (uploading || disabled) {
      return;
    }

    onChange("");
    setErrorMessage("");
    setSuccessMessage("Image removed from this business form.");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div>
        <h3 className="font-black text-slate-900">{label}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description ??
            "Choose an image from your computer. JPG, PNG, WebP, or GIF up to 5 MB."}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading || disabled}
        className="hidden"
      />

      {value ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div
            className={
              imageType === "logo"
                ? "relative min-h-64 w-full bg-white p-6"
                : "relative aspect-[16/9] w-full bg-slate-100"
            }
          >
            <Image
              src={value}
              alt={`${label} preview`}
              fill
              unoptimized
              loader={({ src }) => src}
              sizes={
                imageType === "logo"
                  ? "(max-width: 768px) 100vw, 640px"
                  : "(max-width: 768px) 100vw, 900px"
              }
              className={
                imageType === "logo"
                  ? "rounded-xl object-contain p-6"
                  : "object-cover"
              }
              onError={() => {
                setErrorMessage(
                  "The image preview could not be displayed. Upload another image.",
                );
              }}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row">
            <button
              type="button"
              onClick={handleChooseImage}
              disabled={uploading || disabled}
              className="flex-1 rounded-xl bg-[#087531] px-5 py-3 font-black text-white transition hover:bg-[#064d2b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Replace Image"}
            </button>

            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={uploading || disabled}
              className="rounded-xl border border-red-300 bg-white px-5 py-3 font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleChooseImage}
          disabled={uploading || disabled}
          className="mt-5 flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-8 text-center transition hover:border-[#087531] hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

              <span className="mt-4 font-black text-slate-800">
                Uploading image...
              </span>

              <span className="mt-1 text-sm text-slate-500">
                Please keep this page open.
              </span>
            </>
          ) : (
            <>
              <span className="text-5xl">
                {imageType === "logo" ? "🏢" : "📷"}
              </span>

              <span className="mt-4 font-black text-slate-900">
                Choose Image
              </span>

              <span className="mt-2 text-sm text-slate-500">
                JPG, PNG, WebP, or GIF — maximum 5 MB
              </span>
            </>
          )}
        </button>
      )}

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <span className="font-black">Upload failed: </span>
          {errorMessage}
        </div>
      ) : null}

      {successMessage && !errorMessage ? (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      ) : null}

      {value ? (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-bold text-slate-600 hover:text-slate-900">
            View image URL
          </summary>

          <div className="mt-2 break-all rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
            {value}
          </div>
        </details>
      ) : null}
    </div>
  );
}