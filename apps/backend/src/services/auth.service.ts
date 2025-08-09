import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { sha256 } from "../utils/hash";
import { sendEmail } from "../utils/mailer";
import { emailTemplate } from "../utils/email-template";

const BCRYPT_ROUNDS = 12;
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  // check email exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err: any = new Error("Email already exists");
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, email: true, name: true },
  });

  // create verification token (store hash)
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  await prisma.emailVerification.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  // Build verify url
  const verifyUrl = `${process.env.APP_FRONTEND_URL}/api/auth/verify-email?token=${token}&id=${user.id}`;

  // send email (async)
  await sendEmail({
    to: user.email,
    subject: "Please verify your email",
    text: `Click to verify: ${verifyUrl}`,
    html: emailTemplate({
      title: "Please verify your email",
      greeting: "Hi there!",
      message: `Thank you for signing up. Please verify your email to activate your account.`,
      buttonText: "Verify Email",
      buttonUrl: verifyUrl,
    }),
  });

  // For dev convenience only: return token in response when not production
  const payload: any = { id: user.id, email: user.email, name: user.name };
  if (process.env.NODE_ENV !== "production") {
    return { user: payload, verifyToken: token };
  }
  return { user: payload };
}

export async function verifyEmail({ id, token }: { id: number; token: string }) {
  const tokenHash = sha256(token);
  const rec = await prisma.emailVerification.findFirst({
    where: { userId: id, tokenHash },
  });
  if (!rec) {
    const err: any = new Error("Invalid verification token");
    err.status = 400;
    throw err;
  }
  if (rec.expiresAt < new Date()) {
    const err: any = new Error("Verification token expired");
    err.status = 400;
    throw err;
  }

  // mark verified and remove record
  await prisma.user.update({ where: { id }, data: { emailVerified: new Date() } });
  await prisma.emailVerification.delete({ where: { id: rec.id } });

  return true;
}
