"use client";

import { ComponentSizeEnum, TabsSwitcher } from "@fieldflow360/org-ui";
import { ArrowLeft } from "lucide-react";

import { useMessagesPage } from "@/features/messaging/hooks/useMessagesPage";

import AddGroupDialog from "./AddGroupDialog";
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
    setAddGroupOpen,
    handleSelectDirectMember,
    handleTabChange,
    addGroupOpen,
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
            onAddGroup={() => setAddGroupOpen(true)}
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
            onOpenChange={setAddGroupOpen}
          />
        </div>
      );
    }
    // Show chat window with back arrow and input always visible at the bottom
    return (
      <div className="bg-bg-app flex h-[calc(100dvh-3.5rem)] min-h-0 w-full flex-col sm:h-[100dvh]">
        <div className="flex shrink-0 items-center border-b border-neutral-200 bg-white px-2 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            className="mr-2 rounded p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={handleMobileBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <span className="truncate text-lg font-semibold">
            {activeConversation?.name ??
              activeConversation?.group_name ??
              "Chat"}
          </span>
        </div>
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
          onAddGroup={() => setAddGroupOpen(true)}
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
          onOpenChange={setAddGroupOpen}
        />
      </div>
      <div className="flex w-[calc(100%-120px)] flex-1 flex-col">
        {activeConversation && (
          <ChatWindow
            key={`chat-window-${activeConversationId}`}
            conversation={activeConversation}
            currentUser={currentUser}
            messages={messages}
            usersTyping={usersTyping}
            onLoadMore={handleLoadMore}
          />
        )}
        {activeConversation && (
          <MessageInput
            key={`message-input-${activeConversationId}`}
            onSend={sendMessage}
            onTyping={isTyping}
          />
        )}
      </div>
    </div>
  );
}
