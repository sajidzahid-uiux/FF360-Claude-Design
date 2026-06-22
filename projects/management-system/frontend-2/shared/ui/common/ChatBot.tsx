"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  cn,
  getAccentTextColor,
  useTheme,
} from "@fieldflow360/org-ui";
import {
  BotMessageSquare,
  HelpCircle,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import { useIsMobile } from "@/hooks";
import { CMS_BRAND_DEFAULT_ACCENT_HEX } from "@/lib/cms-theme";
import { useChatBotUi as useChatBot } from "@/shared/model/chat-bot-store";
import { Badge } from "@/shared/ui/primitives";

const DEFAULT_ACCENT = CMS_BRAND_DEFAULT_ACCENT_HEX;

const FAB_SIZE_PX = 56;
const FAB_SIZE_MOBILE_PX = 52;
const VIEWPORT_INSET_PX = 56;
const VIEWPORT_INSET_MOBILE_PX = 32;
const PANEL_GAP_PX = 12;

function getChatLayout(isMobile: boolean) {
  const inset = isMobile ? VIEWPORT_INSET_MOBILE_PX : VIEWPORT_INSET_PX;
  const fabSize = isMobile ? FAB_SIZE_MOBILE_PX : FAB_SIZE_PX;

  return {
    inset,
    fabSize,
    panelBottom: inset + fabSize + PANEL_GAP_PX,
  };
}

const ChatBotLauncher = () => {
  const { isOpen, toggleChat, unreadCount } = useChatBot();
  const { isAuthenticated } = useAuth0();
  const isMobile = useIsMobile();
  const { accentColor } = useTheme();
  const onAccentForeground = getAccentTextColor(accentColor || DEFAULT_ACCENT);
  const { inset, fabSize } = getChatLayout(isMobile);

  if (!isAuthenticated) return null;

  const showCloseState = isOpen;

  return (
    <div
      className="pointer-events-none fixed z-[60]"
      style={{
        right: inset,
        bottom: inset,
        width: fabSize,
        height: fabSize,
      }}
    >
      <div className="pointer-events-auto relative size-full">
        <button
          data-chat-icon
          aria-expanded={isOpen}
          aria-label={showCloseState ? "Close Assist IQ" : "Open Assist IQ"}
          className={cn(
            "bg-accent flex size-full items-center justify-center rounded-full",
            "shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-black/5",
            "transition-all duration-200 ease-out",
            "hover:scale-[1.04] hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)]",
            "active:scale-[0.98]",
            "dark:shadow-black/40 dark:ring-white/10",
            "night:shadow-black/50 night:ring-white/15",
            unreadCount > 0 && !isOpen && "animate-pulse"
          )}
          type="button"
          onClick={toggleChat}
        >
          {showCloseState ? (
            <X
              aria-hidden
              className={isMobile ? "size-5" : "size-6"}
              style={{ color: onAccentForeground }}
            />
          ) : (
            <MessageCircle
              aria-hidden
              className={isMobile ? "size-6" : "size-7"}
              style={{ color: onAccentForeground }}
            />
          )}
        </button>
        {unreadCount > 0 && !isOpen ? (
          <Badge
            className={cn(
              "bg-feedback-error text-text-inverse border-bg-surface-elevated absolute flex items-center justify-center rounded-full border-2 font-semibold shadow-sm",
              isMobile
                ? "-top-0.5 -right-0.5 min-h-5 min-w-5 px-1 text-[10px]"
                : "-top-1 -right-1 min-h-6 min-w-6 px-1.5 text-xs"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        ) : null}
      </div>
    </div>
  );
};

const ChatWindow = () => {
  const { isOpen, messages, isLoading, sendMessage, toggleChat } = useChatBot();
  const [inputValue, setInputValue] = useState("");
  const [showHelpDescription, setShowHelpDescription] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { accentColor } = useTheme();
  const onAccentForeground = getAccentTextColor(accentColor || DEFAULT_ACCENT);
  const { panelBottom } = getChatLayout(isMobile);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showHelpDescription) {
        setShowHelpDescription(false);
      }

      if (isOpen) {
        const target = event.target as Element;
        const chatWindow = document.querySelector("[data-chat-window]");
        const chatIcon = document.querySelector("[data-chat-icon]");

        if (
          chatWindow &&
          !chatWindow.contains(target) &&
          chatIcon &&
          !chatIcon.contains(target)
        ) {
          toggleChat();
        }
      }
    };

    if (showHelpDescription || isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showHelpDescription, isOpen, toggleChat]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-chat-window
      className={cn(
        "fixed z-[59] flex flex-col overflow-hidden rounded-2xl",
        "bg-bg-surface-elevated/95 border-border-subtle border backdrop-blur-md",
        "shadow-[0_20px_60px_rgb(0,0,0,0.15)]",
        "night:shadow-black/60 dark:shadow-black/50",
        "animate-in fade-in slide-in-from-bottom-3 duration-200",
        isMobile
          ? "right-4 left-4 max-w-none"
          : "right-6 w-[min(24rem,calc(100vw-3rem))]"
      )}
      style={{
        bottom: panelBottom,
        height: isMobile ? "min(70vh, 520px)" : 520,
      }}
    >
      <header className="border-border-subtle bg-bg-surface/80 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-accent/15 flex size-10 shrink-0 items-center justify-center rounded-full">
            <BotMessageSquare className="text-accent size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-text-primary truncate text-sm font-semibold">
              Assist IQ
            </p>
            <p className="text-text-muted truncate text-xs">
              Platform help & guidance
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="relative">
            <Button
              iconOnly
              aria-label="Help"
              leftIcon={<HelpCircle className="size-4" />}
              size={ComponentSizeEnum.SM}
              variant={ButtonVariantEnum.GHOST}
              onClick={() => setShowHelpDescription(!showHelpDescription)}
            />
            {showHelpDescription ? (
              <div
                className={cn(
                  "bg-bg-surface-elevated border-border-subtle absolute top-full z-50 mt-2 rounded-xl border p-3 shadow-lg",
                  isMobile ? "right-0 w-64" : "right-0 w-72"
                )}
              >
                <p className="text-text-primary mb-1 text-sm font-semibold">
                  Need help?
                </p>
                <p className="text-text-muted text-xs leading-relaxed">
                  Ask about tools, workflows, or how to complete tasks in the
                  platform.
                </p>
              </div>
            ) : null}
          </div>
          <Button
            iconOnly
            aria-label="Close chat"
            leftIcon={<X className="size-4" />}
            size={ComponentSizeEnum.SM}
            variant={ButtonVariantEnum.GHOST}
            onClick={toggleChat}
          />
        </div>
      </header>

      <div
        ref={messagesContainerRef}
        className="bg-bg-app/40 min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
                message.isUser
                  ? "bg-accent rounded-br-md"
                  : "bg-bg-surface text-text-primary border-border-subtle/70 rounded-bl-md border"
              )}
              style={message.isUser ? { color: onAccentForeground } : undefined}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="bg-bg-surface border-border-subtle/70 text-text-muted rounded-2xl rounded-bl-md border px-3.5 py-2.5">
              <div className="flex gap-1">
                <span className="bg-text-muted size-1.5 animate-bounce rounded-full" />
                <span
                  className="bg-text-muted size-1.5 animate-bounce rounded-full"
                  style={{ animationDelay: "0.12s" }}
                />
                <span
                  className="bg-text-muted size-1.5 animate-bounce rounded-full"
                  style={{ animationDelay: "0.24s" }}
                />
              </div>
            </div>
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>

      <footer className="border-border-subtle bg-bg-surface-elevated/90 shrink-0 border-t p-3">
        <div className="flex items-end gap-2">
          <Input
            ref={inputRef}
            className="min-w-0 flex-1"
            disabled={isLoading}
            placeholder="Type your message..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyPress}
          />
          <Button
            iconOnly
            aria-label="Send message"
            disabled={!inputValue.trim() || isLoading}
            leftIcon={<Send className="size-4" />}
            size={ComponentSizeEnum.MD}
            variant={ButtonVariantEnum.ACCENT}
            onClick={handleSend}
          />
        </div>
      </footer>
    </div>
  );
};

const ChatBot = () => {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) return null;

  return (
    <>
      <ChatWindow />
      <ChatBotLauncher />
    </>
  );
};

export default ChatBot;
