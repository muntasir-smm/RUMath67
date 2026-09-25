// src/components/Header.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogIn, LogOut, User, Users, Shield } from "lucide-react";

interface SessionUser {
  studentId: string;
  fullName: string;
}

export default function Header({
  session,
  onLogout,
}: {
  session: SessionUser | null;
  onLogout: () => void;
}) {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Top row: Date / Title / Time */}

        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span className="font-mono tracking-wide">{dateStr}</span>
          <span className="font-mono tracking-wide">{timeStr}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent tracking-tight">
                MATHEMATICS 67
              </h1>
              <p className="text-xs text-slate-400 -mt-0.5">
                University of Rajshahi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-600/80 text-sm transition-smooth"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline max-w-[140px] truncate">
                    {session.fullName}
                  </span>
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/60 hover:bg-amber-500/20 text-sm text-amber-400 transition-smooth"
                  title="Admin Panel"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-sm transition-smooth"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-smooth shadow-lg shadow-amber-500/20"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
