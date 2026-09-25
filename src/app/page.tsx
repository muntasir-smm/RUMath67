// src/app/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import StudentCard from "@/components/StudentCard";
import StudentModal from "@/components/StudentModal";
import { Loader2 } from "lucide-react";

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  phone?: string;
  email?: string | null;
  bloodGroup: string | null;
  fbUrl: string | null;
  district?: string | null;
  college?: string | null;
  profilePicture: string | null;
  updatedAt?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState<{
    studentId: string;
    fullName: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Student | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (bloodGroup !== "all") params.set("bg", bloodGroup);

      const res = await fetch(`/api/students?${params}`);
      const data = await res.json();
      setStudents(data.students || []);
      setIsLoggedIn(data.isLoggedIn);

      if (data.isLoggedIn) {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setSession({
            studentId: profile.student.studentId,
            fullName: profile.student.fullName,
          });
        }
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, bloodGroup]);

  useEffect(() => {
    const timer = setTimeout(fetchStudents, 250);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setIsLoggedIn(false);
    setSelected(null);
    fetchStudents();
  };

  const handleCardClick = (student: Student) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setSelected(student);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header session={session} onLogout={handleLogout} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <SearchBar
          search={search}
          setSearch={setSearch}
          bloodGroup={bloodGroup}
          setBloodGroup={setBloodGroup}
          total={students.length}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
            <p>Loading classmates...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-lg">No students found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {students.map((s) => (
              <StudentCard
                key={s.id}
                student={s}
                isLoggedIn={isLoggedIn}
                onClick={() => handleCardClick(s)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        Mathematics Batch 67 · University of Rajshahi · Private Class Directory
      </footer>

      {selected && isLoggedIn && (
        <StudentModal
          student={selected as any}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
