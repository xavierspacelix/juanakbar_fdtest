"use client";

import * as React from "react";
import { ArrowUpDown, BookOpen, MoreHorizontal, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import { getBooks, updateBook, deleteBook, createBook } from "@/services/books.service";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/use-user";

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
const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().optional(),
  rating: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => val === undefined || (val >= 0 && val <= 5), {
      message: "Rating must be between 0 and 5",
    }),
  thumbnail: z.instanceof(File).optional(),
});

type BookForm = z.infer<typeof bookSchema>;
type BookFormInput = z.input<typeof bookSchema>;

export function BooksTable() {
  const { user } = useUser();
  const [books, setBooks] = React.useState<Book[]>([]);
  const [authors, setAuthors] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createForm = useForm<BookFormInput, any, BookForm>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      rating: "",
      thumbnail: undefined,
    },
  });

  const editForm = useForm<BookFormInput, any, BookForm>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      rating: "",
      thumbnail: undefined,
    },
  });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        uploader: user?.id,
      };
      if (search) params.search = search;
      if (filters.author) params.author = filters.author;
      if (filters.rating) params.rating = filters.rating;
      if (filters.date) params.date = filters.date;

      const res = await getBooks(params);
      setBooks(res.data.books);
      setPagination((prev) => ({
        ...prev,
        pageCount: res.data.totalPages,
        total: res.data.total,
      }));
    } catch (error: any) {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    editForm.reset({
      title: book.title,
      author: book.author,
      description: book.description || "",
      rating: book.rating?.toString() || "",
      thumbnail: undefined,
    });
    setThumbnailPreview(
      book.thumbnail ? process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") + book.thumbnail! : null
    );
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    createForm.reset();
    setThumbnailPreview(null);
    setCreateDialogOpen(true);
  };

  const handleEditSubmit: SubmitHandler<BookForm> = async (data) => {
    if (!selectedBook) return;
    setIsSubmitting(true);
    try {
      await updateBook(selectedBook.id, data);
      setEditDialogOpen(false);
      toast.success("Book updated successfully");
      await fetchBooks();
    } catch (error) {
      toast.error("Failed to update book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit: SubmitHandler<BookForm> = async (data) => {
    setIsSubmitting(true);
    try {
      await createBook(data);
      setCreateDialogOpen(false);
      toast.success("Book created successfully");
      await fetchBooks();
    } catch (error) {
      toast.error("Failed to create book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;
    setIsSubmitting(true);
    try {
      await deleteBook(selectedBook.id);
      setDeleteDialogOpen(false);
      toast.success("Book deleted successfully");
      await fetchBooks();
    } catch (error) {
      toast.error("Failed to delete book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>, isCreate: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isCreate) {
        createForm.setValue("thumbnail", file);
      } else {
        editForm.setValue("thumbnail", file);
      }
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  React.useEffect(() => {
    fetchBooks();
  }, [pagination.pageIndex, pagination.pageSize, search, filters]);

  React.useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Books Management</h1>
          <p className="text-gray-500 mt-2">
            Manage library books, track status, and view publication info.
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      <DataTable
        columns={[
          {
            accessorKey: "thumbnail",
            header: "Thumbnail",
            cell: ({ row }) => {
              const book = row.original as Book;
              return book.thumbnail ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${book.thumbnail}`}
                  alt={book.title}
                  width={50}
                  height={50}
                  className="object-cover rounded"
                />
              ) : (
                <span>No Image</span>
              );
            },
          },
          {
            accessorKey: "title",
            header: ({ column }) => (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="h-auto p-0 font-semibold"
              >
                Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            ),
            cell: ({ row }) => {
              const book = row.original as Book;
              return (
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>{book.title}</span>
                </div>
              );
            },
          },
          {
            accessorKey: "author",
            header: "Author",
          },
          {
            accessorKey: "uploadedAt",
            header: "Published",
            cell: ({ row }) => new Date(row.getValue("uploadedAt")).toLocaleDateString(),
          },
          {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => {
              return (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(row.getValue("rating") || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              );
            },
            // (row.getValue("rating") || 0).toString(),
          },
          {
            accessorKey: "uploader.name",
            header: "Uploader",
            cell: ({ row }) => (row.original as Book).uploader.name,
          },
          {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
              const book = row.original as Book;
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(book)}>
                      <IconEdit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(book)} className="text-red-600">
                      <IconTrash className="mr-2 h-4 w-4 text-red-600" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]}
        data={books}
        searchKey="title"
        searchPlaceholder="Search books by title or author..."
        filterOptions={[
          {
            key: "author",
            label: "Author",
            options: [
              { label: "All Authors", value: "all" },
              ...authors.map((author) => ({ label: author, value: author })),
            ],
          },
          {
            key: "rating",
            label: "Rating",
            options: [
              { label: "All Ratings", value: "all" },
              { label: "0", value: "0" },
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
            ],
          },
          {
            key: "date",
            label: "Publication Date",
            options: [{ label: "All Dates", value: "all" }],
          },
        ]}
        pagination={{
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          pageCount: pagination.pageCount,
          total: pagination.total,
          onPageChange: (page) => setPagination((prev) => ({ ...prev, pageIndex: page })),
          onPageSizeChange: (size) =>
            setPagination((prev) => ({ ...prev, pageSize: size, pageIndex: 0 })),
        }}
        onSearchChange={setSearch}
        onFilterChange={setFilters}
        loading={loading}
      />

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setThumbnailPreview(null);
            createForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Book</DialogTitle>
            <DialogDescription>Add a new book to the library.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-title" className="text-right">
                  Title
                </Label>
                <div className="col-span-3">
                  <Input
                    id="create-title"
                    {...createForm.register("title")}
                    className={createForm.formState.errors.title ? "border-red-500" : ""}
                  />
                  {createForm.formState.errors.title && (
                    <p className="text-red-500 text-sm">
                      {createForm.formState.errors.title.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-author" className="text-right">
                  Author
                </Label>
                <div className="col-span-3">
                  <Input
                    id="create-author"
                    {...createForm.register("author")}
                    className={createForm.formState.errors.author ? "border-red-500" : ""}
                  />
                  {createForm.formState.errors.author && (
                    <p className="text-red-500 text-sm">
                      {createForm.formState.errors.author.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="create-description"
                  {...createForm.register("description")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-rating" className="text-right">
                  Rating
                </Label>
                <div className="col-span-3">
                  <Input
                    id="create-rating"
                    type="number"
                    min="0"
                    max="5"
                    {...createForm.register("rating")}
                    className={createForm.formState.errors.rating ? "border-red-500" : ""}
                  />
                  {createForm.formState.errors.rating && (
                    <p className="text-red-500 text-sm">
                      {createForm.formState.errors.rating.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="create-thumbnail" className="text-right">
                  Thumbnail
                </Label>
                <div className="col-span-3 space-y-2">
                  {thumbnailPreview && (
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      width={100}
                      height={100}
                      className="object-cover rounded"
                    />
                  )}
                  <Input
                    id="create-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailChange(e, true)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setThumbnailPreview(null);
            editForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the book details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-title"
                    {...editForm.register("title")}
                    className={editForm.formState.errors.title ? "border-red-500" : ""}
                  />
                  {editForm.formState.errors.title && (
                    <p className="text-red-500 text-sm">
                      {editForm.formState.errors.title.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-author" className="text-right">
                  Author
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-author"
                    {...editForm.register("author")}
                    className={editForm.formState.errors.author ? "border-red-500" : ""}
                  />
                  {editForm.formState.errors.author && (
                    <p className="text-red-500 text-sm">
                      {editForm.formState.errors.author.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  {...editForm.register("description")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-rating" className="text-right">
                  Rating
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-rating"
                    type="number"
                    min="0"
                    max="5"
                    {...editForm.register("rating")}
                    className={editForm.formState.errors.rating ? "border-red-500" : ""}
                  />
                  {editForm.formState.errors.rating && (
                    <p className="text-red-500 text-sm">
                      {editForm.formState.errors.rating.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-thumbnail" className="text-right">
                  Thumbnail
                </Label>
                <div className="col-span-3 space-y-2">
                  {thumbnailPreview && (
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      width={100}
                      height={100}
                      className="object-cover rounded"
                    />
                  )}
                  <Input
                    id="edit-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailChange(e, false)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
