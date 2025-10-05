import type { Database } from '@/types/supabase'

type UserRole = Database['public']['Enums']['user_role_enum']

// DTOs para las peticiones de autenticación
export interface RegisterDto {
  email: string
  password: string
  role?: UserRole // Rol opcional, por defecto será ESTUDIANTE
  colegio_id?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    created_at: string
  }
  session: {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
  }
}

export interface UserResponse {
  id: string
  email: string
  created_at: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  password: string
}
