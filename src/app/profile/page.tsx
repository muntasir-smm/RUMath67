"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Camera,
  CheckCircle2,
  Upload,
  X,
} from "lucide-react";

interface StudentProfile {
  studentId: string;
  fullName: string;
  phone: string;
  email: string | null;
  bloodGroup: string | null;
  fbUrl: string | null;
  district: string | null;
  college: string | null;
  profilePicture: string | null;
}

const BLOOD_OPTIONS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<Partial<StudentProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setProfile(data.student);
        setForm(data.student);
        setPreview(data.student.profilePicture);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
        file.type,
      )
    ) {
      setError("Only JPG, PNG or WebP images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2 MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setPreview(form.profilePicture || null);
        return;
      }

      setForm((prev) => ({ ...prev, profilePicture: data.url }));
      setPreview(data.url);
      setSuccess(false);
    } catch {
      setError("Network error while uploading. Please try again.");
      setPreview(form.profilePicture || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePicture = () => {
    setForm((prev) => ({ ...prev, profilePicture: "" }));
    setPreview(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }

      setProfile(data.student);
      setForm(data.student);
      setPreview(data.student.profilePicture);
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-6 transition-smooth"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to directory
        </Link>

        <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-amber-500/40 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-4 border-amber-500/40 shadow-xl">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change photo"
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center shadow-lg transition-smooth"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 text-slate-900 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-slate-900" />
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-smooth"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>

              {preview && (
                <button
                  type="button"
                  onClick={removePicture}
                  className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-smooth"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-1.5">
              JPG, PNG or WebP · Max 2 MB
            </p>

            <h1 className="mt-4 text-xl font-bold text-slate-100">
              Edit My Profile
            </h1>
            <p className="text-sm text-slate-400 font-mono">
              {profile.studentId}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={form.bloodGroup || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              >
                {BLOOD_OPTIONS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg || "Select..."}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                Facebook Profile URL
              </label>
              <input
                type="url"
                name="fbUrl"
                value={form.fbUrl || ""}
                onChange={handleChange}
                placeholder="https://www.facebook.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                District
              </label>
              <input
                type="text"
                name="district"
                value={form.district || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                College
              </label>
              <input
                type="text"
                name="college"
                value={form.college || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold transition-smooth shadow-lg shadow-amber-500/25 mt-2"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
