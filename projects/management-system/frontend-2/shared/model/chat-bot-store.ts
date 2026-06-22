"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export interface ChatBotMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const DEFAULT_GREETING: ChatBotMessage = {
  id: "1",
  text: "Hi, how can I help you today?",
  isUser: false,
  timestamp: new Date(),
};

interface ChatBotStore {
  isOpen: boolean;
  messages: ChatBotMessage[];
  unreadCount: number;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  toggleChat: () => void;
  setIsOpen: (isOpen: boolean) => void;
  appendMessage: (message: ChatBotMessage) => void;
  replaceMessage: (id: string, message: ChatBotMessage) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setSendMessage: (sendMessage: (text: string) => Promise<void>) => void;
  clearMessages: () => void;
}

export const useChatBotStore = create<ChatBotStore>((set, get) => ({
  isOpen: false,
  messages: [DEFAULT_GREETING],
  unreadCount: 0,
  isLoading: false,
  sendMessage: async () => {},

  toggleChat: () => {
    const nextOpen = !get().isOpen;
    set({
      isOpen: nextOpen,
      unreadCount: nextOpen ? 0 : get().unreadCount,
    });
  },

  setIsOpen: (isOpen) => {
    set({
      isOpen,
      unreadCount: isOpen ? 0 : get().unreadCount,
    });
  },

  appendMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  replaceMessage: (id, message) => {
    set((state) => ({
      messages: state.messages.map((entry) =>
        entry.id === id ? message : entry
      ),
    }));
  },

  incrementUnread: () => {
    if (!get().isOpen) {
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
    }
  },

  clearUnread: () => {
    set({ unreadCount: 0 });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  setSendMessage: (sendMessage) => {
    set({ sendMessage });
  },

  clearMessages: () => {
    set({
      messages: [{ ...DEFAULT_GREETING, timestamp: new Date() }],
      unreadCount: 0,
    });
  },
}));

export function useChatBotUi() {
  return useChatBotStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      messages: state.messages,
      unreadCount: state.unreadCount,
      isLoading: state.isLoading,
      toggleChat: state.toggleChat,
      sendMessage: state.sendMessage,
      clearMessages: state.clearMessages,
    }))
  );
}

export function useChatBotActions() {
  return useChatBotStore(
    useShallow((state) => ({
      appendMessage: state.appendMessage,
      replaceMessage: state.replaceMessage,
      incrementUnread: state.incrementUnread,
      setIsLoading: state.setIsLoading,
      setIsOpen: state.setIsOpen,
      setSendMessage: state.setSendMessage,
    }))
  );
}
