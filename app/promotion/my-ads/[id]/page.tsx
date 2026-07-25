"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Advertisement = {
  id: string;
  business_name: string;
  title: string;
  description: string;
  category: string;
  package: string;
  price: number;
  duration_days: number;
  image_url: string | null;
  website: string | null;
  phone: string;
  email: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  clicks: number;
  impressions: number;
  created_at: string;
};

const packageNames: Record<string, string> = {
  free: "Free Community",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export default function PublicAdvertisementPage() {
  const params = useParams();
  const advertisementId = params.id as string;

  const [advertisement, setAdvertisement] =
    useState<Advertisement | null>(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const impressionRecorded = useRef(false);

  const loadAdvertisement = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select(
          `
            id,
            business_name,
            title,
            description,
            category,
            package,
            price,
            duration_days,
            image_url,
            website,
            phone,
            email,
            status,
            start_date,
            end_date,
            clicks,
            impressions,
            created_at
          `
        )
        .eq("id", advertisementId)
        .eq("status", "active")
        .single();

      if (error) {
        throw new Error(
          `Unable to load the advertisement: ${error.message}`
        );
      }

      if (!data) {
        throw new Error(
          "This advertisement is not available or is no longer active."
        );
      }

      const loadedAdvertisement = data as Advertisement;

      setAdvertisement(loadedAdvertisement);

      if (!impressionRecorded.current) {
        impressionRecorded.current = true;

        await supabase
          .from("advertisements")
          .update({
            impressions:
              Number(loadedAdvertisement.impressions || 0) + 1,
          })
          .eq("id", loadedAdvertisement.id)
          .eq("status", "active");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load this advertisement.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [advertisementId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdvertisement();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdvertisement]);

  async function recordClick() {
    if (!advertisement) {
      return;
    }

    await supabase
      .from("advertisements")
      .update({
        clicks: Number(advertisement.clicks || 0) + 1,
      })
      .eq("id", advertisement.id)
      .eq("status", "active");

    setAdvertisement((current) =>
      current
        ? {
            ...current,
            clicks: Number(current.clicks || 0) + 1,
          }
        : current
    );
  }

  function formatDate(dateValue: string | null) {
    if (!dateValue) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateValue));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#087531]" />

          <p className="mt-5 font-bold text-slate-700">
            Loading advertisement...
          </p>
        </div>
      </main>
    );
  }

  if (!advertisement) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f5] px-6">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <div className="text-6xl">📣</div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            Advertisement Unavailable
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            {message ||
              "This advertisement could not be found or is not active."}
          </p>

          <Link
            href="/promotion"
            className="mt-7 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white transition hover:bg-[#064d2b]"
          >
            Return to Promotion
          </Link>
        </div>
      </main>
    );
  }

  const packageDisplayName =
    packageNames[advertisement.package] ||
    advertisement.package;

  return (
    <main className="min-h-screen bg-[#f7f8f5]">
      <section className="bg-[#064d2b] px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/promotion"
            className="font-bold text-yellow-400 transition hover:text-yellow-300"
          >
            ← Back to Promotions
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex rounded-full bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-black">
                Sponsored Advertisement
              </span>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
                {advertisement.title}
              </h1>

              <p className="mt-4 text-xl font-bold text-green-50">
                {advertisement.business_name}
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-sm font-bold text-green-100">
                Advertising Package
              </p>

              <p className="mt-1 text-xl font-black text-yellow-400">
                {packageDisplayName}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-9 px-6 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {advertisement.image_url ? (
              <div className="relative aspect-video w-full bg-slate-200">
                <Image
                  src={advertisement.image_url}
                  alt={advertisement.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-slate-200 text-8xl">
                🖼️
              </div>
            )}

            <div className="p-6 sm:p-9">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-800">
                  {advertisement.category}
                </span>

                <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-yellow-800">
                  {advertisement.duration_days} Day Promotion
                </span>
              </div>

              <h2 className="mt-8 text-3xl font-black text-slate-900">
                About This Promotion
              </h2>

              <p className="mt-5 whitespace-pre-line text-lg leading-9 text-slate-700">
                {advertisement.description}
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <h2 className="text-3xl font-black text-slate-900">
              Business Contact Information
            </h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <ContactCard
                icon="📞"
                title="Phone"
                value={advertisement.phone}
                href={`tel:${advertisement.phone}`}
                onClick={recordClick}
              />

              <ContactCard
                icon="✉️"
                title="Email"
                value={advertisement.email}
                href={`mailto:${advertisement.email}`}
                onClick={recordClick}
              />

              {advertisement.website && (
                <ContactCard
                  icon="🌐"
                  title="Website or Social Media"
                  value="Visit Website"
                  href={advertisement.website}
                  external
                  onClick={recordClick}
                />
              )}

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-3xl">🏷️</div>

                <p className="mt-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                  Category
                </p>

                <p className="mt-1 font-black text-slate-900">
                  {advertisement.category}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-yellow-300 bg-yellow-50 p-6 sm:p-8">
            <h2 className="text-2xl font-black text-slate-900">
              Advertisement Notice
            </h2>

            <p className="mt-3 leading-7 text-slate-700">
              This content was submitted by the advertiser. Contact the
              business directly to verify pricing, availability, services,
              event details, and other information before making a purchase
              or commitment.
            </p>
          </article>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-3xl bg-slate-900 p-7 text-white shadow-lg">
              <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                Contact Advertiser
              </span>

              <h2 className="mt-5 text-2xl font-black">
                {advertisement.business_name}
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Contact this business directly for more information about
                this promotion.
              </p>

              <a
                href={`tel:${advertisement.phone}`}
                onClick={recordClick}
                className="mt-7 block rounded-xl bg-[#087531] px-6 py-4 text-center font-black text-white transition hover:bg-[#0b8f3d]"
              >
                Call {advertisement.phone}
              </a>

              <a
                href={`mailto:${advertisement.email}`}
                onClick={recordClick}
                className="mt-4 block rounded-xl border border-white px-6 py-4 text-center font-black text-white transition hover:bg-white hover:text-slate-900"
              >
                Send Email
              </a>

              {advertisement.website && (
                <a
                  href={advertisement.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={recordClick}
                  className="mt-4 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-300"
                >
                  Visit Website
                </a>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Promotion Information
              </h2>

              <div className="mt-6 grid gap-5">
                <InfoRow
                  label="Package"
                  value={packageDisplayName}
                />

                <InfoRow
                  label="Duration"
                  value={`${advertisement.duration_days} days`}
                />

                <InfoRow
                  label="Start date"
                  value={formatDate(advertisement.start_date)}
                />

                <InfoRow
                  label="End date"
                  value={formatDate(advertisement.end_date)}
                />

                <InfoRow
                  label="Views"
                  value={String(
                    Number(advertisement.impressions || 0) + 1
                  )}
                />

                <InfoRow
                  label="Contact clicks"
                  value={String(advertisement.clicks || 0)}
                />
              </div>
            </div>

            <Link
              href="/promotion/post"
              className="block rounded-3xl bg-yellow-400 p-7 text-center text-black shadow-sm transition hover:bg-yellow-300"
            >
              <div className="text-4xl">📣</div>

              <h2 className="mt-4 text-2xl font-black">
                Promote Your Business
              </h2>

              <p className="mt-3 leading-7">
                Reach Ethiopian and Eritrean customers throughout the DMV.
              </p>

              <span className="mt-5 inline-flex rounded-xl bg-[#064d2b] px-5 py-3 font-black text-white">
                Create Advertisement
              </span>
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  external = false,
  onClick,
}: {
  icon: string;
  title: string;
  value: string;
  href: string;
  external?: boolean;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="rounded-2xl bg-slate-50 p-5 transition hover:bg-green-50"
    >
      <div className="text-3xl">{icon}</div>

      <p className="mt-3 text-sm font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-1 break-words font-black text-[#064d2b]">
        {value}
      </p>
    </a>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-right text-sm font-black capitalize text-slate-900">
        {value}
      </span>
    </div>
  );
}