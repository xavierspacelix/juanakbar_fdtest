export interface withPaginationBook {
  total: number;
  page: number;
  totalPages: number;
  books: Book[];
}
export interface Filters {
  author: string;
  dateRange: string;
  minRating: number;
}
export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  thumbnail: string;
  rating: number;
  uploadedAt: string;
  uploaderId: number;
}
