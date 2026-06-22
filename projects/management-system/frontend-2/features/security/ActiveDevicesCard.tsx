"use client";

import { useDevices } from "@/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import { DeviceItem } from "./DeviceItem";

export function ActiveDevicesCard() {
  const { data, isLoading } = useDevices();
  const devices = data?.devices ?? [];

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-lg">Active devices</CardTitle>
          <CardDescription>
            Manage devices currently logged into your account.
          </CardDescription>
        </div>
        {devices.length > 0 ? (
          <span className="bg-bg-app text-text-muted shrink-0 rounded-full px-3 py-1 text-xs font-medium">
            {devices.length} {devices.length === 1 ? "device" : "devices"}
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <p className="text-text-muted py-8 text-center text-sm">
            Loading devices...
          </p>
        ) : devices.length === 0 ? (
          <p className="text-text-muted py-8 text-center text-sm">
            No active devices to display
          </p>
        ) : (
          <div className="border-border-subtle divide-border-subtle divide-y rounded-xl border">
            {devices.map((device) => (
              <DeviceItem key={device.device_id} device={device} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
