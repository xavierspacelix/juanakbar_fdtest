"use client";
import { useMemo, useState } from "react";
import { Book, Filters } from "@/types/book";
import { useQuery } from "@tanstack/react-query";
import { BookService } from "@/services/books.service";
import { Badge } from "../ui/badge";
import { BookCard } from "./book-card";
import { Pagination } from "./pagination";
import { FilterSection } from "./filter";

const BookList = () => {
  const [filters, setFilters] = useState<Filters>({
    author: "",
    dateRange: "",
    minRating: 0,
  });
  const [page, setPage] = useState(1);
  const perPage = 9;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["publicBooks", filters],
    queryFn: () => BookService.getBooks({ ...filters, page: 1, perPage: 10 }),
  });
  const books: Book[] = data?.books ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const [showFilters, setShowFilters] = useState(true);
  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(books.map((book) => book.author))];
    return uniqueAuthors.sort();
  }, [books]);
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.author) count++;
    if (filters.dateRange) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);
  return (
    <div className="container mx-auto px-4 py-8" id="book-list">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Library</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Total: {total} books</span>
          <Badge variant="secondary">
            Page {page} of {totalPages}
          </Badge>
        </div>
      </div>
      <FilterSection
        filters={filters}
        setFilters={setFilters}
        authors={authors}
        activeFiltersCount={activeFiltersCount}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default BookList;
