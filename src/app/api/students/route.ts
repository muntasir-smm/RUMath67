import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q")?.trim() || "";
    const bloodGroup = searchParams.get("bg")?.trim() || "";

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { studentId: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
        { college: { contains: search, mode: "insensitive" } },
      ];
    }

    if (bloodGroup && bloodGroup !== "all") {
      where.bloodGroup = { equals: bloodGroup, mode: "insensitive" };
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { fullName: "asc" },
      select: session
        ? {
            id: true,
            studentId: true,
            fullName: true,
            phone: true,
            email: true,
            bloodGroup: true,
            fbUrl: true,
            district: true,
            college: true,
            profilePicture: true,
            updatedAt: true,
          }
        : {
            id: true,
            studentId: true,
            fullName: true,
            bloodGroup: true,
            fbUrl: true,
            profilePicture: true,
          },
    });

    return NextResponse.json({ students, isLoggedIn: !!session });
  } catch (error) {
    console.error("Students fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load students" },
      { status: 500 }
    );
  }
}
