import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { dashboardService } from "../../../services/dashboardService";
import { chatService } from "../../../services/chatService";
import { getApiErrorMessage } from "../../../utils/apiError";

const conversationsKey = ["chat", "conversations"];
const dashboardOverviewKey = ["dashboard-overview"];

function messagesKey(conversationId) {
  return ["chat", "messages", conversationId];
}

function sortByActivity(conversations) {
  return [...conversations].sort((a, b) => new Date(b.lastMessageAt || b.updatedAt || 0) - new Date(a.lastMessageAt || a.updatedAt || 0));
}

export function useChatWorkspace() {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [lastDeletedConversationId, setLastDeletedConversationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const dashboardQuery = useQuery({
    queryKey: dashboardOverviewKey,
    queryFn: dashboardService.getOverview,
    retry: false,
  });

  const conversationsQuery = useQuery({
    queryKey: conversationsKey,
    queryFn: chatService.listConversations,
    retry: false,
  });

  const conversations = useMemo(() => sortByActivity(conversationsQuery.data || []), [conversationsQuery.data]);

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0]._id);
    }
  }, [activeConversationId, conversations]);

  const filteredConversations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => conversation.title?.toLowerCase().includes(query));
  }, [conversations, searchTerm]);

  const messagesQuery = useQuery({
    queryKey: messagesKey(activeConversationId),
    queryFn: () => chatService.getMessages(activeConversationId),
    enabled: Boolean(activeConversationId),
    retry: false,
  });

  const createConversationMutation = useMutation({
    mutationFn: chatService.createConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData(conversationsKey, (current = []) => sortByActivity([conversation, ...current]));
      setActiveConversationId(conversation._id);
      toast.success("Conversation created.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create conversation."));
    },
  });

  const renameConversationMutation = useMutation({
    mutationFn: chatService.renameConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData(conversationsKey, (current = []) =>
        sortByActivity(current.map((item) => (item._id === conversation._id ? conversation : item))),
      );
      toast.success("Conversation renamed.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to rename conversation."));
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: chatService.deleteConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData(conversationsKey, (current = []) => current.filter((item) => item._id !== conversation._id));
      queryClient.removeQueries({ queryKey: messagesKey(conversation._id) });
      setLastDeletedConversationId(conversation._id);

      if (activeConversationId === conversation._id) {
        const nextConversation = conversations.find((item) => item._id !== conversation._id);
        setActiveConversationId(nextConversation?._id || null);
      }

      toast.success("Conversation deleted. You can restore it from the sidebar.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete conversation."));
    },
  });

  const restoreConversationMutation = useMutation({
    mutationFn: chatService.restoreConversation,
    onSuccess: (conversation) => {
      queryClient.setQueryData(conversationsKey, (current = []) => sortByActivity([conversation, ...current]));
      setActiveConversationId(conversation._id);
      setLastDeletedConversationId(null);
      toast.success("Conversation restored.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to restore conversation."));
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (reply, variables) => {
      queryClient.setQueryData(messagesKey(variables.conversationId), (current = []) => [...current, reply].filter(Boolean));
      queryClient.invalidateQueries({ queryKey: conversationsKey });
      queryClient.invalidateQueries({ queryKey: messagesKey(variables.conversationId) });
    },
    onError: (error, variables) => {
      queryClient.setQueryData(messagesKey(variables.conversationId), (current = []) => current.filter((message) => message._id !== variables.localMessageId));
      toast.error(getApiErrorMessage(error, "Unable to send message."));
    },
  });

  const createConversation = useCallback(
    (title = "New Chat") => {
      const instagramAccountId = dashboardQuery.data?.account?.id;

      if (!instagramAccountId) {
        toast.error("Connect Instagram before creating an AI conversation.");
        return;
      }

      createConversationMutation.mutate({ instagramAccountId, title });
    },
    [createConversationMutation, dashboardQuery.data?.account?.id],
  );

  const sendMessage = useCallback(
    async (message) => {
      const content = message.trim();

      if (!content || !activeConversationId || sendMessageMutation.isPending) {
        return;
      }

      const localMessage = {
        _id: `local-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(messagesKey(activeConversationId), (current = []) => [...current, localMessage]);
      sendMessageMutation.mutate({ conversationId: activeConversationId, localMessageId: localMessage._id, message: content });
    },
    [activeConversationId, queryClient, sendMessageMutation],
  );

  return {
    account: dashboardQuery.data?.account,
    activeConversationId,
    conversations,
    conversationsError: conversationsQuery.error,
    filteredConversations,
    isCreatingConversation: createConversationMutation.isPending,
    isDashboardLoading: dashboardQuery.isLoading,
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    isRenamingConversation: renameConversationMutation.isPending,
    isRestoringConversation: restoreConversationMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    lastDeletedConversationId,
    messageError: messagesQuery.error,
    messages: messagesQuery.data || [],
    searchTerm,
    setActiveConversationId,
    setSearchTerm,
    createConversation,
    deleteConversation: deleteConversationMutation.mutate,
    refetchMessages: messagesQuery.refetch,
    renameConversation: renameConversationMutation.mutate,
    restoreConversation: restoreConversationMutation.mutate,
    sendMessage,
  };
}
