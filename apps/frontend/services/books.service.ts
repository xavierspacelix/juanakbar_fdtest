import { api } from "@/lib/axios";
import type { Book } from "@/types/book";

export const BookService = {
  getPublicBooks: async (
    page = 1,
    perPage = 10,
    q = ""
  ): Promise<{ data: Book[]; total: number }> => {
    const { data } = await api.get("/books", { params: { page, perPage, q } });
    return data;
  },
};
