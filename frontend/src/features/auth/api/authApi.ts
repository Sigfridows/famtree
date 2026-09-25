import { apiClient } from '@/lib/apiClient';
import { UserProfile, LoginCredentials, RegisterData } from '../types';

export const authApi = {
  // Obtener sesión activa desde la cookie HttpOnly
  getSession: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/auth/session');
    return data;
  },

  // Iniciar sesión
  login: async (credentials: LoginCredentials): Promise<UserProfile> => {
    const { data } = await apiClient.post<UserProfile>('/auth/login', credentials);
    return data;
  },

  // Registrar usuario
  register: async (registerData: RegisterData): Promise<UserProfile> => {
    const { data } = await apiClient.post<UserProfile>('/auth/register', registerData);
    return data;
  },

  // Cerrar sesión (destruye la cookie)
  logout: async (): Promise<void> => {
    await apiClient.post<void>('/auth/logout');
  },
};