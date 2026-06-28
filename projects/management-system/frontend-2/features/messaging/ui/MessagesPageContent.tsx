"use client";

import { ComponentSizeEnum, TabsSwitcher } from "@fieldflow360/org-ui";
import { MessageSquare } from "lucide-react";

import { useMessagesPage } from "@/features/messaging/hooks/useMessagesPage";
import { useModalStack } from "@/shared/model/use-modal-stack";

import AddGroupDialog from "./AddGroupDialog";
import ChatHeader from "./ChatHeader";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";
import Sidebar from "./Sidebar";

export default function MessagesPage() {
  const {
    groups,
    currentUser,
    mergedLatestMessages,
    selectedDirectMemberId,
    selectedId,
    handleSelectGroup,
    tab,
    teamMembersWithoutCurrentUser,
    unseenChats,
    handleSelectDirectMember,
    handleTabChange,
    handleCreateGroup,
    isMobile,
    showMobileChat,
    handleMobileBack,
    activeConversation,
    activeConversationId,
    messages,
    usersTyping,
    handleLoadMore,
    sendMessage,
    isTyping,
  } = useMessagesPage();

  const { stack, openModal, closeModalKey } = useModalStack();
  const addGroupOpen = stack.some((f) => f.key === "add-message-group");

  const conversationName =
    activeConversation?.name ?? activeConversation?.group_name ?? "Chat";
  const isGroupConversation =
    !!activeConversation &&
    (!activeConversation.is_private ||
      (activeConversation.members?.length ?? 0) > 2);
  const conversationMemberCount = activeConversation?.members?.length;

  if (isMobile) {
    // MOBILE: Only show one view at a time
    if (!showMobileChat) {
      // Show sidebar (chat list)
      return (
        <div className="bg-bg-app h-[100dvh]">
          <Sidebar
            conversations={groups}
            currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
            latestMessages={mergedLatestMessages}
            selectedDirectMemberId={selectedDirectMemberId}
            selectedId={selectedId || 0}
            setSelectedId={handleSelectGroup}
            tab={tab}
            teamMembers={teamMembersWithoutCurrentUser}
            unseenChats={unseenChats?.unseen_counts}
            onAddGroup={() => openModal("add-message-group")}
            onSelectDirectMember={handleSelectDirectMember}
          >
            <TabsSwitcher
              fullWidth
              className="mb-2 w-full"
              items={[
                { value: "direct", label: "Direct Messages" },
                { value: "groups", label: "Groups" },
              ]}
              size={ComponentSizeEnum.SM}
              value={tab}
              onChange={handleTabChange}
            />
          </Sidebar>
          <AddGroupDialog
            open={addGroupOpen}
            onCreate={handleCreateGroup}
            onOpenChange={(o) => {
              if (!o) closeModalKey("add-message-group");
            }}
          />
        </div>
      );
    }
    // Show chat window with back arrow and input always visible at the bottom
    return (
      <div className="bg-bg-app flex h-[calc(100dvh-3.5rem)] min-h-0 w-full flex-col sm:h-[100dvh]">
        <ChatHeader
          directMemberId={selectedDirectMemberId}
          isGroup={isGroupConversation}
          memberCount={conversationMemberCount}
          name={conversationName}
          onBack={handleMobileBack}
        />
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatWindow
            key={`chat-window-${activeConversationId}`}
            conversation={activeConversation}
            currentUser={currentUser}
            messages={messages}
            usersTyping={usersTyping}
            onLoadMore={handleLoadMore}
          />
        </div>
        <div className="shrink-0">
          <MessageInput
            key={`message-input-${activeConversationId}`}
            onSend={sendMessage}
            onTyping={isTyping}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-bg-app flex h-[calc(100vh-3.5rem)]">
      <div className="flex w-[30%] min-w-120 flex-col">
        <Sidebar
          conversations={groups}
          currentUserId={currentUser?.id ? Number(currentUser.id) : undefined}
          latestMessages={mergedLatestMessages}
          selectedDirectMemberId={selectedDirectMemberId}
          selectedId={selectedId || 0}
          setSelectedId={handleSelectGroup}
          tab={tab}
          teamMembers={teamMembersWithoutCurrentUser}
          unseenChats={unseenChats?.unseen_counts}
          onAddGroup={() => openModal("add-message-group")}
          onSelectDirectMember={handleSelectDirectMember}
        >
          <TabsSwitcher
            fullWidth
            className="mb-2 w-full"
            items={[
              { value: "direct", label: "Direct Messages" },
              { value: "groups", label: "Groups" },
            ]}
            size={ComponentSizeEnum.SM}
            value={tab}
            onChange={handleTabChange}
          />
        </Sidebar>
        <AddGroupDialog
          open={addGroupOpen}
          onCreate={handleCreateGroup}
          onOpenChange={(o) => {
            if (!o) closeModalKey("add-message-group");
          }}
        />
      </div>
      <div className="bg-bg-app flex w-[calc(100%-120px)] flex-1 flex-col">
        {activeConversation ? (
          <>
            <ChatHeader
              directMemberId={selectedDirectMemberId}
              isGroup={isGroupConversation}
              memberCount={conversationMemberCount}
              name={conversationName}
            />
            <ChatWindow
              key={`chat-window-${activeConversationId}`}
              conversation={activeConversation}
              currentUser={currentUser}
              messages={messages}
              usersTyping={usersTyping}
              onLoadMore={handleLoadMore}
            />
            <MessageInput
              key={`message-input-${activeConversationId}`}
              onSend={sendMessage}
              onTyping={isTyping}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="bg-bg-surface text-text-muted flex h-14 w-14 items-center justify-center rounded-full">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <p className="text-text-primary text-base font-semibold">
                Your messages
              </p>
              <p className="text-text-muted mt-1 text-sm">
                Select a conversation to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
