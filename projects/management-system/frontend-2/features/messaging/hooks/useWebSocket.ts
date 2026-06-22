"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import type { WebSocketChatEvent } from "@/api/types";

interface Message {
  body: string;
  file_url?: string;
  file_path?: string;
}

interface ChatBotMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const useWebSocket = (
  url: string,
  user?: { id: number; username: string },
  resetKey: unknown = null
) => {
  const [messages, setMessages] = useState<WebSocketChatEvent[]>([]);
  const [usersTyping, setUsersTyping] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const websocketRef = useRef<WebSocket | null>(null);

  // Clear messages when dependencies change (conversation change)
  useEffect(() => {
    setMessages([]);
    setUsersTyping([]);
  }, [resetKey]);

  useEffect(() => {
    if (!url) {
      return;
    }

    // Close existing connection if any
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    const websocket = new WebSocket(url);
    websocketRef.current = websocket;

    websocket.onopen = () => {
      // Connection opened successfully
    };

    websocket.onmessage = (event) => {
      try {
        const parsedEvent = JSON.parse(event.data);

        if (parsedEvent.event === "new_message") {
          // Append new message instead of replacing all messages
          setMessages((prevMessages) => [...prevMessages, parsedEvent]);
        } else if (parsedEvent.event === "typing") {
          setUsersTyping((prevTyping) => {
            if (
              parsedEvent.is_typing &&
              !prevTyping.includes(parsedEvent.member_name)
            ) {
              return [...prevTyping, parsedEvent.member_name];
            } else if (!parsedEvent.is_typing) {
              return prevTyping.filter(
                (name) => name !== parsedEvent.member_name
              );
            }
            return prevTyping;
          });
        } else if (parsedEvent.event === "organization_online_list") {
          // For online members, we still add to messages array so OnlineMembersSync can process it
          setMessages((prevMessages) => [...prevMessages, parsedEvent]);
        } else {
          setMessages((prevMessages) => [...prevMessages, parsedEvent]);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    websocket.onerror = (error: Event) => {
      console.error("WebSocket Error:", error);
    };

    websocket.onclose = () => {
      // Connection closed
    };

    return () => {
      websocket.close();
    };
  }, [url]);

  const sendFileMessage = useCallback((message: Message, url: string) => {
    const messageEvent = {
      event: "file_message",
      body: message.body,
      file_path: url,
    };

    if (
      websocketRef.current &&
      websocketRef.current.readyState === WebSocket.OPEN
    ) {
      websocketRef.current.send(JSON.stringify(messageEvent));
    }
  }, []);

  const sendMessage = useCallback(
    (message: Message) => {
      if (message.file_path) {
        sendFileMessage(message, message.file_path);
        return;
      }

      const messageEvent = { body: message.body, event: "message" };

      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        websocketRef.current.send(JSON.stringify(messageEvent));
        queryClient.invalidateQueries({ queryKey: ["unseenChats"] });
      }
    },
    [queryClient, sendFileMessage]
  );

  const isTyping = useCallback(
    (is_typing: boolean) => {
      if (!user) {
        return;
      }

      const messageEvent = {
        event: "typing",
        member_id: user.id,
        member_name: user.username,
        is_typing: is_typing,
      };

      if (
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        websocketRef.current.send(JSON.stringify(messageEvent));
      }
    },
    [user]
  );

  return { messages, sendMessage, isTyping, sendFileMessage, usersTyping };
};

// New hook for chatbot WebSocket
export const useChatBotWebSocket = () => {
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const sendChatBotMessage = useCallback(
    async (
      text: string,
      onMessage: (message: ChatBotMessage) => void,
      onError: (message: ChatBotMessage) => void,
      onComplete?: () => void
    ) => {
      if (!text.trim()) return;

      setIsLoading(true);

      try {
        // Get WebSocket URL from environment or use fallback
        const baseUrl = "wss://api.dev.fieldflow360.com/";

        const wsUrl = baseUrl + "ws/rag/";

        if (!wsUrl) {
          throw new Error("WebSocket URL is not defined");
        }

        const ws = new WebSocket(wsUrl);

        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            const timeoutMessage: ChatBotMessage = {
              id: (Date.now() + 1).toString(),
              text: "Connection timeout. Please check if the chatbot service is running and try again.",
              isUser: false,
              timestamp: new Date(),
            };
            onError(timeoutMessage);
            setIsLoading(false);
          }
        }, 10000); // 10 second timeout

        // Add response timeout
        const responseTimeout = setTimeout(() => {
          if (isLoading) {
            ws.close();
            const timeoutMessage: ChatBotMessage = {
              id: (Date.now() + 1).toString(),
              text: "The chatbot is taking too long to respond. Please try again.",
              isUser: false,
              timestamp: new Date(),
            };
            onError(timeoutMessage);
            setIsLoading(false);
          }
        }, 30000); // 30 second response timeout

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          ws.send(JSON.stringify({ question: text }));
        };

        ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);

            // Handle end of stream or complete response
            if (
              response.type === "end" ||
              response.type === "complete" ||
              response.type === "done"
            ) {
              setIsLoading(false);
              clearTimeout(responseTimeout);
              onComplete?.();
              ws.close();
              return;
            }

            // Handle token-based streaming responses
            if (response.type === "token" && response.text) {
              // Check if this token contains a complete answer (must be substantial content)
              if (
                response.text.includes("Answer") ||
                response.text.includes("🔹") ||
                response.text.includes("\n\n")
              ) {
                // This is a complete answer token - clean it up and display it
                let cleanedText = response.text;

                // Check if this contains multiple answers (Answer 1, Answer 2, etc.)
                const answerMatches = cleanedText.match(
                  /🔹\s*Answer\s*\d+:\s*/g
                );

                if (answerMatches && answerMatches.length > 1) {
                  // Split the text by answer patterns and create separate messages for each
                  const answerParts = cleanedText.split(
                    /(?=🔹\s*Answer\s*\d+:\s*)/
                  );

                  answerParts.forEach((part: string, index: number) => {
                    if (part.trim()) {
                      // Clean up each part
                      let cleanPart = part.replace(
                        /🔹\s*Answer\s*\d+:\s*/g,
                        ""
                      );
                      cleanPart = cleanPart.replace(/^\s*\n+\s*/, "");

                      if (cleanPart.trim() && cleanPart.trim().length > 5) {
                        const botMessage: ChatBotMessage = {
                          id: (Date.now() + index + 1).toString(),
                          text: cleanPart,
                          isUser: false,
                          timestamp: new Date(),
                        };
                        onMessage(botMessage);
                      }
                    }
                  });
                } else {
                  // Single answer - clean it up and display it
                  cleanedText = cleanedText.replace(
                    /🔹\s*Answer\s*\d+:\s*/g,
                    ""
                  );
                  cleanedText = cleanedText.replace(/^\s*\n+\s*/, "");

                  if (cleanedText.trim() && cleanedText.trim().length > 5) {
                    const botMessage: ChatBotMessage = {
                      id: (Date.now() + 1).toString(),
                      text: cleanedText,
                      isUser: false,
                      timestamp: new Date(),
                    };
                    onMessage(botMessage);
                  }
                }

                // Don't close the connection yet - wait for more tokens or end signal
                clearTimeout(responseTimeout);
                return;
              }

              // Skip individual word tokens - don't display them
              // Just reset the timeout and continue waiting for complete answers
              clearTimeout(responseTimeout);
              return;
            }

            // Handle different possible response formats for complete responses
            let answer = "";
            if (response.answer) {
              answer = response.answer;
            } else if (response.response) {
              answer = response.response;
            } else if (response.message) {
              answer = response.message;
            } else if (response.text) {
              answer = response.text;
            } else if (typeof response === "string") {
              answer = response;
            } else {
              answer = "I'm sorry, I couldn't process your request.";
            }

            const botMessage: ChatBotMessage = {
              id: (Date.now() + 1).toString(),
              text: answer,
              isUser: false,
              timestamp: new Date(),
            };
            onMessage(botMessage);
            setIsLoading(false);
            clearTimeout(responseTimeout);
            onComplete?.();
            ws.close();
          } catch (parseError) {
            console.error(parseError);
            // If it's not JSON, treat it as plain text
            if (typeof event.data === "string" && event.data.trim()) {
              const botMessage: ChatBotMessage = {
                id: (Date.now() + 1).toString(),
                text: event.data,
                isUser: false,
                timestamp: new Date(),
              };
              onMessage(botMessage);
              setIsLoading(false);
              clearTimeout(responseTimeout);
              onComplete?.();
              ws.close();
            } else {
              const errorMessage: ChatBotMessage = {
                id: (Date.now() + 1).toString(),
                text: "Received invalid response from chatbot service.",
                isUser: false,
                timestamp: new Date(),
              };
              onError(errorMessage);
              setIsLoading(false);
              clearTimeout(responseTimeout);
              ws.close();
            }
          }
        };

        ws.onerror = (error) => {
          console.error(error);
          clearTimeout(connectionTimeout);
          clearTimeout(responseTimeout);
          const errorMessage: ChatBotMessage = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I'm having trouble connecting to the chatbot service. Please check your connection and try again.",
            isUser: false,
            timestamp: new Date(),
          };
          onError(errorMessage);
          setIsLoading(false);
        };

        ws.onclose = (event) => {
          console.error(event);
          clearTimeout(connectionTimeout);
          clearTimeout(responseTimeout);

          // If the connection was closed without receiving a response, show an error
          if (isLoading) {
            const errorMessage: ChatBotMessage = {
              id: (Date.now() + 1).toString(),
              text: "The chatbot service is currently unavailable. Please try again later.",
              isUser: false,
              timestamp: new Date(),
            };
            onError(errorMessage);
            setIsLoading(false);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error(error);
        const errorMessage: ChatBotMessage = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, something went wrong. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        onError(errorMessage);
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  return { sendChatBotMessage, isLoading };
};

export default useWebSocket;
