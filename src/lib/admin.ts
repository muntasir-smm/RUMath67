// src/lib/admin.ts

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the current student if they are an admin, otherwise null.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;

  const student = await prisma.student.findUnique({
    where: { studentId: session.studentId },
    select: {
      id: true,
      studentId: true,
      fullName: true,
      isAdmin: true,
      isActive: true,
    },
  });

  if (!student || !student.isActive || !student.isAdmin) {
    return null;
  }

  return student;
}
