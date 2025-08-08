import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../config/prisma";
import { success, error } from "../utils/response";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(error("Validation failed", parsed.error.format()));
  }

  const { name, email, password } = parsed.data;
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    return res.status(201).json(
      success("User registered successfully", {
        id: user.id,
        email: user.email,
      })
    );
  } catch (err: any) {
    return res.status(500).json(error("Email already exists"));
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
