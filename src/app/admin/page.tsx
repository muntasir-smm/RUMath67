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
} from "lucide-react";

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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (s: Student) => {
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
    setShowModal(true);
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
        // Update
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
        // Create
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
      setShowModal(false);
      fetchStudents();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Student) => {
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
      fetchStudents();
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
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
        {/* Toolbar */}
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
                    ? "bg-amber-500 text-slate-900"
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
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-left text-xs text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 hidden lg:table-cell">BG</th>
                    <th className="px-4 py-3 hidden lg:table-cell">District</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className={`border-b border-slate-800/50 hover:bg-slate-800/40 transition-smooth ${
                        !s.isActive ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.profilePicture ? (
                            <img
                              src={s.profilePicture}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                              {s.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-100 flex items-center gap-1.5">
                              {s.fullName}
                              {s.isAdmin && (
                                <span title="Admin">
                                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {s.studentId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 hidden md:table-cell font-mono text-xs">
                        {s.phone}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {s.bloodGroup && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-700 text-xs">
                            {s.bloodGroup}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">
                        {s.district || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {s.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <UserCheck className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-400">
                            <UserX className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-smooth"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(s)}
                            className={`p-2 rounded-lg hover:bg-slate-700 transition-smooth ${
                              s.isActive
                                ? "text-slate-400 hover:text-rose-400"
                                : "text-slate-400 hover:text-emerald-400"
                            }`}
                            title={s.isActive ? "Deactivate" : "Activate"}
                          >
                            {s.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-500">
              {students.length} student{students.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="glass rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-lg font-bold text-slate-100">
                {editing ? "Edit Student" : "Add New Student"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-3">
              {!editing && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Student ID *
                  </label>
                  <input
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Phone *
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {BLOOD_OPTIONS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg || "—"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    District
                  </label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  College
                </label>
                <input
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Facebook URL
                </label>
                <input
                  name="fbUrl"
                  type="url"
                  value={form.fbUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAdmin"
                  checked={form.isAdmin}
                  onChange={handleChange}
                  className="rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                />
                Make Admin
              </label>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-rose-500/15 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold text-sm transition-smooth"
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
