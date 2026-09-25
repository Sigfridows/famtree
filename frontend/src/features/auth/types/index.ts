export type UserRole = 'SYSTEM_ADMIN' | 'ASYLUM_ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING';

export interface UserProfile {
  userId: string;
  assignedAsylumId?: string | null;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string | null;
  profilePicture?: string | null;
  description?: string | null;
  role: UserRole;
  status: UserStatus;
  requiresPasswordChange: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string; // Si en FastAPI el schema Login usa 'password', de lo contrario usa 'password_hash'
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
}