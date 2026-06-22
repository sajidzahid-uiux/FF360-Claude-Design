import { Card, CardContent } from "@/shared/ui/primitives";

import DeleteAccountForm from "./DeleteAccountForm";
import DeleteAccountInfo from "./DeleteAccountInfo";
import WarningAlert from "./WarningAlert";

export default function UserDeletePageContent() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className="rounded-2xl border-l-[3px] border-l-[var(--color-feedback-error)]">
        <CardContent className="space-y-6 pt-6">
          <WarningAlert />
          <DeleteAccountInfo />
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
