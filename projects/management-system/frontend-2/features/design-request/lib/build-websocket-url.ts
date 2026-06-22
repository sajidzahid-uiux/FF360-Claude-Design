import { API_URL } from "@/constants";

const WS_AUTH_TOKEN_QUERY_PARAM = "token";

export function buildDesignRequestWebSocketUrl(
  organizationId: string,
  accessToken: string
): string {
  const apiBase = API_URL.trim();
  const base = new URL(apiBase.endsWith("/") ? apiBase : `${apiBase}/`);
  const wsProtocol = base.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = new URL(
    `/ws/td_integration/${organizationId}/`,
    `${wsProtocol}//${base.host}`
  );
  wsUrl.searchParams.set(WS_AUTH_TOKEN_QUERY_PARAM, accessToken);
  return wsUrl.toString();
}

export type DesignRequestWsEvent =
  | {
      event: "design_request_status_changed";
      design_request_id: number;
      cms_request_id: string;
      status: string;
    }
  | {
      event: "note_added" | "note_updated" | "note_deleted";
      design_request_id: number;
      note_id?: number;
      source?: string;
    }
  | {
      event: "shared_output_updated";
      design_request_id: number;
      cms_request_id: string;
      ingest_status: string;
    };

export function parseDesignRequestWsPayload(
  raw: string
): DesignRequestWsEvent | null {
  try {
    const data = JSON.parse(raw) as DesignRequestWsEvent;
    if (!data || typeof data !== "object" || !("event" in data)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
