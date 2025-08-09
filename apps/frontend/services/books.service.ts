import { api } from "@/lib/axios";
import type { withPaginationBook } from "@/types/book";
export const BookService = {
  getBooks: async (params?: {
    page?: number;
    perPage?: number;
    author?: string;
    rating?: number;
    date?: string;
  }): Promise<withPaginationBook> => {
    const { data } = await api.get("/books", {
      params: { ...params },
    });
    return data.data;
  },
};
