import { HelpCenterLayout } from "@/features/help-center";

export default function HelpCenterRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HelpCenterLayout>{children}</HelpCenterLayout>;
}
