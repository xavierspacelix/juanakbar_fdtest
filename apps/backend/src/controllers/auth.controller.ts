import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";
import * as AuthService from "../services/auth.service";
import {
  signAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from "../services/token.service";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const result = await AuthService.registerUser({ name, email, password });
    return res
      .status(201)
      .json(success("User registered. Check your email for verification.", result));
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json(error(err.message || "Registration failed"));
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const id = Number(req.query.id);
    const token = String(req.query.token || "");
    if (!id || !token) return res.status(400).json(error("Missing id or token"));

    await AuthService.verifyEmail({ id, token });
    return res.json(success("Email verified successfully"));
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json(error(err.message || "Verification failed"));
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json(error("Invalid credentials"));

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json(error("Invalid credentials"));

    const accessToken = signAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    // Simpan refresh token di HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json(success("Login successful", { accessToken }));
  } catch (err: any) {
    return res.status(500).json(error(err.message || "Login failed"));
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json(error("No refresh token"));

    const userId = await verifyRefreshToken(token);
    if (!userId) return res.status(401).json(error("Invalid refresh token"));

    const newAccessToken = signAccessToken(userId);
    return res.json(success("Access token refreshed", { accessToken: newAccessToken }));
  } catch (err: any) {
    return res.status(500).json(error("Failed to refresh token"));
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await revokeRefreshToken(token);
      res.clearCookie("refreshToken");
    }
    return res.json(success("Logged out successfully"));
  } catch (err: any) {
    return res.status(500).json(error("Logout failed"));
  }
}
