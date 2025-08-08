import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { sha256 } from "../utils/hash";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const ACCESS_TOKEN_TTL = "15m";

export function signAccessToken(userId: number) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_TTL });
}

export async function createRefreshToken(userId: number) {
  const token = randomBytes(40).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  return token;
}

export async function verifyRefreshToken(token: string) {
  const tokenHash = sha256(token);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!record || record.expiresAt < new Date()) return null;
  return record.userId;
}

export async function revokeRefreshToken(token: string) {
  const tokenHash = sha256(token);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}
