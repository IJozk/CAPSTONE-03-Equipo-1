// Tipos para Cursos
import { Nivel } from './utils.types'

export interface ProfesorJefe {
  profesor_id: string
  nombre_completo: string
  rut: string
  telefono: string
}

export interface Curso {
  curso_id: string
  nombre: string
  nivel_id: number
  anio_academico: number
  generacion: number
  capacidad_maxima?: number | null
  profesor_jefe_id?: string | null
  created_at?: string | null
  updated_at?: string | null
  nivel_obj: Nivel
  profesor_jefe?: ProfesorJefe
}

/**
 * Curso con información completa del nivel
 * Útil para vistas que necesitan mostrar el nombre del nivel
 */
export interface CursoConNivel extends Curso {
  nivel_obj: Nivel
}

export interface CreateCursoDTO {
  nombre: string
  nivel_id: number
  anio_academico: number
  generacion: number
  capacidad_maxima?: number | null
  profesor_jefe_id?: string | null
}

export interface UpdateCursoDTO {
  nombre?: string
  nivel_id?: number
  anio_academico?: number
  generacion?: number
  capacidad_maxima?: number | null
  profesor_jefe_id?: string | null
}

export interface AsignarProfesorJefeDTO {
  profesor_jefe_id: string | null
}

export interface FilterCursoDTO {
  nivel_id?: number
  anio_academico?: number
  generacion?: number
}

export interface CursoResponse {
  message: string
  data: Curso | Curso[]
  count?: number
}

export interface CursoStats {
  curso: Curso
  total_asignaturas: number
  total_estudiantes: number
  capacidad_disponible: number | null
}

// Estado del store
export interface CursoState {
  cursos: Curso[]
  currentCurso: Curso | null
  loading: boolean
  error: string | null
  filters: FilterCursoDTO
}
