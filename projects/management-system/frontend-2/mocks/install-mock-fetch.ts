/**
 * LOCAL PROTOTYPE: window.fetch shim for the chat endpoints that the messaging
 * feature requests with the NATIVE fetch() API instead of axios — so the axios
 * mock adapter (mockApi.ts) never sees them.
 *
 * Currently handled:
 *  - chat/{org}/groupmessages/?group_id=…&page=…  → dummy conversation history
 *
 * Everything else is delegated to the real fetch untouched. Installed once,
 * client-side only, from lib/axios.ts when NEXT_PUBLIC_USE_MOCK_DATA is on.
 */
import { buildGroupMessagesPage } from "./data/chat";

let installed = false;

const urlOf = (input: RequestInfo | URL): string => {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

export function installMockFetch() {
  if (installed || typeof window === "undefined" || !window.fetch) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = urlOf(input);

    // chat/{org}/groupmessages/?group_id=…&page=…
    if (/chat\/[^/]+\/groupmessages\//.test(url)) {
      const groupId = Number(url.match(/group_id=(\d+)/)?.[1] ?? 0);
      const page = Number(url.match(/page=(\d+)/)?.[1] ?? 1);
      return jsonResponse(buildGroupMessagesPage(groupId, page));
    }

    return originalFetch(input, init);
  };
}
