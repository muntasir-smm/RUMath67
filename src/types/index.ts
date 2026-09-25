// src/types/index.ts

export interface PublicStudent {
  id: number;
  studentId: string;
  fullName: string;
  bloodGroup: string | null;
  fbUrl: string | null;
  profilePicture: string | null;
}

export interface FullStudent extends PublicStudent {
  phone: string;
  email: string | null;
  district: string | null;
  college: string | null;
  updatedAt: string;
}

export interface SessionUser {
  studentId: string;
  fullName: string;
}
