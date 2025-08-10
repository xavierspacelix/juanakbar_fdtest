import { Request, Response } from "express";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";
import { Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
export async function listBooks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const authorFilter = (req.query.author as string) || "";
    const ratingFilter = req.query.rating ? parseInt(req.query.rating as string) : undefined;
    const dateFilter = (req.query.date as string) || ""; // format: YYYY-MM-DD
    const uploaderFilter = parseInt(req.query.uploader as string) || undefined;
    const where: Prisma.BookWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { author: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {},
        authorFilter
          ? { author: { equals: authorFilter, mode: Prisma.QueryMode.insensitive } }
          : {},
        ratingFilter ? { rating: ratingFilter } : {},
        dateFilter
          ? {
              uploadedAt: {
                gte: new Date(dateFilter + "T00:00:00.000Z"),
                lt: new Date(dateFilter + "T23:59:59.999Z"),
              },
            }
          : {},
        uploaderFilter ? { uploaderId: uploaderFilter } : {},
      ],
    };

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { uploadedAt: "desc" },
        include: {
          uploader: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return res.json(
      success("Books fetched successfully", {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        books,
      })
    );
  } catch (err) {
    return res.status(500).json(error("Failed to fetch books"));
  }
}

export async function createBook(req: Request, res: Response) {
  try {
    const { title, author, description, rating } = req.body;
    const uploaderId = (req as any).user.id; // dari JWT auth middleware
    const file = req.file;

    if (!title || !author) {
      return res.status(400).json(error("Title and author are required"));
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        rating: rating ? Number(rating) : 0,
        thumbnail: file ? `/uploads/${file.filename}` : null,
        uploaderId,
      },
    });

    return res.status(201).json(success("Book created successfully", book));
  } catch (err: any) {
    return res.status(500).json(error("Failed to create book", err.message));
  }
}
export async function updateBook(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { title, author, description, rating } = req.body;
    const uploaderId = (req as any).user.id;
    const file = req.file;

    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      return res.status(404).json(error("Book not found"));
    }

    // Hanya uploader yang boleh mengupdate
    if (existingBook.uploaderId !== uploaderId) {
      return res.status(403).json(error("You are not allowed to edit this book"));
    }

    // Hapus file lama jika ada file baru
    let thumbnail = existingBook.thumbnail;
    if (file) {
      if (thumbnail) {
        const oldPath = path.join(__dirname, "../../", thumbnail);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      thumbnail = `/uploads/${file.filename}`;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title: title || existingBook.title,
        author: author || existingBook.author,
        description: description || existingBook.description,
        rating: rating ? Number(rating) : existingBook.rating,
        thumbnail,
      },
    });

    return res.json(success("Book updated successfully", updatedBook));
  } catch (err: any) {
    return res.status(500).json(error("Failed to update book", err.message));
  }
}

export async function deleteBook(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const uploaderId = (req as any).user.id;

    const existingBook = await prisma.book.findUnique({ where: { id } });
    if (!existingBook) {
      return res.status(404).json(error("Book not found"));
    }

    if (existingBook.uploaderId !== uploaderId) {
      return res.status(403).json(error("You are not allowed to delete this book"));
    }

    if (existingBook.thumbnail) {
      const filePath = path.join(__dirname, "../../", existingBook.thumbnail);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.book.delete({ where: { id } });

    return res.json(success("Book deleted successfully"));
  } catch (err: any) {
    return res.status(500).json(error("Failed to delete book", err.message));
  }
}
