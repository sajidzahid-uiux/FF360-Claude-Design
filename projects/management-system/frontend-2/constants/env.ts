/**
 * Environment Variables Configuration
 * Centralized location for all environment variables used in the frontend
 */

if (typeof window === "undefined") {
  const requiredEnvVars = ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_WS_URL"];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// API URLs
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "";

export const VENDOR_API_URL = process.env.NEXT_PUBLIC_VENDOR_API_URL || "";

// Google Maps
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Auth0 Configuration
export const AUTH0_DOMAIN = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "";
export const AUTH0_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "";
export const AUTH0_REDIRECT_URI =
  process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || "";
export const AUTH0_SCOPE = process.env.NEXT_PUBLIC_AUTH0_SCOPE || "";
export const AUTH0_AUDIENCE = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "";

// Stripe
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// PostHog Analytics
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;
