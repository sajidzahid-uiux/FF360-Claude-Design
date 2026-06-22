export type ChatUser = {
  id?: number | string;
  username?: string;
  nickname?: string;
  email?: string;
};

export type ChatAuthor =
  | string
  | {
      username?: string;
      user?: {
        id?: number | string;
        username?: string;
      };
    };

export type ChatMessage = {
  id?: number | string;
  group_id?: number | string;
  group?: number | string;
  chat_group_id?: number | string;
  chat_group?: {
    id?: number | string;
  };
  timestamp?: string;
  created_at?: string;
  time?: string;
  text?: string;
  body?: string;
  file_url?: string;
  from?: string;
  event?: string;
  author?: ChatAuthor;
};

export type MessagePreview = {
  created_at?: string;
  timestamp?: string;
  time?: string;
  body?: string;
  text?: string;
};

export type Conversation = {
  id: number;
  group_name?: string;
  name?: string;
  messages?: MessagePreview[];
  is_private?: boolean;
  members?: number[];
};

export type ChatGroup = Conversation & {
  group_description?: string;
  group_image?: string | null;
};

export type WebSocketChatEvent = ChatMessage & {
  event: string;
  is_typing?: boolean;
  member_name?: string;
  member_id?: number;
  members?: unknown[];
};

export type ChatWindowProps = {
  conversation?: Conversation;
  directMemberId?: number | null;
  messages?: ChatMessage[];
  usersTyping?: string[];
  onLoadMore?: () => Promise<void>;
  currentUser?: ChatUser | null;
};
