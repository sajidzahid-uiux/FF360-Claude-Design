"use client";

import { Globe, MapPin, Network } from "lucide-react";

import type { DeviceSession } from "@/api/types";

import { getDeviceDisplayName } from "./utils/getDeviceDisplayName";

export function DeviceItem({ device }: { device: DeviceSession }) {
  const displayName = getDeviceDisplayName(device);
  const browserOs = `${device.browser} on ${device.os}`;

  return (
    <div className="min-w-0 px-4 py-4">
      <div className="mb-1 flex items-center gap-2">
        <p className="text-text-primary text-sm font-medium">{displayName}</p>
        {device.is_current && (
          <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            This device
          </span>
        )}
      </div>
      <div className="text-text-muted flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {device.ip_address && (
          <span className="flex items-center gap-1">
            <Network aria-hidden className="h-4 w-4 shrink-0" />
            {device.ip_address}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Globe aria-hidden className="h-4 w-4 shrink-0" />
          {browserOs}
        </span>
        {device.location && (
          <span className="flex items-center gap-1">
            <MapPin aria-hidden className="h-4 w-4 shrink-0" />
            {device.location}
          </span>
        )}
      </div>
    </div>
  );
}
