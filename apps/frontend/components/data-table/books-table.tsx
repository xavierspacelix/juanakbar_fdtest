"use client";

import * as React from "react";
import { ArrowUpDown, BookOpen, MoreHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { createBook, deleteBook, getBooks, updateBook } from "@/services/books.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Image from "next/image";
import { useUser } from "@/hooks/use-user";
import toast from "react-hot-toast";

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

export function BooksTable() {
  const { user } = useUser();
  const [books, setBooks] = React.useState<Book[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  });
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [createForm, setCreateForm] = React.useState({
    title: "",
    author: "",
    description: "",
    rating: "",
    thumbnail: undefined as File | undefined,
  });
  const [editForm, setEditForm] = React.useState({
    title: "",
    author: "",
    description: "",
    rating: "",
    thumbnail: undefined as File | undefined,
  });
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        uploader: user?.id,
      };
      if (search) params.search = search;
      if (Object.keys(filters).length > 0) params.filters = filters;
      const res = await getBooks(params);
      setBooks(res.data.books);
      setPagination((prev) => ({
        ...prev,
        pageCount: res.data.totalPages,
        total: res.data.total,
      }));
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreate = () => {
    setCreateForm({
      title: "",
      author: "",
      description: "",
      rating: "",
      thumbnail: undefined,
    });
    setThumbnailPreview(null);
    setCreateDialogOpen(true);
  };
  const handleCreateSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createBook({
        title: createForm.title,
        author: createForm.author,
        description: createForm.description,
        rating: createForm.rating ? Number(createForm.rating) : undefined,
        thumbnail: createForm.thumbnail,
      });
      setCreateDialogOpen(false);
      toast.success("Book created successfully");
      await fetchBooks();
    } catch (error) {
      toast.error("Failed to create book");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setEditForm({
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
  const handleEditSubmit = async () => {
    if (!selectedBook) return;
    setIsSubmitting(true);
    try {
      await updateBook(selectedBook.id, {
        title: editForm.title,
        author: editForm.author,
        description: editForm.description,
        rating: editForm.rating ? Number(editForm.rating) : undefined,
        thumbnail: editForm.thumbnail,
      });
      toast.success("Book updated successfully");
      fetchBooks();
    } catch (error) {
      toast.error("Failed to update book");
    } finally {
      setEditDialogOpen(false);
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
      fetchBooks();
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
        setCreateForm((prev) => ({ ...prev, thumbnail: file }));
      } else {
        setEditForm((prev) => ({ ...prev, thumbnail: file }));
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
    <div className="container w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Books Management</h1>
          <p className="text-gray-500 mt-2">Manage library books info.</p>
        </div>
        <Button variant="default" onClick={handleCreate}>
          Add Book
        </Button>
      </div>

      <DataTable
        columns={[
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
            accessorKey: "description",
            header: "Description",
          },
          {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => {
              const book = row.original as Book;
              return (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(book.rating!)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              );
            },
          },
          {
            accessorKey: "uploadedAt",
            header: "Published",
            cell: ({ row }) => new Date(row.getValue("uploadedAt")).toLocaleDateString(),
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
        filterOptions={[]}
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
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setThumbnailPreview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Book</DialogTitle>
            <DialogDescription>Add a new book to the library.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-title" className="text-right">
                Title
              </Label>
              <Input
                id="create-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-author" className="text-right">
                Author
              </Label>
              <Input
                id="create-author"
                value={createForm.author}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, author: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-description" className="text-right">
                Description
              </Label>
              <Input
                id="create-description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="create-rating" className="text-right">
                Rating
              </Label>
              <Input
                id="create-rating"
                type="number"
                min="0"
                max="5"
                value={createForm.rating}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, rating: e.target.value }))}
                className="col-span-3"
              />
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
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setThumbnailPreview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the book details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">
                Author
              </Label>
              <Input
                id="author"
                value={editForm.author}
                onChange={(e) => setEditForm((prev) => ({ ...prev, author: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rating" className="text-right">
                Rating
              </Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                value={editForm.rating}
                onChange={(e) => setEditForm((prev) => ({ ...prev, rating: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="thumbnail" className="text-right">
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
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleThumbnailChange(e, false)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
