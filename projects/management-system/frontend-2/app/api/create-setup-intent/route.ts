import { NextResponse } from "next/server";

import Stripe from "stripe";

import { getStripeSecretKey } from "@/lib/server-env";

const stripe = new Stripe(getStripeSecretKey());
export async function POST() {
  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error("Error creating setup intent:", error);
    return NextResponse.json(
      {
        error: "Failed to create setup intent",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
