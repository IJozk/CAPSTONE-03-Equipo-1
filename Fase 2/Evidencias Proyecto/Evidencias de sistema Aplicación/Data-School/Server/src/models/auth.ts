import type { Database } from '@/types/supabase'

type UserRole = Database['public']['Enums']['user_role_enum']

// DTOs para las peticiones de autenticación
export interface RegisterStudentDto {
  email: string
  password: string
  role?: UserRole 
  colegio_id?: string
}

export interface RegisterDto {
  email: string
  password: string
  role?: UserRole 
  colegio_id?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    auth_id: string
    email: string
    role: UserRole
    colegio_id?: string | null
    profile_completed: boolean
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
  auth_id: string
  email: string
  role: UserRole
  colegio_id?: string | null
  profile_completed: boolean
  created_at: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  password: string
}

// DTOs para registro de Profesor
export interface RegisterProfesorDto {
  // Datos de autenticación
  email: string
  password: string
  colegio_id: string

  // Datos del profesor
  nombre_completo: string
  rut?: string
  telefono?: string
  titulo_profesional?: string
  especialidad?: string
  fecha_contratacion?: string
}

// DTOs para registro de Estudiante
export interface RegisterEstudianteDto {
  // Datos de autenticación (opcional, puede ser creado por un apoderado)
  email?: string
  password?: string
  colegio_id: string

  // Datos del estudiante
  nombre_completo: string
  fecha_nacimiento: string
  rut?: string
  telefono?: string
  direccion?: string
  genero?: 'M' | 'F' | 'O'
}

// DTOs para registro de Tutor (sin cuenta de usuario)
export interface RegisterTutorDto {
  // NO tiene datos de autenticación

  // Datos del tutor
  nombre_completo: string
  rut?: string
  telefono?: string
  email?: string
  direccion?: string
  ocupacion?: string
  telefono_emergencia?: string

  // Relación con estudiante (tabla Parentesco)
  estudiante_id: string
  tipo_parentesco_id: number
  es_tutor_titular?: boolean
  es_contacto_emergencia?: boolean
  puede_retirar?: boolean
}

// DTOs para registro de Administrativo
export interface RegisterAdministrativoDto {
  // Datos de autenticación
  email: string
  password: string
  role: 'ADMINISTRATIVO' | 'DIRECTOR' | 'ADMINISTRADOR'
  colegio_id: string

  // Datos del administrativo
  nombre_completo: string
  cargo?: string
  rut?: string
  telefono?: string
  area_id: number // ID del área administrativa
  fecha_contratacion?: string
}

export interface ListStudents{
  id: string
  nombre_completo: string
  rut: string
  fecha_nacimiento: string
  genero: string
  direccion: string
  telefono: string
  curso_id: string
  colegio_id: string
  created_at: string
}
