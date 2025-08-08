import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { success, error } from "../utils/response";
import path from "path";
import fs from "fs";

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

    if (!file) return res.status(400).json(error("Avatar file is required"));

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json(error("User not found"));

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
