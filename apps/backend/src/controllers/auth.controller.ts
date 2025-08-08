import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";
import * as AuthService from "../services/auth.service";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;
    const result = await AuthService.registerUser({ name, email, password });
    // In dev we may return verifyToken to allow manual verify tests
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(error("Validation failed", parsed.error.format()));
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json(error("Invalid credentials"));

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json(error("Invalid credentials"));

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: "15m" });

  return res.json(success("Login successful", { token }));
}
