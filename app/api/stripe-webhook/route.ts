import Stripe from "stripe";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";

import { supabaseAdmin } from "@/lib/supabase-admin";

import PaymentReceiptEmail from "@/components/emails/PaymentReceiptEmail";
import AdminNotificationEmail from "@/components/emails/AdminNotificationEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ??
  "endalkx@gmail.com";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://habeshawi-marketplace.vercel.app";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing Stripe signature.",
      },
      {
        status: 400,
      }
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

    console.error(message);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({
      received: true,
      eventType: event.type,
    });
  }

  const session =
    event.data.object as Stripe.Checkout.Session;

  const rentalId = session.metadata?.rentalId;

  const listingType =
    session.metadata?.listingType;

  if (!rentalId || listingType !== "housing") {
    return NextResponse.json({
      received: true,
      eventType: event.type,
    });
  }

  const expiresAt = new Date(
    Date.now() + 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: rental, error: updateError } =
    await supabaseAdmin
      .from("rentals")
      .update({
        payment_status: "paid",
        status: "pending",
        reminder_count: 0,
        last_reminder_sent_at: null,
        expires_at: expiresAt,
      })
      .eq("id", rentalId)
      .select("*")
      .single();

  if (updateError || !rental) {
    console.error(updateError);

    return NextResponse.json(
      {
        error:
          updateError?.message ??
          "Unable to update rental.",
      },
      {
        status: 500,
      }
    );
  }

  const title =
    rental.title ??
    rental.property_type ??
    "Rental Listing";

  const location =
    rental.location ??
    rental.city ??
    rental.address ??
    "Location not provided";

  const monthlyRent =
    rental.price ??
    rental.monthly_rent ??
    "Not provided";

  const amountPaid = formatMoney(
    session.amount_total ?? 0,
    session.currency ?? "usd"
  );

  const customerEmail =
    rental.email ??
    session.customer_details?.email ??
    null;

  const adminUrl = `${SITE_URL}/admin`;

  const reviewUrl = `${SITE_URL}/admin/edit/${rentalId}`;
  /*
   * Send the administrator notification.
   */
  try {
    const adminEmailHtml = await render(
      AdminNotificationEmail({
        title: String(title),
        location: String(location),
        monthlyRent: String(monthlyRent),
        amountPaid,
        customerEmail,
        reviewUrl,
        adminUrl,
      })
    );

    const { error: adminEmailError } =
      await resend.emails.send({
        from:
          "Habeshawi Marketplace <onboarding@resend.dev>",
        to: ADMIN_EMAIL,
        subject:
          "New Paid Rental Waiting for Approval",
        html: adminEmailHtml,
      });

    if (adminEmailError) {
      console.error(
        "Admin notification email error:",
        adminEmailError
      );
    } else {
      console.log(
        "Admin notification sent for rental:",
        rentalId
      );
    }
  } catch (emailError) {
    console.error(
      "Unable to send admin notification:",
      emailError
    );
  }

  /*
   * Send the customer payment receipt.
   */
  if (customerEmail) {
    try {
      const customerReceiptHtml = await render(
        PaymentReceiptEmail({
          title: String(title),
          propertyType: String(
            rental.property_type ?? "Not provided"
          ),
          amountPaid,
          siteUrl: SITE_URL,
        })
      );

      const { error: customerEmailError } =
        await resend.emails.send({
          from:
            "Habeshawi Marketplace <onboarding@resend.dev>",
          to: customerEmail,
          subject:
            "Payment Receipt - Habeshawi Marketplace",
          html: customerReceiptHtml,
        });

      if (customerEmailError) {
        console.error(
          "Customer receipt email error:",
          customerEmailError
        );
      } else {
        console.log(
          "Customer receipt email sent to:",
          customerEmail
        );
      }
    } catch (emailError) {
      console.error(
        "Unable to send customer receipt:",
        emailError
      );
    }
  } else {
    console.log(
      "Customer receipt not sent because no customer email was available."
    );
  }
  return NextResponse.json({
    received: true,
    eventType: event.type,
  });
}

function formatMoney(
  amountInCents: number,
  currency: string
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}