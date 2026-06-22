"use client";

import { FC, ReactNode, useEffect, useRef } from "react";

import { useChatBotWebSocket } from "@/hooks";
import {
  type ChatBotMessage,
  useChatBotActions,
  useChatBotStore,
  useChatBotUi,
} from "@/shared/model/chat-bot-store";

export const useChatBot = () => useChatBotUi();

export const ChatBotSync: FC<{ children: ReactNode }> = ({ children }) => {
  const {
    appendMessage,
    replaceMessage,
    incrementUnread,
    setIsLoading,
    setSendMessage,
  } = useChatBotActions();
  const currentStreamingMessageRef = useRef<ChatBotMessage | null>(null);
  const isOpenRef = useRef(false);
  const { sendChatBotMessage, isLoading } = useChatBotWebSocket();

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);

  useEffect(() => {
    return useChatBotStore.subscribe((state) => {
      isOpenRef.current = state.isOpen;
    });
  }, []);

  useEffect(() => {
    const sendMessage = async (text: string) => {
      if (!text.trim()) return;

      appendMessage({
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: new Date(),
      });

      await sendChatBotMessage(
        text,
        (botMessage) => {
          appendMessage({
            id: botMessage.id,
            text: botMessage.text,
            isUser: false,
            timestamp: botMessage.timestamp,
          });

          if (!isOpenRef.current) {
            incrementUnread();
          }
        },
        (errorMessage) => {
          const currentMessage = currentStreamingMessageRef.current;
          if (currentMessage) {
            replaceMessage(currentMessage.id, {
              id: errorMessage.id,
              text: errorMessage.text,
              isUser: false,
              timestamp: errorMessage.timestamp,
            });
          } else {
            appendMessage({
              id: errorMessage.id,
              text: errorMessage.text,
              isUser: false,
              timestamp: errorMessage.timestamp,
            });
          }
          currentStreamingMessageRef.current = null;

          if (!isOpenRef.current) {
            incrementUnread();
          }
        },
        () => {
          currentStreamingMessageRef.current = null;
        }
      );
    };

    setSendMessage(sendMessage);
  }, [
    appendMessage,
    incrementUnread,
    replaceMessage,
    sendChatBotMessage,
    setSendMessage,
  ]);

  return <>{children}</>;
};
