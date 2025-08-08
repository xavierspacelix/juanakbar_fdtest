import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { sha256 } from "../utils/hash";
import { sendEmail } from "../utils/mailer";

const BCRYPT_ROUNDS = 12;
const RESET_TTL_MS = 60 * 60 * 1000; // 1 jam

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // tidak bocorkan info user tidak ditemukan

  // hapus token reset lama (opsional)
  await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prisma.passwordReset.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}&id=${user.id}`;

  await sendEmail({
    to: user.email,
    subject: "Reset Your Password",
    text: `Click to reset your password: ${resetUrl}`,
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });

  // untuk dev, return token supaya bisa test tanpa email
  if (process.env.NODE_ENV !== "production") {
    return { resetToken: token };
  }
}

export async function resetPassword(userId: number, token: string, newPassword: string) {
  const tokenHash = sha256(token);
  const record = await prisma.passwordReset.findFirst({ where: { userId, tokenHash } });

  if (!record) throw new Error("Invalid or expired token");
  if (record.expiresAt < new Date()) throw new Error("Token expired");

  const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  await prisma.passwordReset.delete({ where: { id: record.id } });
}
