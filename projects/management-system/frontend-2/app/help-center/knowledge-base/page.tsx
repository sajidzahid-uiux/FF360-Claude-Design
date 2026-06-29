import { Suspense } from "react";

import { KnowledgeBaseView } from "@/features/help-center";

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={null}>
      <KnowledgeBaseView />
    </Suspense>
  );
}
