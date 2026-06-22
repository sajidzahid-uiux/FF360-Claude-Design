import Link from "next/link";

import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            className="text-sm text-gray-600 hover:text-gray-900"
            href={AUTH_ROUTES.signIn}
          >
            ← Back to Sign In
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Terms & Conditions
        </h1>

        <div className="prose prose-gray">
          <p className="mb-4 text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p className="text-text-muted">
              By accessing and using this service, you accept and agree to be
              bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              2. Use License
            </h2>
            <p className="text-text-muted">
              Permission is granted to temporarily access the materials on this
              application for personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              3. Disclaimer
            </h2>
            <p className="text-text-muted">
              The materials on this application are provided on an &apos;as
              is&apos; basis. We make no warranties, expressed or implied, and
              hereby disclaim and negate all other warranties.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              4. Privacy Policy
            </h2>
            <p className="text-text-muted">
              Your privacy is important to us. We are committed to protecting
              your personal information and your right to privacy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
