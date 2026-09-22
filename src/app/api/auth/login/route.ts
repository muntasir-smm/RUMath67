import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  studentId: z.string().min(5).max(20),
  phone: z.string().min(10).max(15),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Please check Student ID and Phone." },
        { status: 400 }
      );
    }

    const result = await login(parsed.data.studentId, parsed.data.phone);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      student: {
        studentId: result.student!.studentId,
        fullName: result.student!.fullName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
