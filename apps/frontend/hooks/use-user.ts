import useSWR from "swr";
import { me } from "@/services/auth.service";
import type { ApiResponse } from "@/services/auth.service";

const fetcher = async () => {
  const res = await me();
  if (!res.success) throw new Error(res.message || "Failed to fetch user");
  return res.data;
};

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR("/users/profile", fetcher, {
    revalidateOnFocus: false,
  });
  return {
    user: data as any,
    isLoading,
    isError: !!error,
    mutate,
  };
}
