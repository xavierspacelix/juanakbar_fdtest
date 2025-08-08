import nodemailer from "nodemailer";

export async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // dev fallback to ethereal
  const account = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: { user: account.user, pass: account.pass },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const transporter = await createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@example.com",
    to,
    subject,
    text,
    html,
  });
  // For development with ethereal, show preview url in logs
  if (process.env.NODE_ENV !== "production") {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log("Preview URL (ethereal):", url);
  }
  return info;
}
