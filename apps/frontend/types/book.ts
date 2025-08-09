export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    page: number;
    totalPages: number;
    books: Book[];
  };
  errors: any;
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
  thumbnail: string | null;
  rating: number;
  uploadedAt: string;
  uploaderId: number;
  uploader: {
    id: number;
    name: string;
    email: string;
  };
}
