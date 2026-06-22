export interface BatteryReplacementProps {
  equipmentId: number | string;
  disabled?: boolean;
  onOpenMediaViewer?: (params: { url: string; title: string }) => void;
}

export type BatteryImageKind = "battery" | "warranty";
