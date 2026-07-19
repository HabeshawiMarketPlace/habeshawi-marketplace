import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid webhook signature.";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const rentalId = session.metadata?.rentalId;

    if (rentalId) {
      const { error } = await supabaseAdmin
        .from("rentals")
        .update({
          payment_status: "paid",
          expires_at: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("id", rentalId);

      if (error) {
        console.error("Supabase update error:", error);

        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({
    received: true,
    eventType: event.type,
  });
}