// src/app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional().or(z.literal("")),
  bloodGroup: z.string().max(8).optional().or(z.literal("")),
  fbUrl: z.string().url().optional().or(z.literal("")),
  district: z.string().max(60).optional().or(z.literal("")),
  college: z.string().max(150).optional().or(z.literal("")),
  profilePicture: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { studentId: session.studentId },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ student });
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const updated = await prisma.student.update({
      where: { studentId: session.studentId },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone && { phone: data.phone }),
        email: data.email === "" ? null : (data.email ?? undefined),
        bloodGroup:
          data.bloodGroup === "" ? null : (data.bloodGroup ?? undefined),
        fbUrl: data.fbUrl === "" ? null : (data.fbUrl ?? undefined),
        district: data.district === "" ? null : (data.district ?? undefined),
        college: data.college === "" ? null : (data.college ?? undefined),
        profilePicture:
          data.profilePicture === ""
            ? null
            : (data.profilePicture ?? undefined),
      },
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
