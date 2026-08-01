import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { instagramService } from "../services/instagramService";
import { instagramErrorCategories, normalizeInstagramError } from "../utils/normalizeInstagramError";

const ACCOUNT_QUERY_KEY = ["instagram-account"];

function getConnectionState(account, error, isLoading, isConnecting, isSyncing) {
  if (isLoading) return "loading";
  if (isConnecting) return "starting_connection";
  if (isSyncing) return "synchronizing";
  if (error) return "error";
  if (!account) return "not_connected";
  if (!account.lastSyncedAt) return "connected_never_synced";

  return "synchronized";
}

export function useInstagramAccount() {
  const queryClient = useQueryClient();
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const accountQuery = useQuery({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: instagramService.getConnectedAccount,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const connectMutation = useMutation({
    mutationFn: instagramService.getConnectionUrl,
  });

  const syncMutation = useMutation({
    mutationFn: () => instagramService.syncCreatorData(),
    onSuccess: (result) => {
      setLastSyncResult(result);
      queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["creator-score"] });
      queryClient.invalidateQueries({ queryKey: ["creator-insights"] });
    },
  });

  const refreshAccount = useCallback(() => accountQuery.refetch(), [accountQuery]);

  const startConnection = useCallback(async () => {
    const result = await connectMutation.mutateAsync();
    window.location.assign(result.authURL);

    return result;
  }, [connectMutation]);

  const syncCreatorData = useCallback(async () => {
    return syncMutation.mutateAsync();
  }, [syncMutation]);

  const normalizedError = useMemo(() => {
    if (accountQuery.error) return normalizeInstagramError(accountQuery.error);
    if (connectMutation.error) return normalizeInstagramError(connectMutation.error);
    if (syncMutation.error) return normalizeInstagramError(syncMutation.error);

    return null;
  }, [accountQuery.error, connectMutation.error, syncMutation.error]);

  const account = accountQuery.data?.account || null;
  const connectionState = getConnectionState(
    account,
    normalizedError?.category !== instagramErrorCategories.CONNECTION_NOT_FOUND ? normalizedError : null,
    accountQuery.isLoading,
    connectMutation.isPending,
    syncMutation.isPending,
  );

  return {
    account,
    overview: accountQuery.data?.overview || null,
    connectionState,
    error: normalizedError,
    isLoading: accountQuery.isLoading,
    isRefreshing: accountQuery.isFetching && !accountQuery.isLoading,
    isConnecting: connectMutation.isPending,
    isSyncing: syncMutation.isPending,
    lastSyncResult,
    refreshAccount,
    startConnection,
    syncCreatorData,
  };
}
