"use client";

import useSWR, { SWRConfiguration } from "swr";
import { apiClient } from "@/libraries/api/Client";

export function useFetch<T>(
  endpoint: string | null,
  options?: RequestInit,
  config?: SWRConfiguration
) {
  const fetcher = async (url: string) => apiClient.request<T>(url, options);

  const { data, error, isLoading, mutate } = useSWR<T>(
    endpoint,
    endpoint ? fetcher : null,
    config
  );

  return { data, error, isLoading, mutate };
}
