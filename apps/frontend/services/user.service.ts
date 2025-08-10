import { api } from "@/lib/axios";

interface GetUsersParams {
  search?: string;
  isVerified?: string; // "true" | "false"
  role?: string;
  page?: number;
  limit?: number;
}

export async function getUsers(params: GetUsersParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.isVerified) searchParams.append("isVerified", params.isVerified);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());

  const res = await api.get(`/users?${searchParams.toString()}`);
  return res.data;
}
