// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBloodGroupColor(bg: string | null | undefined): string {
  if (!bg) return "bg-slate-500";
  const upper = bg.toUpperCase();
  if (upper.includes("O")) return "bg-emerald-600";
  if (upper.includes("A") && !upper.includes("AB")) return "bg-blue-600";
  if (upper.includes("B") && !upper.includes("AB")) return "bg-violet-600";
  if (upper.includes("AB")) return "bg-rose-600";
  return "bg-slate-500";
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}
