import { randomBytes } from "crypto";
import prisma from "../config/prisma";
import { sha256 } from "../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function createTokensAndSetCookies(res: any, userId: number) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  const tokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(oldRefreshToken: string, res: any) {
  const payload: any = verifyRefreshToken(oldRefreshToken) as any;
  const userId = Number(payload.sub);

  const hash = sha256(oldRefreshToken);
  const rec = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
  if (!rec || rec.userId !== userId || rec.expiresAt < new Date()) {
    throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
  }
  await prisma.refreshToken.delete({ where: { id: rec.id } });

  return createTokensAndSetCookies(res, userId);
}

export async function revokeRefreshToken(refreshToken: string) {
  const hash = sha256(refreshToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
}

export async function revokeAllUserRefreshTokens(userId: number) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
