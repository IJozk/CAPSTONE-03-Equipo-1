// Roles del sistema (deben coincidir exactamente con el backend)
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  DIRECTOR = 'DIRECTOR',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
  PROFESOR = 'PROFESOR',
  ESTUDIANTE_APODERADO = 'ESTUDIANTE_APODERADO'
}

// Datos del usuario autenticado
export interface User {
  user_id: string;
  email_address: string;
  role: UserRole;
  profile_completed: boolean;
  colegio_id: string | null;
  nombre_completo?: string;
}

// Credenciales para login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Respuesta exitosa del backend al hacer login
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// Estado global de autenticación en Pinia
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Errores de validación del formulario de login
export interface ValidationErrors {
  email?: string;
  password?: string;
}
