import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { AlertCircle } from "lucide-react";

import { Card } from "@/shared/ui/primitives/card";

export interface OneCallSite {
  state?: string;
  state_province?: string;
  message?: string;
  website1?: string;
  website2?: string;
  website3?: string;
  website?: string;
}

export default function SitesPopUp({
  sites,
  handleOpenSite,
  setSitePopUp,
  error,
}: {
  sites: OneCallSite[];
  handleOpenSite: (site: OneCallSite) => void;
  setSitePopUp: (open: boolean) => void;
  error?: string | null;
}) {
  const hasMessage = sites.some((site) => site.message);

  const renderWebsiteButtons = (site: OneCallSite) => {
    const websites = [
      { url: site.website1, label: "Website 1" },
      { url: site.website2, label: "Website 2" },
      { url: site.website3, label: "Website 3" },
    ].filter((website) => website.url); // Only show websites that have a URL

    return websites.map((website, idx) => (
      <Button
        key={idx}
        aria-label={`${site.state} - ${website.label}`}
        className="w-full justify-start"
        title={`${site.state} - ${website.label}`}
        variant={ButtonVariantEnum.SURFACE}
        onClick={() => handleOpenSite({ ...site, website: website.url })}
      />
    ));
  };

  const renderMessageCard = (site: OneCallSite, index: number) => {
    return (
      <div
        key={index}
        className="border-border-subtle bg-bg-surface/50 flex items-start gap-3 rounded-md border p-4"
      >
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-500" />
        <div className="flex flex-col gap-1">
          <span className="text-text-primary font-medium">
            {site.state_province || site.state}
          </span>
          <p className="text-text-muted text-sm">{site.message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 py-8 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Card className="bg-bg-surface-elevated max-h-[calc(100vh-4rem)] w-[740px] p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-center text-2xl font-semibold">
            {error
              ? "Warning"
              : hasMessage
                ? "One Call Information"
                : "Select a Site"}
          </h2>
          {error ? (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {sites.map((site, index) => (
                <div key={index} className="flex flex-col gap-2">
                  {site.message
                    ? renderMessageCard(site, index)
                    : renderWebsiteButtons(site)}
                </div>
              ))}
            </div>
          )}
          <Button
            aria-label={hasMessage ? "Close" : "Cancel"}
            className="mt-4"
            title={hasMessage ? "Close" : "Cancel"}
            variant={ButtonVariantEnum.GHOST}
            onClick={() => setSitePopUp(false)}
          />
        </div>
      </Card>
    </div>
  );
}
