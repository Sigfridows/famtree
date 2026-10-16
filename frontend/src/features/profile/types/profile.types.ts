export type UserRole = "REGISTERED_USER" | "ASYLUM_ADMIN" | "SYSTEM_ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface User {
  provinceId?: number | null;
  municipalityId?: number | null;
  userId: number;
  assignedAsylumId: number | null;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  description: string | null;
  role: UserRole;
  status: UserStatus;
  requiresPasswordChange: boolean;
  createdAt: string;
}

export interface UpdateProfilePayload {
  provinceId?: number | null;
  municipalityId?: number | null;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  profilePicture?: string | null;
  description?: string | null;
  email?: string;
}
