"use client";

import { Search, X } from "lucide-react";

const BLOOD_GROUPS = ["all", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function SearchBar({
  search,
  setSearch,
  bloodGroup,
  setBloodGroup,
  total,
}: {
  search: string;
  setSearch: (v: string) => void;
  bloodGroup: string;
  setBloodGroup: (v: string) => void;
  total: number;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, district, college..."
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-smooth"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">Blood Group:</span>
        {BLOOD_GROUPS.map((bg) => (
          <button
            key={bg}
            onClick={() => setBloodGroup(bg)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-smooth ${
              bloodGroup === bg
                ? "bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30"
                : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/80"
            }`}
          >
            {bg === "all" ? "All" : bg}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          {total} student{total !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
