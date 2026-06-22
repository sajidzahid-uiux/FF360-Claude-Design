"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const LazyChatBot = createLazyRoutePage(
  () => import("@/shared/ui/common/ChatBot")
);

export default LazyChatBot;
