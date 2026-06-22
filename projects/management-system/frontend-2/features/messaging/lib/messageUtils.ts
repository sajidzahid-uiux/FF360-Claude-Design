import type { ChatMessage } from "@/api/types/chat";

/** Stable deduplication key for a chat message. Prefers `id`, falls back to `timestamp`. */
export const getMessageKey = (
  msg: ChatMessage | null | undefined
): string | number | null =>
  msg?.id ??
  (msg as { timestamp?: string | number } | undefined)?.timestamp ??
  null;

export const getMessageGroupId = (message?: ChatMessage): number | null => {
  const candidate =
    message?.group_id ??
    message?.group ??
    message?.chat_group_id ??
    message?.chat_group?.id ??
    null;

  if (typeof candidate === "number") return candidate;

  if (typeof candidate === "string") {
    const parsed = Number(candidate);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

export const getPreviewTimestamp = (message?: ChatMessage): number => {
  const raw =
    message?.created_at || message?.timestamp || message?.time || null;
  if (!raw) return 0;
  const parsed = new Date(raw as string).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getMessageIdForPreview = (
  message?: ChatMessage
): number | string | null => {
  const m = message as { id?: number | string } | undefined;
  if (m?.id == null) return null;
  return m.id;
};

export interface ResolveGroupIdOptions {
  tab: string;
  selectedId: number | null;
  selectedDirectMemberId: number | null;
  groups: { id: number; is_private?: boolean; members?: number[] }[];
  currentUserId: number;
}

export const resolveGroupIdForIncomingMessage = (
  msg: ChatMessage,
  opts: ResolveGroupIdOptions
): number | null => {
  const fromPayload = getMessageGroupId(msg);
  if (fromPayload != null) return fromPayload;
  if (opts.tab === "groups" && opts.selectedId) return opts.selectedId;
  if (opts.tab === "direct" && opts.selectedDirectMemberId) {
    const strict = opts.groups.find(
      (g) =>
        g.is_private &&
        g.members &&
        g.members.length === 2 &&
        g.members.includes(opts.selectedDirectMemberId!) &&
        g.members.includes(opts.currentUserId)
    );
    const fallback = opts.groups.find(
      (g) =>
        g.is_private &&
        g.members &&
        g.members.length === 2 &&
        g.members.includes(opts.selectedDirectMemberId!)
    );
    return (strict ?? fallback)?.id ?? null;
  }
  return null;
};
