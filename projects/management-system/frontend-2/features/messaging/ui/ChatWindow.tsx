import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Avatar, Button, ComponentSizeEnum, cn } from "@fieldflow360/org-ui";
import { ArrowDownCircle, FileIcon, MessageSquare } from "lucide-react";

import type { ChatMessage, ChatWindowProps } from "@/api/types/chat";
import { API_URL } from "@/constants";
import { useIsMobile } from "@/hooks";

// Helper to make file URLs absolute
const makeAbsoluteUrl = (url: string | undefined) => {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  return API_URL.replace(/\/$/, "") + url;
};

// Helper to determine file type from URL
const getFileType = (url: string): "image" | "audio" | "file" => {
  // Extract pathname from URL (removes query parameters)
  let pathname;
  try {
    pathname = new URL(url).pathname.toLowerCase();
  } catch {
    // If URL parsing fails, fall back to the original string
    pathname = url.toLowerCase();
  }

  if (pathname.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
  if (pathname.match(/\.(mp3|wav|ogg|m4a)$/)) return "audio";
  return "file";
};

// Helper to format the time shown inside a message bubble
const formatTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to label a day separator (Today / Yesterday / explicit date)
const formatDayLabel = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getAuthorObject = (author: ChatMessage["author"]) => {
  if (!author || typeof author === "string") return undefined;
  return author;
};

const getAuthorInitial = (author: ChatMessage["author"]) => {
  if (!author) return undefined;
  if (typeof author === "string") return author[0];
  return author.user?.username?.[0] || author.username?.[0];
};

export default function ChatWindow({
  conversation,
  messages,
  usersTyping,
  onLoadMore,
  currentUser,
}: ChatWindowProps) {
  const safeMessages = useMemo(
    () => (Array.isArray(messages) ? messages : []),
    [messages]
  );
  // Filter typing users to exclude the current user
  const typingUsers = (usersTyping || []).filter((name) => {
    if (!currentUser) return name !== "Me";
    return name !== "Me" && name !== currentUser.username;
  });

  // Conversation ID for dependency tracking
  const conversationId = conversation?.id;

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const prevMessagesLengthRef = useRef(safeMessages.length);
  const initialScrollDoneRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  // States
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasUserScrolledUp, setHasUserScrolledUp] = useState(false);

  const isMobile = useIsMobile();

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
        setShowScrollButton(false);
        setHasUserScrolledUp(false);
      }
    });
  }, []);

  // Check if user is near bottom (for auto-scrolling)
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return true;
    const container = containerRef.current;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < 200; // Back to original threshold for button visibility
  }, []);

  // Check if user should see the scroll button (more sensitive)
  const shouldShowScrollButton = useCallback(() => {
    if (!containerRef.current) return false;
    const container = containerRef.current;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom > 100; // Show button when more than 100px from bottom
  }, []);

  // Reset all state when conversation changes
  useEffect(() => {
    // Clear everything when conversation changes
    initialScrollDoneRef.current = false;
    setHasUserScrolledUp(false);
    prevMessagesLengthRef.current = 0;
    setShowScrollButton(false);

    // Force a scroll to bottom on next render
    if (containerRef.current && safeMessages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [conversationId, scrollToBottom, safeMessages.length]);

  // Force initial scroll to bottom on first render and when conversation changes
  useEffect(() => {
    if (
      safeMessages.length > 0 &&
      containerRef.current &&
      !initialScrollDoneRef.current
    ) {
      // Use a delay to ensure DOM is fully rendered
      const timerId = setTimeout(() => {
        scrollToBottom();
        initialScrollDoneRef.current = true;
      }, 100);

      return () => clearTimeout(timerId);
    }
  }, [safeMessages, scrollToBottom]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !initialScrollDoneRef.current) return;
    const container = containerRef.current;

    // Check if user has scrolled up
    if (!isNearBottom()) {
      setHasUserScrolledUp(true);
    } else {
      setHasUserScrolledUp(false);
    }

    // Show scroll button when user is not near bottom
    const shouldShow = shouldShowScrollButton();
    setShowScrollButton(shouldShow);

    // Load more messages when scrolling to top
    if (container.scrollTop < 50 && onLoadMore && !isLoadingRef.current) {
      isLoadingRef.current = true;

      // Before loading more, save critical scroll state
      prevScrollHeightRef.current = container.scrollHeight;

      // Load more messages
      onLoadMore().finally(() => {
        // After loading completes, use RAF to ensure DOM has updated
        requestAnimationFrame(() => {
          if (containerRef.current) {
            // Calculate how much new content was added
            const newScrollHeight = containerRef.current.scrollHeight;
            const heightDifference =
              newScrollHeight - prevScrollHeightRef.current;

            // Adjust scroll to keep same content in view
            // Only adjust if the difference is significant and user is still near top
            if (heightDifference > 10 && containerRef.current.scrollTop < 100) {
              containerRef.current.scrollTop = heightDifference;
            }
          }
          isLoadingRef.current = false;
        });
      });
    }
  }, [isNearBottom, shouldShowScrollButton, onLoadMore]);

  // Attach scroll event listener with throttling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", throttledHandleScroll);
    return () => container.removeEventListener("scroll", throttledHandleScroll);
  }, [handleScroll]);

  // Handle message updates (new messages)
  useEffect(() => {
    // Skip if no container or no messages
    if (!containerRef.current || safeMessages.length === 0) return;

    // Skip the effect if no changes in message count
    if (safeMessages.length === prevMessagesLengthRef.current) return;

    // Skip if this is loading more old messages at the top
    if (
      safeMessages.length > prevMessagesLengthRef.current &&
      isLoadingRef.current
    ) {
      // Do nothing - the scroll is handled in the onLoadMore callback
    }
    // If new messages arrived and user is near bottom or hasn't scrolled up
    else if (
      safeMessages.length > prevMessagesLengthRef.current &&
      (isNearBottom() || !hasUserScrolledUp)
    ) {
      // Only auto-scroll if user is actually near bottom
      if (isNearBottom()) {
        scrollToBottom();
      }
    }

    // Update scroll button state when messages change
    if (containerRef.current) {
      setShowScrollButton(shouldShowScrollButton());
    }

    // Update the previous message count
    prevMessagesLengthRef.current = safeMessages.length;
  }, [
    safeMessages.length,
    isNearBottom,
    scrollToBottom,
    hasUserScrolledUp,
    shouldShowScrollButton,
  ]);

  // Render message content based on type
  const renderMessageContent = (msg: ChatMessage) => {
    const fileUrl = msg.file_url;

    if (!fileUrl) {
      return (
        <div className="font-regular overflow-wrap-anywhere max-w-full text-base break-words break-all whitespace-pre-line">
          {msg.text || msg.body}
        </div>
      );
    }

    const absoluteUrl = makeAbsoluteUrl(fileUrl);
    const fileType = getFileType(fileUrl);

    switch (fileType) {
      case "image":
        return (
          <div className="space-y-2">
            {(msg.text || msg.body) && (
              <div className="overflow-wrap-anywhere max-w-full text-sm break-words break-all whitespace-pre-line">
                {msg.text || msg.body}
              </div>
            )}
            <img
              alt="Shared image"
              className="max-h-[300px] max-w-full rounded-lg object-contain"
              src={absoluteUrl}
            />
          </div>
        );
      case "audio":
        return (
          <div className="space-y-2">
            {(msg.text || msg.body) && (
              <div className="overflow-wrap-anywhere max-w-full text-sm break-words break-all whitespace-pre-line">
                {msg.text || msg.body}
              </div>
            )}
            <audio controls className="w-full max-w-[300px]" src={absoluteUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case "file":
        return (
          <div className="space-y-2">
            {(msg.text || msg.body) && (
              <div className="overflow-wrap-anywhere max-w-full text-sm break-words break-all whitespace-pre-line">
                {msg.text || msg.body}
              </div>
            )}
            <a
              className="bg-bg-surface border-border-subtle hover:bg-bg-hover flex items-center gap-3 rounded-lg border p-3 text-sm text-blue-500 transition-colors hover:text-blue-600"
              href={absoluteUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <FileIcon className="h-6 w-6 flex-shrink-0" />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="truncate font-medium">
                  {fileUrl.split("/").pop()?.split("?")[0] || "Download file"}
                </div>
                <div className="text-text-muted text-xs">Click to open</div>
              </div>
            </a>
          </div>
        );
    }
  };

  // Helper to check if a message is from the current user
  const isFromCurrentUser = useCallback(
    (msg: ChatMessage) => {
      if (!currentUser) return false;

      // Special case for messages sent via WebSocket which might have different structure
      if (msg.event === "new_message") {
        return (
          msg.author === currentUser.username ||
          msg.author === currentUser.nickname ||
          msg.author === currentUser.email
        );
      }
      // Check all possible ways a message could be identified as from the current user
      const authorObj = getAuthorObject(msg.author);
      return authorObj?.user?.id === currentUser.id;
    },
    [currentUser]
  );

  const getSenderName = useCallback(
    (msg: ChatMessage): string => {
      if (isFromCurrentUser(msg)) return "You";

      return (
        msg?.from ||
        getAuthorObject(msg.author)?.user?.username ||
        getAuthorObject(msg.author)?.username ||
        (typeof msg.author === "string" ? msg.author : undefined) ||
        "Unknown user"
      );
    },
    [isFromCurrentUser]
  );

  // Shared message list renderer (presentational) used by both layouts.
  const renderMessageList = () => {
    let lastDayKey = "";
    return safeMessages.map((msg, idx) => {
      const rawDate = msg.created_at || msg.timestamp || "";
      const dayKey = rawDate ? new Date(rawDate).toDateString() : "";
      const showDaySeparator = Boolean(dayKey) && dayKey !== lastDayKey;
      if (showDaySeparator) lastDayKey = dayKey;
      const mine = isFromCurrentUser(msg);
      const showSenderName = !mine && !conversation?.is_private;
      const timeLabel =
        msg.time ||
        (msg.created_at ? formatTime(msg.created_at) : "") ||
        (msg.timestamp ? formatTime(msg.timestamp) : "") ||
        "";

      return (
        <Fragment key={`${conversationId}-${msg.id || msg.timestamp || idx}`}>
          {showDaySeparator && (
            <div className="my-2 flex items-center justify-center">
              <span className="bg-bg-surface text-text-muted rounded-full px-3 py-1 text-[11px] font-medium">
                {formatDayLabel(rawDate)}
              </span>
            </div>
          )}
          <div
            className={mine ? "flex justify-end" : "flex justify-start"}
            id={`message-${msg.id || msg.created_at || msg.timestamp || idx}`}
          >
            <div
              className={cn(
                "flex max-w-[78%] gap-2 sm:max-w-[65%]",
                mine ? "flex-row-reverse" : "flex-row"
              )}
            >
              {!mine && (
                <Avatar
                  alt={getSenderName(msg)}
                  className="mt-auto shrink-0"
                  fallback={msg.from?.[0] || getAuthorInitial(msg.author) || "U"}
                  size="sm"
                />
              )}
              <div
                className={cn(
                  "flex min-w-0 flex-col gap-1",
                  mine ? "items-end" : "items-start"
                )}
              >
                {showSenderName && (
                  <span className="text-text-secondary px-1 text-xs font-semibold">
                    {getSenderName(msg)}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-full rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                    mine
                      ? "bg-accent text-text-inverse rounded-br-sm"
                      : "bg-bg-surface-elevated text-text-primary border-border-subtle/70 rounded-bl-sm border"
                  )}
                >
                  {renderMessageContent(msg)}
                  <div
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      mine ? "text-text-inverse/70" : "text-text-muted"
                    )}
                  >
                    {timeLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      );
    });
  };

  // Typing indicator with animated dots
  const typingIndicator = typingUsers.length > 0 && (
    <div className="flex items-center gap-2">
      <div className="bg-bg-surface-elevated border-border-subtle/70 flex items-center gap-1 rounded-2xl rounded-bl-sm border px-3.5 py-3">
        <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
        <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
        <span className="bg-text-muted h-1.5 w-1.5 animate-bounce rounded-full" />
      </div>
      <span className="text-text-muted text-xs italic">
        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
        typing…
      </span>
    </div>
  );

  // Empty state when a conversation has no messages
  const emptyState = (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div className="bg-bg-surface text-text-muted flex h-12 w-12 items-center justify-center rounded-full">
        <MessageSquare className="h-6 w-6" />
      </div>
      <p className="text-text-secondary text-sm font-medium">No messages yet</p>
      <p className="text-text-muted text-xs">
        Send a message to start the conversation.
      </p>
    </div>
  );

  if (isMobile) {
    // MOBILE: Only render the scrollable messages area, no input
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          key={`chat-container-${conversationId}`}
          ref={containerRef}
          className="bg-bg-app min-h-0 flex-1 overflow-y-auto p-4"
        >
          {safeMessages.length === 0 && typingUsers.length === 0 ? (
            emptyState
          ) : (
            <div className="flex min-h-full flex-col gap-3">
              {renderMessageList()}
              {typingIndicator}
            </div>
          )}
        </div>
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            iconOnly
            aria-label="Scroll to bottom"
            className="fixed right-0 bottom-[100px] z-10 -translate-x-1/2"
            leftIcon={<ArrowDownCircle className="h-5 w-5" />}
            size={ComponentSizeEnum.MD}
            style={{ pointerEvents: "auto" }}
            onClick={scrollToBottom}
          />
        )}
      </div>
    );
  }
  // DESKTOP: render as before (messages + input handled by parent)
  return (
    <div className="relative h-full flex-1">
      <div
        key={`chat-container-${conversationId}`}
        ref={containerRef}
        className="bg-bg-app absolute inset-0 overflow-y-auto p-8"
      >
        {safeMessages.length === 0 && typingUsers.length === 0 ? (
          emptyState
        ) : (
          <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-3">
            {renderMessageList()}
            {typingIndicator}
          </div>
        )}
      </div>
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          iconOnly
          aria-label="Scroll to bottom"
          className="absolute right-6 bottom-6 z-10"
          leftIcon={<ArrowDownCircle className="h-5 w-5" />}
          size={ComponentSizeEnum.MD}
          onClick={scrollToBottom}
        />
      )}
    </div>
  );
}
