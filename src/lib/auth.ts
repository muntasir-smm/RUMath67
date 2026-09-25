// src/lib/auth.ts

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const COOKIE_NAME = "math67_session";

export interface SessionPayload {
  studentId: string;
  fullName: string;
  exp: number;
}

export async function createSession(studentId: string, fullName: string) {
  const token = await new SignJWT({ studentId, fullName })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function login(studentId: string, phone: string) {
  const student = await prisma.student.findUnique({
    where: { studentId: studentId.trim() },
  });

  if (!student || !student.isActive) {
    return { success: false, error: "Invalid Student ID or Phone Number" };
  }

  // Simple phone match (normalize by removing spaces/dashes)
  const cleanPhone = (p: string) => p.replace(/[\s\-]/g, "");
  if (cleanPhone(student.phone) !== cleanPhone(phone.trim())) {
    return { success: false, error: "Invalid Student ID or Phone Number" };
  }

  await createSession(student.studentId, student.fullName);
  return { success: true, student };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
