"use client";

import { useEffect } from "react";

import { POSTHOG_HOST, POSTHOG_KEY } from "@/constants";

let initialized = false;

export default function PosthogInit() {
  useEffect(() => {
    if (!POSTHOG_KEY || !POSTHOG_HOST) return;
    if (initialized) return;

    initialized = true;

    void import("posthog-js").then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY as string, {
        api_host: POSTHOG_HOST,
        capture_pageview: "history_change",
      });
    });
  }, []);

  return null;
}
