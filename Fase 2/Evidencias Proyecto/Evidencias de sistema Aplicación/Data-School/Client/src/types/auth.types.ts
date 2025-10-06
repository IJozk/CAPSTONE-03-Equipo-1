// Roles del sistema (deben coincidir exactamente con el backend)
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  DIRECTOR = 'DIRECTOR',
  UTP = 'UTP',
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

// DTO para registro de usuarios
export interface RegisterDTO {
  email: string;
  password: string;
  confirmPassword?: string; // Solo para frontend
  role: UserRole;
  nombre_completo: string;
  rut: string;
  colegio_id: string;
  telefono?: string;
}

// Errores de validación para formulario de registro
export interface RegisterValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nombre_completo?: string;
  rut?: string;
  role?: string;
  colegio_id?: string;
  telefono?: string;
}

// Opciones para select de roles
export interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
}

// Estado de registro en el store
export interface RegisterState {
  loading: boolean;
  error: string | null;
  success: boolean;
  registeredUser: User | null;
}

// DTO para solicitar recuperación de contraseña
export interface ForgotPasswordDTO {
  email: string;
}

// DTO para restablecer contraseña
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  confirmPassword?: string; // Solo para frontend
}

// Respuesta de solicitud de recuperación
export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

// Respuesta de restablecimiento de contraseña
export interface ResetPasswordResponse {
  message: string;
}

// Estado de forgot password en el store
export interface ForgotPasswordState {
  loading: boolean;
  success: boolean;
  error: string | null;
  cooldownSeconds: number;
}

// Estado de reset password en el store
export interface ResetPasswordState {
  loading: boolean;
  success: boolean;
  error: string | null;
  tokenValid: boolean | null;
  redirectCountdown: number;
}
