"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

const GoogleMapsProvider = dynamic(
  () => import("@/providers/GoogleMapsProvider"),
  {
    ssr: false,
  }
);

function shouldLoadGoogleMaps(pathname: string): boolean {
  return /^\/organizations\/\d+\/(?:map|order-pipe|jobs|leads|contact|equipment)(?:\/|$)/.test(
    pathname
  );
}

export default function GoogleMapsClientWrapper({
  children,
  pathname,
}: {
  children: ReactNode;
  pathname: string;
}) {
  if (!shouldLoadGoogleMaps(pathname)) {
    return children;
  }

  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}
