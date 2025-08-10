import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { success, error } from "../utils/response";
import path from "path";
import fs from "fs";
import { getUsersService } from "../services/user.service";
export const getUsers = async (req: Request, res: Response) => {
  try {
    const query: {
      isVerified?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {};

    if ("isVerified" in req.query) {
      const isVerified = req.query.isVerified;
      if (isVerified !== "true" && isVerified !== "false") {
        return res
          .status(400)
          .json(error('Invalid isVerified parameter. Must be "true" or "false"', null));
      }
      query.isVerified = isVerified === "true";
    }

    if ("search" in req.query) {
      const search = req.query.search;
      if (typeof search !== "string" || search.trim() === "") {
        return res
          .status(400)
          .json(error("Invalid search parameter. Must be a non-empty string", null));
      }
      query.search = search;
    }

    // Pagination defaults
    query.page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    query.limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const result = await getUsersService(query);
    return res.status(200).json(success("Users retrieved successfully", result));
  } catch (err) {
    console.error(err);
    return res.status(500).json(error("Failed to fetch users"));
  }
};
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    });

    if (!user) return res.status(404).json(error("User not found"));

    return res.json(success("Profile fetched successfully", user));
  } catch (err) {
    return res.status(500).json(error("Failed to fetch profile"));
  }
}
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { name, email, password } = req.body;

    let updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, avatar: true },
    });

    return res.json(success("Profile updated successfully", updatedUser));
  } catch (err: any) {
    return res.status(500).json(error("Failed to update profile", err.message));
  }
}
export async function uploadAvatar(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const file = req.file;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json(error("User not found"));
    if (!file) {
      if (user.avatar) {
        const oldPath = path.join(__dirname, "../../", user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
        select: { id: true, name: true, email: true, avatar: true },
      });

      return res.json(success("Avatar removed successfully", updatedUser));
    }

    // Hapus avatar lama
    if (user.avatar) {
      const oldPath = path.join(__dirname, "../../", user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const avatarPath = `/uploads/${file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: { id: true, name: true, email: true, avatar: true },
    });

    return res.json(success("Avatar uploaded successfully", updatedUser));
  } catch (err: any) {
    return res.status(500).json(error("Failed to upload avatar", err.message));
  }
}
