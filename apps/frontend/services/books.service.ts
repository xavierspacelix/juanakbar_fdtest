import { ApiResponse } from "@/types/book";

export class BookService {
  static async getBooks({
    author = "",
    date = "",
    rating = 0,
    page = 1,
    limit = 12,
  }: {
    author?: string;
    date?: string;
    rating?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (author && author.trim() !== "") {
      params.append("author", author);
    }
    if (date && date.trim() !== "") {
      params.append("date", date);
    }
    if (rating > 0) {
      params.append("rating", rating.toString());
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/books?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch books`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "API returned unsuccessful response");
      }

      return data;
    } catch (error) {
      console.error("BookService.getBooks error:", error);
      throw error;
    }
  }
}
