export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set in environment variables. " +
        "This is required for Stripe operations."
    );
  }

  return key;
}

export function validateServerEnv(): void {
  const requiredVars = ["STRIPE_SECRET_KEY"];

  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `⚠️  Missing required server environment variables: ${missing.join(", ")}`
    );

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `Production environment missing required variables: ${missing.join(", ")}`
      );
    }
  }
}

if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
  validateServerEnv();
}
