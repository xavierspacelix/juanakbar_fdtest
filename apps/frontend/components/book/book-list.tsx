"use client";
import { useMemo, useState, useEffect } from "react";
import { Book, Filters, ApiResponse } from "@/types/book";
import { useQuery } from "@tanstack/react-query";
import { BookService } from "@/services/books.service";
import { Badge } from "../ui/badge";
import { BookCard } from "./book-card";
import { Pagination } from "./pagination";
import { FilterSection } from "./filter";
import { Loader2 } from "lucide-react";

const BookList = () => {
  const [filters, setFilters] = useState<Filters>({
    author: "",
    dateRange: "",
    minRating: 0,
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const perPage = 12;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Main books query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["publicBooks", filters, page],
    queryFn: () =>
      BookService.getBooks({
        ...filters,
        page,
        limit: perPage,
        date: filters.dateRange,
        rating: filters.minRating,
      }),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Extract data from API response
  const books: Book[] = data?.data?.books ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  // Get authors for filter dropdown
  const { data: allBooksData } = useQuery({
    queryKey: ["allBooksForAuthors"],
    queryFn: () =>
      BookService.getBooks({
        author: "",
        date: "",
        rating: 0,
        page: 1,
        limit: 1000,
      }),
    staleTime: 10 * 60 * 1000,
  });

  const authors = useMemo(() => {
    const allBooks = allBooksData?.data?.books ?? [];
    const uniqueAuthors = [...new Set(allBooks.map((book: Book) => book.author))];
    return uniqueAuthors.filter(Boolean).sort();
  }, [allBooksData]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.author && filters.author !== "") count++;
    if (filters.dateRange && filters.dateRange !== "") count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      document.getElementById("book-list")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Books</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Something went wrong while fetching books."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" id="book-list">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Library</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Total: {total} books</span>
          {totalPages > 1 && (
            <Badge variant="secondary">
              Page {page} of {totalPages}
            </Badge>
          )}
        </div>
      </div>
      {JSON.stringify(filters)}
      <FilterSection
        filters={filters}
        setFilters={setFilters}
        authors={authors}
        activeFiltersCount={activeFiltersCount}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading books...</span>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BookList;
