import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional().or(z.literal("")),
  bloodGroup: z.string().max(8).optional().or(z.literal("")),
  fbUrl: z.string().url().optional().or(z.literal("")),
  district: z.string().max(60).optional().or(z.literal("")),
  college: z.string().max(150).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  profilePicture: z.string().url().optional().or(z.literal("")),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const studentIdNum = parseInt(id, 10);
  if (isNaN(studentIdNum)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await prisma.student.update({
      where: { id: studentIdNum },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone && { phone: data.phone }),
        email: data.email === "" ? null : data.email ?? undefined,
        bloodGroup: data.bloodGroup === "" ? null : data.bloodGroup ?? undefined,
        fbUrl: data.fbUrl === "" ? null : data.fbUrl ?? undefined,
        district: data.district === "" ? null : data.district ?? undefined,
        college: data.college === "" ? null : data.college ?? undefined,
        profilePicture:
          data.profilePicture === "" ? null : data.profilePicture ?? undefined,
        ...(typeof data.isActive === "boolean" && { isActive: data.isActive }),
        ...(typeof data.isAdmin === "boolean" && { isAdmin: data.isAdmin }),
      },
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const studentIdNum = parseInt(id, 10);
  if (isNaN(studentIdNum)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const updated = await prisma.student.update({
      where: { id: studentIdNum },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error("Admin delete error:", error);
    return NextResponse.json({ error: "Failed to deactivate student" }, { status: 500 });
  }
}
