import type { Database } from '@/types/supabase'

export type AsignaturaRow = Database['public']['Tables']['Asignatura']['Row']
export type AsignaturaInsert = Database['public']['Tables']['Asignatura']['Insert']
export type AsignaturaUpdate = Database['public']['Tables']['Asignatura']['Update']

// DTO para crear asignatura
export interface CreateAsignaturaDto {
  codigo: string
  nombre: string
  descripcion?: string | null
  curso_id: string
  profesor_id: string
  periodo: string
  horas_semanales?: number | null
  creditos?: number | null
  sala_id?: string | null
  tipo_asignatura_id?: number | null
  estado_activo?: boolean
}

// DTO para actualizar asignatura
export interface UpdateAsignaturaDto {
  codigo?: string
  nombre?: string
  descripcion?: string | null
  curso_id?: string
  profesor_id?: string
  periodo?: string
  horas_semanales?: number | null
  creditos?: number | null
  sala_id?: string | null
  tipo_asignatura_id?: number | null
  estado_activo?: boolean
}

// DTO para filtrar asignaturas
export interface FilterAsignaturaDto {
  curso_id?: string
  profesor_id?: string
  periodo?: string
  estado_activo?: boolean
  tipo_asignatura_id?: number
}
