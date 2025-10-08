import type { Database } from '@/types/supabase'

export type CursoRow = Database['public']['Tables']['Curso']['Row']
export type CursoInsert = Database['public']['Tables']['Curso']['Insert']
export type CursoUpdate = Database['public']['Tables']['Curso']['Update']

// DTO para crear curso
export interface CreateCursoDto {
  nombre: string
  nivel: string
  anio_academico: number
  generacion: number
  capacidad_maxima?: number | null
}

// DTO para actualizar curso
export interface UpdateCursoDto {
  nombre?: string
  nivel?: string
  anio_academico?: number
  generacion?: number
  capacidad_maxima?: number | null
}

// DTO para filtrar cursos
export interface FilterCursoDto {
  nivel?: string
  anio_academico?: number
  generacion?: number
}
