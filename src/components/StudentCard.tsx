// src/components/StudentCard.tsx

"use client";

import { Facebook, User } from "lucide-react";
import { getBloodGroupColor } from "@/lib/utils";

interface StudentCardProps {
  student: {
    id: number;
    studentId: string;
    fullName: string;
    bloodGroup: string | null;
    fbUrl: string | null;
    profilePicture: string | null;
  };
  isLoggedIn: boolean;
  onClick: () => void;
}

export default function StudentCard({
  student,
  isLoggedIn,
  onClick,
}: StudentCardProps) {
  const bgColor = getBloodGroupColor(student.bloodGroup);

  return (
    <div
      onClick={onClick}
      className="group glass rounded-2xl p-4 cursor-pointer hover:bg-slate-700/50 hover:border-amber-500/30 transition-smooth animate-fade-in hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {student.profilePicture ? (
            <img
              src={student.profilePicture}
              alt={student.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-600 group-hover:border-amber-500/50 transition-smooth"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-2 border-slate-600 group-hover:border-amber-500/50 transition-smooth">
              <User className="w-6 h-6 text-slate-400" />
            </div>
          )}
          {student.bloodGroup && (
            <span
              className={`absolute -bottom-1 -right-1 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md shadow ${bgColor}`}
            >
              {student.bloodGroup}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 truncate group-hover:text-amber-300 transition-smooth">
            {student.fullName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            {isLoggedIn ? student.studentId : "••••••••••"}
          </p>
        </div>

        {/* FB Link */}
        {student.fbUrl && (
          <a
            href={student.fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600/20 hover:bg-blue-600/40 flex items-center justify-center text-blue-400 transition-smooth"
            title="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
        )}
      </div>

      {!isLoggedIn && (
        <p className="mt-3 text-[11px] text-slate-500 text-center border-t border-slate-700/50 pt-2">
          Login to view full details
        </p>
      )}
    </div>
  );
}
