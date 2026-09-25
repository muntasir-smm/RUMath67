// src/app/admin/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Loader2,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  X,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Facebook,
  User,
  Trash2,
} from "lucide-react";
import { getBloodGroupColor, formatPhone } from "@/lib/utils";

interface Student {
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
  isActive: boolean;
  isAdmin: boolean;
}

const BLOOD_OPTIONS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMPTY_FORM = {
  studentId: "",
  fullName: "",
  phone: "",
  email: "",
  bloodGroup: "",
  fbUrl: "",
  district: "",
  college: "",
  isAdmin: false,
};

export default function AdminPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminName, setAdminName] = useState("");

  const [selected, setSelected] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin?${params}`);
      if (res.status === 403) {
        router.push("/");
        return;
      }
      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      setStudents(data.students || []);
      setAdminName(data.admin?.fullName || "Admin");
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [search, status, router]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 200);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const openCreate = () => {
    setSelected(null);
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (s: Student) => {
    setSelected(null);
    setEditing(s);
    setForm({
      studentId: s.studentId,
      fullName: s.fullName,
      phone: s.phone,
      email: s.email || "",
      bloodGroup: s.bloodGroup || "",
      fbUrl: s.fbUrl || "",
      district: s.district || "",
      college: s.college || "",
      isAdmin: s.isAdmin,
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editing) {
        const res = await fetch(`/api/admin/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Update failed");
          return;
        }
        setSuccess("Student updated successfully");
      } else {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Create failed");
          return;
        }
        setSuccess("Student created successfully");
      }
      setShowForm(false);
      setSelected(null);
      fetchStudents();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Student, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setToggling(s.id);
    try {
      const res = await fetch(`/api/admin/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed");
        return;
      }
      setStudents((prev) =>
        prev.map((st) =>
          st.id === s.id ? { ...st, isActive: !st.isActive } : st,
        ),
      );
      if (selected?.id === s.id) {
        setSelected({ ...s, isActive: !s.isActive });
      }
      setSuccess(
        s.isActive ? `${s.fullName} deactivated` : `${s.fullName} activated`,
      );
      setTimeout(() => setSuccess(""), 2500);
    } catch {
      setError("Network error");
    } finally {
      setToggling(null);
    }
  };

  const handleDeactivateFromDetail = async () => {
    if (!selected) return;
    await toggleActive(selected);
    setSelected(null);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 glass border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-amber-400 transition-smooth"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <h1 className="text-lg font-bold text-slate-100">Admin Panel</h1>
            </div>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Logged in as <span className="text-amber-400">{adminName}</span>
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, phone, district..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
            />
          </div>

          <div className="flex gap-2">
            {["all", "active", "inactive"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-smooth ${
                  status === s
                    ? "bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30"
                    : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-smooth shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-center text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 hidden sm:table-cell">BG</th>
                    <th className="px-4 py-3 hidden lg:table-cell">District</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const bgColor = getBloodGroupColor(s.bloodGroup);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className={`border-b border-slate-800/50 hover:bg-slate-700/40 transition-smooth cursor-pointer group ${
                          !s.isActive ? "opacity-55" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              {s.profilePicture ? (
                                <img
                                  src={s.profilePicture}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 group-hover:border-amber-500/40 transition-smooth"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-2 border-slate-600 group-hover:border-amber-500/40 transition-smooth">
                                  <User className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-100 flex items-center gap-1.5 group-hover:text-amber-300 transition-smooth truncate">
                                {s.fullName}
                                {s.isAdmin && (
                                  <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                )}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {s.studentId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300 hidden md:table-cell font-mono text-lg text-center">
                          {formatPhone(s.phone)}
                        </td>
                        <td className="px-4 py-3 hidden text-center sm:table-cell">
                          {s.bloodGroup ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold text-white ${bgColor}`}
                            >
                              {s.bloodGroup}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 hidden lg:table-cell text-center">
                          {s.district || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={(e) => toggleActive(s, e)}
                            disabled={toggling === s.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-smooth ${
                              s.isActive
                                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                            }`}
                            title={
                              s.isActive
                                ? "Click to deactivate"
                                : "Click to activate"
                            }
                          >
                            {toggling === s.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : s.isActive ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-500 text-right">
              {students.length} student{students.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </main>

      {/* Student Detail Modal */}
      {selected && !showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass rounded-2xl w-full max-w-md shadow-2xl animate-fade-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-5">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-smooth"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center">
                {selected.profilePicture ? (
                  <img
                    src={selected.profilePicture}
                    alt={selected.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/40 shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-4 border-amber-500/40 shadow-xl">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <h2 className="mt-3 text-xl font-bold text-slate-100 text-center flex items-center gap-2">
                  {selected.fullName}
                  {selected.isAdmin && (
                    <Shield className="w-4 h-4 text-amber-400" />
                  )}
                </h2>
                <p className="text-sm text-slate-400 font-mono mt-0.5">
                  {selected.studentId}
                </p>
                {selected.bloodGroup && (
                  <span
                    className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getBloodGroupColor(
                      selected.bloodGroup,
                    )}`}
                  >
                    {selected.bloodGroup}
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 py-5 space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-slate-100">
                    {formatPhone(selected.phone)}
                  </p>
                </div>
              </div>

              {selected.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {selected.email}
                    </p>
                  </div>
                </div>
              )}

              {selected.district && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                      District
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                      {selected.district}
                    </p>
                  </div>
                </div>
              )}

              {selected.college && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                      College
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                      {selected.college}
                    </p>
                  </div>
                </div>
              )}

              {selected.fbUrl && (
                <a
                  href={selected.fbUrl}
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

              <div className="flex items-center justify-center pt-1">
                {selected.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400">
                    <UserCheck className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400">
                    <UserX className="w-3.5 h-3.5" /> Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => openEdit(selected)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition-smooth shadow-lg shadow-amber-500/20"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDeactivateFromDetail}
                disabled={toggling === selected.id}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-smooth ${
                  selected.isActive
                    ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                }`}
              >
                {toggling === selected.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selected.isActive ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
        >
          <div
            className="glass rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
              <h2 className="text-lg font-bold text-slate-100">
                {editing ? "Edit Student" : "Add New Student"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-3">
              {!editing && (
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                    Student ID *
                  </label>
                  <input
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  Phone *
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {BLOOD_OPTIONS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg || "—"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                    District
                  </label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  College
                </label>
                <input
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5">
                  Facebook URL
                </label>
                <input
                  name="fbUrl"
                  type="url"
                  value={form.fbUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={form.isAdmin}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                />
                <Shield className="w-4 h-4 text-amber-400" />
                Make Admin
              </label>

              {error && (
                <div className="px-3 py-2 rounded-xl bg-rose-500/15 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold text-sm transition-smooth shadow-lg shadow-amber-500/20 mt-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? "Update Student" : "Create Student"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
