import type { Database } from '@/types/supabase'

export type CursoRow = Database['public']['Tables']['Curso']['Row']
export type CursoInsert = Database['public']['Tables']['Curso']['Insert']
export type CursoUpdate = Database['public']['Tables']['Curso']['Update']

// DTO para crear curso
export interface CreateCursoDto {
  nombre: string
  nivel_id: number
  anio_academico: number
  generacion: number
  capacidad_maxima?: number | null
  profesor_jefe_id?: string | null
}

// DTO para actualizar curso
export interface UpdateCursoDto {
  nombre?: string
  nivel_id?: number
  anio_academico?: number
  generacion?: number
  capacidad_maxima?: number | null
  profesor_jefe_id?: string | null
}

// DTO para asignar profesor jefe
export interface AsignarProfesorJefeDto {
  profesor_jefe_id: string | null
}

// DTO para filtrar cursos
export interface FilterCursoDto {
  nivel_id?: number
  anio_academico?: number
  generacion?: number
}
