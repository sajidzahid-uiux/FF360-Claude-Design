import type { FootageAllJobsApiRow, FormattedFootageData } from "@/api/types";

export function formatCrewLabelFromApi(item: FootageAllJobsApiRow): string {
  if (item.crew && String(item.crew).trim().length > 0) {
    return String(item.crew).trim();
  }
  if (Array.isArray(item.crews) && item.crews.length > 0) {
    return item.crews
      .map((c) => c?.name)
      .filter((n): n is string => Boolean(n && String(n).trim()))
      .join(", ");
  }
  return "—";
}

const toDateSafe = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatFootageDisplayDate = (d: Date | null): string =>
  d ? d.toLocaleDateString() : "N/A";

export function buildFormattedFootageTableData(
  data: FootageAllJobsApiRow[]
): FormattedFootageData[] {
  const result: FormattedFootageData[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    const firstDate = toDateSafe(item["First Recorded Date"]);
    const lastDate = toDateSafe(item["Last Updated"]);

    const firstMs = firstDate?.getTime() ?? 0;
    const lastMs = lastDate?.getTime() ?? 0;

    const mainFootage =
      (item["Total Installed Main Footage"] ?? 0) +
      (item["Total Installed Dual Wall Main Footage"] ?? 0);

    result[i] = {
      id: item.Job_id,
      job_id: item.Job_id,

      name: item.contact_info?.full_name || item["Job Title"] || "N/A",

      first_recorded: formatFootageDisplayDate(firstDate),
      last_updated: formatFootageDisplayDate(lastDate),

      first_recorded_ms: firstMs,
      last_updated_ms: lastMs,

      crew_display: formatCrewLabelFromApi(item),

      total_lateral_footage: `${item["Total Installed Lateral Footage"]} ft`,
      total_main_footage: `${mainFootage} ft`,

      job_status: item["Job status"] ?? "Not Available",

      is_completed: item.is_completed,
      is_cancelled: item.is_cancelled,

      excel_sheet: true,
      note: item.comment || "",
      content_type: item["content-type"],

      "4": item["4"] ?? 0,
      "5": item["5"] ?? 0,
      "6": item["6"] ?? 0,
      "8": item["8"] ?? 0,
      "10": item["10"] ?? 0,
      "12": item["12"] ?? 0,
      "15": item["15"] ?? 0,
      "18": item["18"] ?? 0,
      "24": item["24"] ?? 0,
      "30": item["30"] ?? 0,
      "36": item["36"] ?? 0,
      "42": item["42"] ?? 0,
      "54": item["54"] ?? 0,
      "60": item["60"] ?? 0,

      single_wall: item.single_wall ?? {},
      dual_wall: item.dual_wall ?? {},
    };
  }

  return result;
}
