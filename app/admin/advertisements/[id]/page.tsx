"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Advertisement = {
  id: string;
  user_id: string;
  business_name: string;
  title: string;
  description: string;
  category: string;
  package: string;
  price: number;
  image_url: string | null;
  website: string | null;
  phone: string;
  email: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  duration_days: number;
  clicks: number;
  impressions: number;
  payment_status: string;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
};

type ActionType =
  | "approve"
  | "activate"
  | "reject"
  | "expire"
  | "mark-paid"
  | "delete"
  | "";

export default function AdminAdvertisementReviewPage() {
  const params = useParams();
  const router = useRouter();

  const advertisementId = params.id as string;

  const [advertisement, setAdvertisement] =
    useState<Advertisement | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] =
    useState<ActionType>("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

  const loadAdvertisement = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("id", advertisementId)
        .single();

      if (error) {
        throw new Error(
          `Unable to load advertisement: ${error.message}`
        );
      }

      if (!data) {
        throw new Error("Advertisement not found.");
      }

      setAdvertisement(data as Advertisement);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load advertisement.";

      setMessage(errorMessage);
      setMessageType("error");
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

  async function updateAdvertisement(
    action: Exclude<ActionType, "" | "delete">,
    updates: Partial<Advertisement>,
    successMessage: string
  ) {
    if (!advertisement) {
      return;
    }

    setActiveAction(action);
    setMessage("");
    setMessageType("");

    try {
      const { error } = await supabase
        .from("advertisements")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", advertisement.id);

      if (error) {
        throw new Error(error.message);
      }

      setAdvertisement((current) =>
        current
          ? {
              ...current,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : current
      );

      setMessage(successMessage);
      setMessageType("success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update advertisement.";

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setActiveAction("");
    }
  }

  async function handleApprove() {
    await updateAdvertisement(
      "approve",
      {
        status: "approved",
      },
      "Advertisement approved successfully."
    );
  }

  async function handleMarkPaid() {
    await updateAdvertisement(
      "mark-paid",
      {
        payment_status: "paid",
      },
      "Payment marked as paid."
    );
  }

  async function handleActivate() {
    if (!advertisement) {
      return;
    }

    if (
      advertisement.package !== "free" &&
      advertisement.payment_status !== "paid"
    ) {
      setMessage(
        "Paid advertisements must be marked as paid before activation."
      );
      setMessageType("error");
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setDate(
      endDate.getDate() +
        Number(advertisement.duration_days || 0)
    );

    await updateAdvertisement(
      "activate",
      {
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
      "Advertisement activated successfully."
    );
  }

  async function handleReject() {
    const confirmed = window.confirm(
      "Are you sure you want to reject this advertisement?"
    );

    if (!confirmed) {
      return;
    }

    await updateAdvertisement(
      "reject",
      {
        status: "rejected",
      },
      "Advertisement rejected."
    );
  }

  async function handleExpire() {
    const confirmed = window.confirm(
      "Are you sure you want to expire this advertisement?"
    );

    if (!confirmed) {
      return;
    }

    await updateAdvertisement(
      "expire",
      {
        status: "expired",
        end_date: new Date().toISOString(),
      },
      "Advertisement expired."
    );
  }

  async function handleDelete() {
    if (!advertisement) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this advertisement permanently? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("delete");
    setMessage("");
    setMessageType("");

    try {
      if (advertisement.image_url) {
        const imagePath = getStoragePathFromPublicUrl(
          advertisement.image_url,
          "promotion-images"
        );

        if (imagePath) {
          await supabase.storage
            .from("promotion-images")
            .remove([imagePath]);
        }
      }

      const { error } = await supabase
        .from("advertisements")
        .delete()
        .eq("id", advertisement.id);

      if (error) {
        throw new Error(error.message);
      }

      router.push("/admin?section=promotions");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to delete advertisement.";

      setMessage(errorMessage);
      setMessageType("error");
      setActiveAction("");
    }
  }

  function formatDate(value: string | null) {
    if (!value) {
      return "Not set";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
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
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <div className="text-6xl">⚠️</div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            Advertisement Unavailable
          </h1>

          <p className="mt-4 leading-7 text-red-700">
            {message || "The advertisement could not be found."}
          </p>

          <Link
            href="/admin/advertisements"
            className="mt-7 inline-flex rounded-xl bg-[#087531] px-6 py-3 font-black text-white"
          >
            Return to Advertisements
          </Link>
        </div>
      </main>
    );
  }

  const isFreePackage =
    advertisement.package === "free";

  const paymentVerified =
    isFreePackage ||
    advertisement.payment_status === "paid";

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-[#064d2b] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin/advertisements"
            className="font-bold text-yellow-400 hover:text-yellow-300"
          >
            ← Advertisement Management
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-black sm:text-5xl">
                Review Advertisement
              </h1>

              <p className="mt-4 text-lg text-green-100">
                Review payment, content, status, and publishing
                information.
              </p>
            </div>

            <StatusBadge status={advertisement.status} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {advertisement.image_url ? (
              <div className="relative aspect-video bg-slate-200">
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

                <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-black capitalize text-yellow-800">
                  {advertisement.package} Package
                </span>
              </div>

              <h2 className="mt-7 text-4xl font-black text-slate-900">
                {advertisement.title}
              </h2>

              <p className="mt-2 text-xl font-bold text-slate-600">
                {advertisement.business_name}
              </p>

              <h3 className="mt-9 text-2xl font-black text-slate-900">
                Description
              </h3>

              <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
                {advertisement.description}
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <h2 className="text-3xl font-black text-slate-900">
              Advertiser Contact Information
            </h2>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <InfoCard
                label="Phone"
                value={advertisement.phone}
              />

              <InfoCard
                label="Email"
                value={advertisement.email}
              />

              <InfoCard
                label="Website"
                value={advertisement.website || "Not provided"}
              />

              <InfoCard
                label="User ID"
                value={advertisement.user_id}
              />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <h2 className="text-3xl font-black text-slate-900">
              Performance
            </h2>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <StatCard
                label="Impressions"
                value={advertisement.impressions}
              />

              <StatCard
                label="Clicks"
                value={advertisement.clicks}
              />
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-3xl bg-slate-900 p-7 text-white shadow-lg">
              <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                Administration
              </span>

              <h2 className="mt-5 text-2xl font-black">
                Advertisement Actions
              </h2>

              <p className="mt-3 leading-7 text-slate-300">
                Review the advertisement and select the appropriate
                action.
              </p>

              <div className="mt-7 grid gap-3">
                {advertisement.status !== "approved" &&
                  advertisement.status !== "active" && (
                    <ActionButton
                      label="Approve Advertisement"
                      loadingLabel="Approving..."
                      loading={activeAction === "approve"}
                      disabled={Boolean(activeAction)}
                      onClick={handleApprove}
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                    />
                  )}

                {!isFreePackage &&
                  advertisement.payment_status !== "paid" && (
                    <ActionButton
                      label="Mark Payment as Paid"
                      loadingLabel="Updating Payment..."
                      loading={activeAction === "mark-paid"}
                      disabled={Boolean(activeAction)}
                      onClick={handleMarkPaid}
                      className="bg-blue-600 text-white hover:bg-blue-500"
                    />
                  )}

                {advertisement.status !== "active" && (
                  <ActionButton
                    label={
                      paymentVerified
                        ? "Activate Advertisement"
                        : "Payment Required Before Activation"
                    }
                    loadingLabel="Activating..."
                    loading={activeAction === "activate"}
                    disabled={
                      Boolean(activeAction) ||
                      !paymentVerified
                    }
                    onClick={handleActivate}
                    className="bg-[#087531] text-white hover:bg-[#0b8f3d]"
                  />
                )}

                {advertisement.status !== "rejected" && (
                  <ActionButton
                    label="Reject Advertisement"
                    loadingLabel="Rejecting..."
                    loading={activeAction === "reject"}
                    disabled={Boolean(activeAction)}
                    onClick={handleReject}
                    className="border border-red-400 text-red-300 hover:bg-red-950"
                  />
                )}

                {advertisement.status !== "expired" && (
                  <ActionButton
                    label="Expire Advertisement"
                    loadingLabel="Expiring..."
                    loading={activeAction === "expire"}
                    disabled={Boolean(activeAction)}
                    onClick={handleExpire}
                    className="border border-orange-400 text-orange-300 hover:bg-orange-950"
                  />
                )}

                <ActionButton
                  label="Delete Advertisement"
                  loadingLabel="Deleting..."
                  loading={activeAction === "delete"}
                  disabled={Boolean(activeAction)}
                  onClick={handleDelete}
                  className="border border-red-500 bg-red-950 text-red-200 hover:bg-red-900"
                />
              </div>

              {message && (
                <div
                  className={`mt-6 rounded-2xl border p-4 text-sm font-bold leading-6 ${
                    messageType === "success"
                      ? "border-green-500 bg-green-950 text-green-200"
                      : "border-red-500 bg-red-950 text-red-200"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Payment Information
              </h2>

              <div className="mt-6 grid gap-5">
                <InfoRow
                  label="Package"
                  value={advertisement.package}
                />

                <InfoRow
                  label="Price"
                  value={`$${Number(
                    advertisement.price
                  ).toFixed(2)}`}
                />

                <InfoRow
                  label="Payment status"
                  value={advertisement.payment_status}
                />

                <InfoRow
                  label="Payment reference"
                  value={
                    advertisement.payment_reference ||
                    "Not provided"
                  }
                />

                <InfoRow
                  label="Duration"
                  value={`${advertisement.duration_days} days`}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Publishing Schedule
              </h2>

              <div className="mt-6 grid gap-5">
                <InfoRow
                  label="Created"
                  value={formatDate(
                    advertisement.created_at
                  )}
                />

                <InfoRow
                  label="Start"
                  value={formatDate(
                    advertisement.start_date
                  )}
                />

                <InfoRow
                  label="End"
                  value={formatDate(
                    advertisement.end_date
                  )}
                />

                <InfoRow
                  label="Last updated"
                  value={formatDate(
                    advertisement.updated_at
                  )}
                />
              </div>
            </div>

            {advertisement.status === "active" && (
              <Link
                href={`/promotion/${advertisement.id}`}
                target="_blank"
                className="block rounded-3xl bg-yellow-400 p-6 text-center font-black text-black transition hover:bg-yellow-300"
              >
                Open Public Advertisement ↗
              </Link>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function ActionButton({
  label,
  loadingLabel,
  loading,
  disabled,
  onClick,
  className,
}: {
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl px-5 py-4 font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    draft: "bg-slate-200 text-slate-800",
    pending: "bg-yellow-300 text-yellow-950",
    approved: "bg-blue-200 text-blue-900",
    active: "bg-green-300 text-green-950",
    expired: "bg-red-200 text-red-900",
    rejected: "bg-red-300 text-red-950",
  };

  return (
    <span
      className={`w-fit rounded-full px-5 py-3 text-sm font-black uppercase tracking-wider ${
        styles[status] || "bg-slate-200 text-slate-800"
      }`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-900 p-7 text-white">
      <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-5xl font-black">
        {Number(value || 0)}
      </p>
    </div>
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
    <div className="border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-1 break-words font-black capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}

function getStoragePathFromPublicUrl(
  publicUrl: string,
  bucketName: string
) {
  try {
    const marker = `/storage/v1/object/public/${bucketName}/`;
    const markerIndex = publicUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      publicUrl.substring(markerIndex + marker.length)
    );
  } catch {
    return null;
  }
}