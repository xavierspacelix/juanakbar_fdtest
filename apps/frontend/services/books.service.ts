import { api } from "@/lib/axios";

interface GetBooksParams {
  author?: string;
  date?: string;
  rating?: string;
  page?: number;
  limit?: number;
  search?: string;
  uploader?: number;
}
export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  thumbnail?: string;
  rating?: number;
  uploadedAt: string;
  uploader: {
    id: number;
    name: string;
    email: string;
  };
}
export async function getBooks(params: GetBooksParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append("search", params.search);
  if (params.author) searchParams.append("author", params.author);
  if (params.date) searchParams.append("date", params.date);
  if (params.rating) searchParams.append("rating", params.rating);
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.uploader) searchParams.append("uploader", params.uploader.toString());

  const res = await api.get(`/books?${searchParams.toString()}`);
  return res.data;
}
export async function createBook(data: {
  title: string;
  author: string;
  description?: string;
  rating?: number;
  thumbnail?: File;
}): Promise<Book> {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("author", data.author);
    if (data.description) formData.append("description", data.description);
    if (data.rating !== undefined) formData.append("rating", data.rating.toString());
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    const response = await api.post(`/books`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error("Failed to create book");
  }
}
export async function updateBook(
  id: number,
  data: {
    title: string;
    author: string;
    description?: string;
    rating?: number;
    thumbnail?: File;
  }
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("author", data.author);
    if (data.description) formData.append("description", data.description);
    if (data.rating !== undefined) formData.append("rating", data.rating.toString());
    if (data.thumbnail) formData.append("thumbnail", data.thumbnail);

    await api.put(`/books/${id}`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    throw new Error("Failed to update book");
  }
}

export async function deleteBook(id: number): Promise<void> {
  try {
    await api.delete(`/books/${id}`, { withCredentials: true });
  } catch (error) {
    throw new Error("Failed to delete book");
  }
}
