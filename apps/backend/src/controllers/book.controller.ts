import { Request, Response } from "express";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";
import { Prisma } from "@prisma/client";
export async function listBooks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const where: Prisma.BookWhereInput = search
      ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { author: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

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
