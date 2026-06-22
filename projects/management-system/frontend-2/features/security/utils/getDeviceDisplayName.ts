import type { DeviceSession } from "@/api/types";

/**
 * Get a friendly display name for a device based on device_type and os.
 */
export function getDeviceDisplayName(device: DeviceSession): string {
  const { device_type, os } = device;
  if (device_type === "Desktop") {
    if (os?.toLowerCase().includes("mac")) return "MacBook Pro";
    if (os?.toLowerCase().includes("win")) return "Windows PC";
    if (os?.toLowerCase().includes("linux")) return "Linux PC";
    return "Desktop";
  }
  if (device_type === "Mobile") {
    if (os?.toLowerCase().includes("ios")) return "iPhone";
    if (os?.toLowerCase().includes("android")) return "Android Phone";
    return "Mobile";
  }
  if (device_type === "Tablet") {
    if (os?.toLowerCase().includes("ios")) return "iPad";
    if (os?.toLowerCase().includes("android")) return "Android Tablet";
    return "Tablet";
  }
  return device_type || "Device";
}
