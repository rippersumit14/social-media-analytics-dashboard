import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { dashboardService } from "../../../services/dashboardService";
import { chatService } from "../../../services/chatService";
import { streamChatMessage } from "../../../services/chatStreamService";
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
  const [streamState, setStreamState] = useState({ status: "idle", model: "", error: "" });
  const abortControllerRef = useRef(null);

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

      if (!content || !activeConversationId || streamState.status === "streaming") {
        return;
      }

      const createdAt = new Date().toISOString();
      const localMessage = {
        _id: `local-${Date.now()}`,
        role: "user",
        content,
        createdAt,
      };
      const assistantMessage = {
        _id: `stream-${Date.now()}`,
        role: "assistant",
        content: "",
        provider: "groq",
        model: "",
        createdAt,
        isStreaming: true,
      };

      const controller = new AbortController();
      abortControllerRef.current = controller;

      queryClient.setQueryData(messagesKey(activeConversationId), (current = []) => [...current, localMessage, assistantMessage]);
      setStreamState({ status: "streaming", model: "", error: "" });

      try {
        await streamChatMessage({
          conversationId: activeConversationId,
          message: content,
          signal: controller.signal,
          onModel: (model) => {
            setStreamState((current) => ({ ...current, model }));
            queryClient.setQueryData(messagesKey(activeConversationId), (current = []) =>
              current.map((item) => (item._id === assistantMessage._id ? { ...item, model } : item)),
            );
          },
          onChunk: (chunk) => {
            queryClient.setQueryData(messagesKey(activeConversationId), (current = []) =>
              current.map((item) => (item._id === assistantMessage._id ? { ...item, content: `${item.content || ""}${chunk}` } : item)),
            );
          },
          onError: (streamError) => {
            throw new Error(streamError || "AI stream failed.");
          },
        });

        setStreamState((current) => ({ ...current, status: "complete", error: "" }));
        queryClient.setQueryData(messagesKey(activeConversationId), (current = []) =>
          current.map((item) => (item._id === assistantMessage._id ? { ...item, isStreaming: false } : item)),
        );
        queryClient.invalidateQueries({ queryKey: conversationsKey });
        queryClient.invalidateQueries({ queryKey: messagesKey(activeConversationId) });
      } catch (error) {
        if (error.name === "AbortError") {
          setStreamState((current) => ({ ...current, status: "cancelled", error: "" }));
          queryClient.setQueryData(messagesKey(activeConversationId), (current = []) =>
            current.map((item) => (item._id === assistantMessage._id ? { ...item, isStreaming: false, wasCancelled: true } : item)),
          );
          return;
        }

        const errorMessage = getApiErrorMessage(error, "Unable to send message.");
        setStreamState((current) => ({ ...current, status: "error", error: errorMessage }));
        queryClient.setQueryData(messagesKey(activeConversationId), (current = []) =>
          current
            .filter((item) => item._id !== assistantMessage._id),
        );
        toast.error(errorMessage);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [activeConversationId, queryClient, streamState.status],
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

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
    isSendingMessage: streamState.status === "streaming",
    lastDeletedConversationId,
    messageError: messagesQuery.error,
    messages: messagesQuery.data || [],
    searchTerm,
    streamError: streamState.error,
    streamModel: streamState.model,
    streamStatus: streamState.status,
    setActiveConversationId,
    setSearchTerm,
    createConversation,
    deleteConversation: deleteConversationMutation.mutate,
    refetchMessages: messagesQuery.refetch,
    renameConversation: renameConversationMutation.mutate,
    restoreConversation: restoreConversationMutation.mutate,
    sendMessage,
    stopStreaming,
  };
}
