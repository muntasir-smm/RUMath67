// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, "students_data.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const students = JSON.parse(raw) as Array<{
    student_id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    blood_group: string | null;
    fb_url: string | null;
    district: string | null;
    college: string | null;
  }>;

  console.log(`Seeding ${students.length} students...`);

  // Clear existing data
  await prisma.student.deleteMany();

  for (const s of students) {
    if (!s.student_id || !s.full_name) continue;

    await prisma.student.create({
      data: {
        studentId: s.student_id,
        fullName: s.full_name,
        phone: s.phone || "00000000000",
        email: s.email || null,
        bloodGroup: s.blood_group || null,
        fbUrl: s.fb_url || null,
        district: s.district || null,
        college: s.college || null,
      },
    });
  }

  const count = await prisma.student.count();
  console.log(`✅ Successfully seeded ${count} students.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
