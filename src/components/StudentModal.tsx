"use client";

import { X, Phone, Mail, MapPin, GraduationCap, Facebook, Copy, Check, User } from "lucide-react";
import { useState } from "react";
import { formatPhone, getBloodGroupColor } from "@/lib/utils";

interface FullStudent {
  id: number;
  studentId: string;
  fullName: string;
  phone: string;
  email: string | null;
  bloodGroup: string | null;
  fbUrl: string | null;
  district: string | null;
  college: string | null;
  profilePicture: string | null;
  updatedAt?: string;
}

export default function StudentModal({
  student,
  onClose,
}: {
  student: FullStudent;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const bgColor = getBloodGroupColor(student.bloodGroup);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with avatar */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-smooth"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center">
            {student.profilePicture ? (
              <img
                src={student.profilePicture}
                alt={student.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/40 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-4 border-amber-500/40 shadow-xl">
                <User className="w-10 h-10 text-slate-400" />
              </div>
            )}
            <h2 className="mt-3 text-xl font-bold text-slate-100 text-center">
              {student.fullName}
            </h2>
            <p className="text-sm text-slate-400 font-mono mt-0.5">
              {student.studentId}
            </p>
            {student.bloodGroup && (
              <span
                className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${bgColor}`}
              >
                {student.bloodGroup}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-3">
          {/* Phone */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                Phone
              </p>
              <p className="text-sm font-medium text-slate-100">
                {formatPhone(student.phone)}
              </p>
            </div>
            <button
              onClick={() => copy(student.phone, "phone")}
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-smooth"
            >
              {copied === "phone" ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Email */}
          {student.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Email
                </p>
                <p className="text-sm font-medium text-slate-100 truncate">
                  {student.email}
                </p>
              </div>
              <button
                onClick={() => copy(student.email!, "email")}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-smooth"
              >
                {copied === "email" ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* District */}
          {student.district && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
              <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                  District
                </p>
                <p className="text-sm font-medium text-slate-100">
                  {student.district}
                </p>
              </div>
            </div>
          )}

          {/* College */}
          {student.college && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                  College
                </p>
                <p className="text-sm font-medium text-slate-100">
                  {student.college}
                </p>
              </div>
            </div>
          )}

          {/* Facebook */}
          {student.fbUrl && (
            <a
              href={student.fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 transition-smooth"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/30 flex items-center justify-center">
                <Facebook className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Facebook
                </p>
                <p className="text-sm font-medium text-blue-300">
                  Open Profile →
                </p>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
