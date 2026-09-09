import nodemailer from "nodemailer";
import { site } from "@/lib/site";

/** SMTP 설정(.env)이 있을 때만 발송. 없으면 조용히 건너뛴다. */
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  if (!host || !to) return false;
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER || `noreply@${new URL(site.siteUrl).hostname}`, to, subject, text });
  return true;
}
