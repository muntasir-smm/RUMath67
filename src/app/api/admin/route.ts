// src/app/api/admin/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

// GET /api/admin  → list all students (admin only)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim() || "";
  const status = searchParams.get("status") || "all"; // all | active | inactive

  const where: any = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { studentId: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { district: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const students = await prisma.student.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
  });

  return NextResponse.json({ students, admin });
}

const createSchema = z.object({
  studentId: z.string().min(5).max(20),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal("")),
  bloodGroup: z.string().max(8).optional().or(z.literal("")),
  fbUrl: z.string().url().optional().or(z.literal("")),
  district: z.string().max(60).optional().or(z.literal("")),
  college: z.string().max(150).optional().or(z.literal("")),
  isAdmin: z.boolean().optional(),
});

// POST /api/admin  → create new student
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Check duplicate studentId
    const exists = await prisma.student.findUnique({
      where: { studentId: data.studentId },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Student ID already exists" },
        { status: 409 },
      );
    }

    const student = await prisma.student.create({
      data: {
        studentId: data.studentId.trim(),
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email || null,
        bloodGroup: data.bloodGroup || null,
        fbUrl: data.fbUrl || null,
        district: data.district || null,
        college: data.college || null,
        isAdmin: data.isAdmin || false,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error) {
    console.error("Admin create error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
