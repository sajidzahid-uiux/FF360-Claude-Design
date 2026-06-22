"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { ChatMessage, Conversation } from "@/api/types/chat";
import { API_URL, WS_URL } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMessagesPageUi } from "@/features/messaging/model/messages-page-store";
import {
  getMessageGroupId,
  getMessageIdForPreview,
  getMessageKey,
  getPreviewTimestamp,
  resolveGroupIdForIncomingMessage,
  useChatGroups,
  useDebounceNavigation,
  useIsMobile,
  useLatestMessages,
  usePersistentStorage,
  useRouteIds,
  useTeamData,
  useUnseenChats,
  useWebSocket,
} from "@/hooks";
import { StorageKey } from "@/hooks/storage-data";
import { getCookie } from "@/lib/cookies";
import { isTeamMemberRemoved } from "@/utils/team/assignmentOrder";

export function useMessagesPage() {
  const queryClient = useQueryClient();
  const { navigateTo } = useDebounceNavigation();
  const { orgId: organizationId } = useRouteIds();
  const searchParams = useSearchParams();
  const { data: groups = [], addChatGroup } = useChatGroups();
  const {
    data: unseenChats,
    unseenMessagesQuery,
    seenMessagesMutation,
  } = useUnseenChats();
  const { data: teamMembers = [] } = useTeamData();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id ? Number(currentUser.id) : 1;
  const storage = usePersistentStorage();

  // Read initial state from query params
  const initialTab = searchParams.get("tab") || "groups";
  const initialGroupId = searchParams.get("group_id")
    ? Number(searchParams.get("group_id"))
    : null;
  const initialMemberId = searchParams.get("member_id")
    ? Number(searchParams.get("member_id"))
    : null;

  const {
    tab,
    selectedId,
    selectedDirectMemberId,
    addGroupOpen,
    page,
    hasMore,
    setTab,
    setSelectedId,
    setSelectedDirectMemberId,
    setAddGroupOpen,
    setPage,
    setHasMore,
  } = useMessagesPageUi();

  useEffect(() => {
    setTab(initialTab);
    setSelectedId(initialTab === "groups" ? initialGroupId : null);
    setSelectedDirectMemberId(initialTab === "direct" ? initialMemberId : null);
  }, [
    initialGroupId,
    initialMemberId,
    initialTab,
    setSelectedDirectMemberId,
    setSelectedId,
    setTab,
  ]);

  const selectedConversation = groups.find((c) => c.id === selectedId);
  const selectedMember = teamMembers.find(
    (m) => m.id === selectedDirectMemberId
  );

  // Pagination state lives in messages-page-store; message list stays local for WS merges.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [optimisticLatestByGroup, setOptimisticLatestByGroup] = useState<
    Record<number, ChatMessage>
  >({});
  const loadingRef = useRef(false);

  // Create an ID for the active conversation for dependency tracking
  const activeConversationId = useMemo(() => {
    if (tab === "groups" && selectedId) {
      return `group-${selectedId}`;
    } else if (tab === "direct" && selectedDirectMemberId) {
      const privateGroup = groups.find(
        (g) =>
          g.is_private &&
          g.members &&
          g.members.length === 2 &&
          g.members.includes(selectedDirectMemberId) &&
          g.members.includes(currentUserId)
      );
      return privateGroup
        ? `direct-group-${privateGroup.id}-member-${selectedDirectMemberId}`
        : `direct-member-${selectedDirectMemberId}`;
    }
    return null;
  }, [tab, selectedId, selectedDirectMemberId, groups, currentUserId]);

  // WebSocket URL for the selected group or direct message
  const wsUrl = useMemo(() => {
    const token =
      typeof window !== "undefined"
        ? getCookie(StorageKey.ACCESS_TOKEN)?.replace("JWT ", "")
        : null;
    if (!organizationId || !token) return "";

    if (tab === "groups" && selectedId) {
      // Group chat WebSocket
      return `${WS_URL}ws/chat/${organizationId}/?group_id=${selectedId}&token=${token}`;
    } else if (tab === "direct" && selectedDirectMemberId) {
      // Find if there's an existing private group for this direct message
      const privateGroup = groups.find(
        (g) =>
          g.is_private &&
          g.members &&
          g.members.length === 2 &&
          g.members.includes(selectedDirectMemberId) &&
          g.members.includes(currentUserId)
      );

      // Direct message WebSocket - use group_id if available, otherwise just other_member
      if (privateGroup) {
        return `${WS_URL}ws/chat/${organizationId}/?group_id=${
          privateGroup.id
        }&private_chat=true&other_member=${selectedDirectMemberId}&token=${token}`;
      } else {
        return `${WS_URL}ws/chat/${organizationId}/?private_chat=true&other_member=${selectedDirectMemberId}&token=${token}`;
      }
    }

    return "";
  }, [
    tab,
    selectedId,
    selectedDirectMemberId,
    groups,
    currentUserId,
    organizationId,
  ]);

  // User object for WebSocket
  const user = useMemo(
    () => ({
      id: currentUserId,
      username: currentUser?.username || "Me",
    }),
    [currentUserId, currentUser?.username]
  );

  // Reset state immediately when switching conversations
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    loadingRef.current = false;
  }, [activeConversationId, setHasMore, setPage]);

  // Connect to WebSocket with a key that changes when the conversation changes
  const {
    messages: wsMessages,
    sendMessage,
    isTyping,
    usersTyping,
  } = useWebSocket(wsUrl, user, activeConversationId);

  // Fetch messages for the selected group or direct message
  useEffect(() => {
    if (!activeConversationId || loadingRef.current) return;
    if (!organizationId) return;

    let url;
    if (tab === "groups" && selectedId) {
      // Group chat URL
      url = `${API_URL}chat/${organizationId}/groupmessages/?group_id=${selectedId}&page=1`;
    } else if (tab === "direct" && selectedDirectMemberId) {
      // Find if there's an existing private group for this direct message
      const privateGroup = groups.find(
        (g) =>
          g.is_private &&
          g.members &&
          g.members.length === 2 &&
          g.members.includes(selectedDirectMemberId)
      );

      // For HTTP requests, we only use group_id
      if (privateGroup) {
        url = `${API_URL}chat/${organizationId}/groupmessages/?group_id=${
          privateGroup.id
        }&page=1`;
      } else {
        // If no private group exists, we should create one first
        // This is handled by the backend when the first message is sent
        return;
      }
    } else {
      return;
    }

    loadingRef.current = true;
    fetch(url, {
      headers: {
        Authorization: `JWT ${getCookie(StorageKey.ACCESS_TOKEN)?.replace(
          /^JWT\s*/,
          ""
        )}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Reverse the fetched messages (API returns newest first)
        const initialMessages = Array.isArray(data.results)
          ? [...data.results].reverse()
          : [];
        setMessages(initialMessages);
        setHasMore(!!data.next);
        loadingRef.current = false;
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
        loadingRef.current = false;
      });
  }, [
    activeConversationId,
    tab,
    selectedId,
    selectedDirectMemberId,
    groups,
    currentUserId,
    storage,
    organizationId,
    setHasMore,
  ]);

  // Add new WebSocket messages to our message list
  useEffect(() => {
    if (!wsMessages?.length) return;

    const prevMessages = messagesRef.current;
    const existingIds = new Set(
      prevMessages.map(getMessageKey).filter(Boolean)
    );

    const newMessages = wsMessages.filter((msg) => {
      const key = getMessageKey(msg);
      return key && !existingIds.has(key);
    });

    if (!newMessages.length) return;

    const normalizedNewMsgs = newMessages.map((msg) => {
      const resolvedGroupId = resolveGroupIdForIncomingMessage(msg, {
        tab,
        selectedId,
        selectedDirectMemberId,
        groups,
        currentUserId,
      });

      return {
        ...msg,
        ...(resolvedGroupId != null && getMessageGroupId(msg) == null
          ? { group_id: resolvedGroupId }
          : {}),
        ...(msg?.created_at || msg?.timestamp || msg?.time
          ? {}
          : { timestamp: new Date().toISOString() }),
      } as ChatMessage;
    });

    queryClient.invalidateQueries({ queryKey: ["latestMessages"] });

    // group_id is already patched onto each normalized message — no need to
    // call resolveGroupIdForIncomingMessage a second time here
    setOptimisticLatestByGroup((prev) => {
      const updates = Object.fromEntries(
        normalizedNewMsgs
          .map((msg) => [getMessageGroupId(msg), msg] as const)
          .filter(([gid]) => gid != null)
      );
      return { ...prev, ...updates };
    });

    setMessages((p) => [...p, ...normalizedNewMsgs]);

    unseenMessagesQuery.refetch().then(({ data }) => {
      let groupId = null;
      if (tab === "groups" && selectedId) groupId = selectedId;
      if (tab === "direct" && selectedDirectMemberId) {
        const privateGroup = groups.find(
          (g) =>
            g.is_private &&
            g.members &&
            g.members.length === 2 &&
            g.members.includes(selectedDirectMemberId)
        );
        if (privateGroup) groupId = privateGroup.id;
      }
      if (!groupId) return;
      const messageIds = data.unseen_messages[groupId] || [];
      if (messageIds.length > 0) {
        seenMessagesMutation.mutate({ message_ids: messageIds });
      }
    });
  }, [
    wsMessages,
    activeConversationId,
    tab,
    selectedId,
    selectedDirectMemberId,
    groups,
    unseenMessagesQuery,
    seenMessagesMutation,
    queryClient,
    currentUserId,
  ]);

  // Handle infinite scroll for loading more messages
  const handleLoadMore = async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;

    if (!organizationId) return;

    let url;
    if (tab === "groups" && selectedId) {
      url = `${API_URL}chat/${organizationId}/groupmessages/?group_id=${selectedId}&page=${
        page + 1
      }`;
    } else if (tab === "direct" && selectedDirectMemberId) {
      const privateGroup = groups.find(
        (g) =>
          g.is_private &&
          g.members &&
          g.members.length === 2 &&
          g.members.includes(selectedDirectMemberId) &&
          g.members.includes(currentUserId)
      );

      // For HTTP requests, we only use group_id
      if (privateGroup) {
        url = `${API_URL}chat/${organizationId}/groupmessages/?group_id=${
          privateGroup.id
        }&page=${page + 1}`;
      } else {
        // If no private group exists, we can't load more messages
        loadingRef.current = false;
        return;
      }
    } else {
      loadingRef.current = false;
      return;
    }

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `JWT ${getCookie(StorageKey.ACCESS_TOKEN)?.replace(
            /^JWT\s*/,
            ""
          )}`,
        },
      });
      const data = await res.json();

      if (Array.isArray(data.results) && data.results.length > 0) {
        const olderMessages = [...data.results].reverse();
        setMessages((prev) => [...olderMessages, ...prev]);
        setPage(page + 1);
        setHasMore(!!data.next);
      } else {
        setHasMore(false);
      }
    } catch (error: unknown) {
      console.error("Error loading more messages:", error);
    } finally {
      loadingRef.current = false;
    }
  };

  // When tab changes, update the URL and reset selections
  const handleTabChange = (value: string) => {
    setTab(value);
    if (value === "groups") {
      setSelectedDirectMemberId(null);
      navigateTo(`?tab=groups`);
    } else {
      setSelectedId(null);
      navigateTo(`?tab=direct`);
    }
  };

  // When a group is selected, update the URL and refresh state
  const handleSelectGroup = (groupId: number) => {
    setSelectedId(groupId);
    setSelectedDirectMemberId(null);
    navigateTo(`?tab=groups&group_id=${groupId}`);
  };

  // When a direct message is selected, update the URL and refresh state
  const handleSelectDirectMember = (memberId: number) => {
    setSelectedDirectMemberId(memberId);
    setSelectedId(null);
    navigateTo(`?tab=direct&member_id=${memberId}`);
  };

  // Create a conversation object for direct messages to pass to ChatWindow
  const directMessageConversation = useMemo((): Conversation | undefined => {
    if (!selectedMember || selectedDirectMemberId == null) return undefined;
    const privateGroup = groups.find(
      (g) =>
        g.is_private &&
        g.members &&
        g.members.length === 2 &&
        g.members.includes(selectedDirectMemberId) &&
        g.members.includes(currentUserId)
    );
    return {
      id: privateGroup ? privateGroup.id : selectedMember.id,
      name: selectedMember.user?.username || "",
      is_private: true,
    };
  }, [selectedMember, groups, selectedDirectMemberId, currentUserId]);

  // The active conversation is either a group or direct message
  const activeConversation: Conversation | undefined =
    tab === "groups" ? selectedConversation : directMessageConversation;

  // Handle group creation
  const handleCreateGroup = (group: { name: string; members: string[] }) => {
    addChatGroup.mutate({
      group_name: group.name,
      group_description: "", // Add description if needed
      group_image: null, // Add image if needed
      is_private: false,
      members: group.members.map(Number),
    });
  };

  const { data: latestMessages = {} } = useLatestMessages(groups);

  useEffect(() => {
    setOptimisticLatestByGroup((prev) => {
      if (Object.keys(prev).length === 0) return prev;

      const next = Object.fromEntries(
        Object.entries(prev).filter(([key, opt]) => {
          const server = latestMessages[Number(key)];
          if (!server) return true; // server hasn't fetched this group yet — keep

          const optId = getMessageIdForPreview(opt);
          const srvId = getMessageIdForPreview(server);
          // Same message confirmed by server — safe to drop the optimistic copy
          if (optId != null && srvId != null && String(optId) === String(srvId))
            return false;

          const optTs = getPreviewTimestamp(opt);
          // No timestamp on WS message — keep it to avoid overwriting a fresh
          // optimistic update with potentially stale server data
          if (optTs === 0) return true;

          // Server has caught up or gone ahead — let server data take over
          return getPreviewTimestamp(server) < optTs;
        })
      );

      // Since we only ever remove entries here, key-count diff is sufficient
      return Object.keys(next).length === Object.keys(prev).length
        ? prev
        : next;
    });
  }, [latestMessages]);

  const activeGroupIdForLatest = useMemo(() => {
    if (tab === "groups" && selectedId) return selectedId;
    if (tab === "direct" && selectedDirectMemberId) {
      const privateGroupStrict = groups.find(
        (g) =>
          g.is_private &&
          g.members &&
          g.members.length === 2 &&
          g.members.includes(selectedDirectMemberId) &&
          g.members.includes(currentUserId)
      );
      const privateGroupFallback = groups.find(
        (g) =>
          g.is_private &&
          g.members &&
          g.members.length === 2 &&
          g.members.includes(selectedDirectMemberId)
      );
      const privateGroup = privateGroupStrict ?? privateGroupFallback;
      return privateGroup?.id ?? null;
    }
    return null;
  }, [tab, selectedId, selectedDirectMemberId, groups, currentUserId]);

  const mergedLatestMessages = useMemo(() => {
    const merged = {
      ...latestMessages,
      ...optimisticLatestByGroup,
    } as Record<number, ChatMessage>;
    if (activeGroupIdForLatest && messages.length > 0) {
      const latestFromThread = messages[messages.length - 1];
      const latestMessageGroupId = getMessageGroupId(latestFromThread);
      const shouldMergeDirectWithoutGroupId =
        tab === "direct" &&
        !!selectedDirectMemberId &&
        latestMessageGroupId === null;
      const shouldMerge =
        !!latestFromThread &&
        (latestMessageGroupId === activeGroupIdForLatest ||
          shouldMergeDirectWithoutGroupId);
      if (shouldMerge) {
        merged[activeGroupIdForLatest] = latestFromThread;
      }
    }
    return merged;
  }, [
    latestMessages,
    optimisticLatestByGroup,
    activeGroupIdForLatest,
    messages,
    tab,
    selectedDirectMemberId,
  ]);

  // Mark all unseen messages as seen when entering a chat
  useEffect(() => {
    // Fetch unseen messages and mark as seen for this group
    unseenMessagesQuery.refetch().then(({ data }) => {
      let groupId = null;
      if (tab === "groups" && selectedId) groupId = selectedId;
      if (tab === "direct" && selectedDirectMemberId) {
        const privateGroup = groups.find(
          (g) =>
            g.is_private &&
            g.members &&
            g.members.length === 2 &&
            g.members.includes(selectedDirectMemberId)
        );
        if (privateGroup) groupId = privateGroup.id;
      }
      if (!groupId) return;
      const messageIds = data.unseen_messages[groupId] || [];
      if (messageIds.length > 0) {
        seenMessagesMutation.mutate({ message_ids: messageIds });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectMemberId]);

  const teamMembersWithoutCurrentUser = teamMembers.filter(
    (m) => m.user.id !== currentUserId && !isTeamMemberRemoved(m)
  );

  const isMobile = useIsMobile();
  // Mobile navigation state: show chat window or sidebar
  const [showMobileChat, setShowMobileChat] = useState(false);

  // When a chat is selected on mobile, show chat window
  useEffect(() => {
    if (isMobile) {
      if (
        (tab === "groups" && selectedId) ||
        (tab === "direct" && selectedDirectMemberId)
      ) {
        setShowMobileChat(true);
      } else {
        setShowMobileChat(false);
      }
    }
  }, [isMobile, tab, selectedId, selectedDirectMemberId]);

  // When back arrow is pressed on mobile, reset selection and show sidebar
  const handleMobileBack = () => {
    setShowMobileChat(false);
    setSelectedId(null);
    setSelectedDirectMemberId(null);
  };

  return {
    queryClient,
    navigateTo,
    organizationId,
    groups,
    addChatGroup,
    unseenChats,
    teamMembers,
    currentUser,
    currentUserId,
    tab,
    setTab,
    selectedId,
    setSelectedId,
    selectedDirectMemberId,
    setSelectedDirectMemberId,
    addGroupOpen,
    setAddGroupOpen,
    selectedConversation,
    selectedMember,
    page,
    setPage,
    hasMore,
    setHasMore,
    messages,
    setMessages,
    optimisticLatestByGroup,
    setOptimisticLatestByGroup,
    activeConversationId,
    activeConversation,
    mergedLatestMessages,
    teamMembersWithoutCurrentUser,
    usersTyping,
    showMobileChat,
    setShowMobileChat,
    isMobile,
    handleSelectGroup,
    handleSelectDirectMember,
    handleTabChange,
    handleCreateGroup,
    handleLoadMore,
    sendMessage,
    isTyping,
    handleMobileBack,
  };
}
