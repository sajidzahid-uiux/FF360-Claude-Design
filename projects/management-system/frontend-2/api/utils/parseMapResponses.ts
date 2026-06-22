import type { MapDataApiResult, MapJob, MapLead, MapLegend } from "@/api/types";

function extractJobsLeadsFromResultsBlock(results: Record<string, unknown>): {
  jobs: MapJob[];
  leads: MapLead[];
} {
  const jobsRaw = results.jobs;
  const leadsRaw = results.leads;

  const jobs = Array.isArray(jobsRaw)
    ? (jobsRaw as MapJob[])
    : jobsRaw &&
        typeof jobsRaw === "object" &&
        "items" in (jobsRaw as object) &&
        Array.isArray((jobsRaw as { items?: unknown }).items)
      ? ((jobsRaw as { items: MapJob[] }).items as MapJob[])
      : [];

  const leads = Array.isArray(leadsRaw)
    ? (leadsRaw as MapLead[])
    : leadsRaw &&
        typeof leadsRaw === "object" &&
        "items" in (leadsRaw as object) &&
        Array.isArray((leadsRaw as { items?: unknown }).items)
      ? ((leadsRaw as { items: MapLead[] }).items as MapLead[])
      : [];

  return { jobs, leads };
}

export function parseMapDataHttpBody(httpBody: unknown): MapDataApiResult {
  const empty: MapDataApiResult = { jobs: [], leads: [] };
  if (!httpBody || typeof httpBody !== "object") return empty;

  const root = httpBody as Record<string, unknown>;

  const inner =
    root.data !== undefined &&
    root.data !== null &&
    typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const resultsPayload = inner.results;
  if (resultsPayload && typeof resultsPayload === "object") {
    const r = resultsPayload as Record<string, unknown>;
    const { jobs, leads } = extractJobsLeadsFromResultsBlock(r);
    return { jobs, leads };
  }

  if (Array.isArray(inner.jobs) && Array.isArray(inner.leads)) {
    return {
      jobs: inner.jobs as MapJob[],
      leads: inner.leads as MapLead[],
    };
  }

  return empty;
}

export function parseMapLegendsHttpBody(httpBody: unknown): MapLegend[] {
  if (!httpBody) {
    throw new Error("No response data received from API");
  }

  if (Array.isArray(httpBody)) {
    return httpBody;
  }

  if (typeof httpBody === "object" && httpBody !== null) {
    const root = httpBody as Record<string, unknown>;
    if (Array.isArray(root.data)) {
      return root.data as MapLegend[];
    }
  }

  throw new Error("Unexpected response structure from API");
}

export function parseMapLegendEntity(httpBody: unknown): MapLegend {
  if (httpBody && typeof httpBody === "object" && "data" in httpBody) {
    const nested = (httpBody as { data?: unknown }).data;
    if (nested && typeof nested === "object") {
      return nested as MapLegend;
    }
  }

  if (httpBody && typeof httpBody === "object") {
    return httpBody as MapLegend;
  }

  throw new Error("Unexpected map legend response structure from API");
}
