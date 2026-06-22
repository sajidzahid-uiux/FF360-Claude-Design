"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";
import { CheckCircle2 } from "lucide-react";

import { AUTH_ROUTES } from "@/lib/auth-routes";

export default function SuccessPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(AUTH_ROUTES.organizations);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!isDialogOpen) {
    return <div className="bg-bg-app min-h-screen" />;
  }

  return (
    <div className="bg-bg-app flex min-h-screen items-center justify-center">
      <AppFormModal
        isOpen={isDialogOpen}
        submitLabel="Go to Dashboard"
        title="Subscription Successful!"
        width={480}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(event) => {
          event.preventDefault();
          router.push(AUTH_ROUTES.organizations);
        }}
      >
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-500" />
          <p className="text-text-muted text-sm">
            Thank you for subscribing to our service. You will be redirected to
            the organization selection page in a few seconds.
          </p>
        </div>
      </AppFormModal>
    </div>
  );
}
