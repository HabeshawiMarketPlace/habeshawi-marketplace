import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { listingType, rentalId } = await request.json();

    let name: string;
    let amount: number;

    if (listingType === "housing") {
      name = "Housing Listing — 90 Days";
      amount = 1099;
    } else if (listingType === "business") {
      name = "Business Listing — 90 Days";
      amount = 1999;
    } else {
      return NextResponse.json(
        { error: "Invalid listing type." },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
metadata: {
  rentalId,
  listingType,
},
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name,
            },
          },
        },
      ],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}