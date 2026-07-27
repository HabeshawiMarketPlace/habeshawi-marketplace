import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type ContentKind =
  | "rental"
  | "marketplace"
  | "business"
  | "service"
  | "promotion";

type AdminAction =
  | "approve"
  | "reject"
  | "pending"
  | "delete"
  | "feature"
  | "unfeature"
  | "expire";

const tableByKind: Record<ContentKind, string> = {
  rental: "rentals",
  marketplace: "marketplace_listings",
  business: "businesses",
  service: "services",
  promotion: "advertisements",
};

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing administrator session." },
        { status: 401 },
      );
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Administrator session is invalid or expired." },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 },
      );
    }

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Administrator access is required." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as {
      kind?: ContentKind;
      id?: string;
      action?: AdminAction;
    };

    const { kind, id, action } = body;

    if (!kind || !id || !action || !tableByKind[kind]) {
      return NextResponse.json(
        { error: "Invalid moderation request." },
        { status: 400 },
      );
    }

    const table = tableByKind[kind];

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true });
    }

    if (action === "feature" || action === "unfeature") {
      if (kind !== "marketplace" && kind !== "business") {
        return NextResponse.json(
          { error: "Featured status is not supported for this section." },
          { status: 400 },
        );
      }

      const { error } = await supabaseAdmin
        .from(table)
        .update({ featured: action === "feature" })
        .eq("id", id);

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true });
    }

    let status: string;

    if (action === "approve") {
      status = kind === "promotion" ? "active" : "approved";
    } else if (action === "reject") {
      status = "rejected";
    } else if (action === "pending") {
      status = "pending";
    } else if (action === "expire" && kind === "promotion") {
      status = "expired";
    } else {
      return NextResponse.json(
        { error: "Unsupported moderation action." },
        { status: 400 },
      );
    }

    if (kind === "rental" && status === "approved") {
      const { data: rental, error: rentalError } = await supabaseAdmin
        .from("rentals")
        .select("payment_status")
        .eq("id", id)
        .maybeSingle();

      if (rentalError) {
        throw rentalError;
      }

      if (!rental) {
        return NextResponse.json(
          { error: "Rental was not found." },
          { status: 404 },
        );
      }

      if (rental.payment_status !== "paid") {
        return NextResponse.json(
          { error: "This rental is unpaid and cannot be approved." },
          { status: 400 },
        );
      }
    }

    if (kind === "promotion" && status === "active") {
      const { data: promotion, error: promotionError } =
        await supabaseAdmin
          .from("advertisements")
          .select("payment_status")
          .eq("id", id)
          .maybeSingle();

      if (promotionError) {
        throw promotionError;
      }

      if (!promotion) {
        return NextResponse.json(
          { error: "Promotion was not found." },
          { status: 404 },
        );
      }

      if (promotion.payment_status !== "paid") {
        return NextResponse.json(
          { error: "This promotion is unpaid and cannot be activated." },
          { status: 400 },
        );
      }
    }

    const updateValues: Record<string, unknown> = { status };

    const { error } = await supabaseAdmin
      .from(table)
      .update(updateValues)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Admin moderation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete moderation action.",
      },
      { status: 500 },
    );
  }
}