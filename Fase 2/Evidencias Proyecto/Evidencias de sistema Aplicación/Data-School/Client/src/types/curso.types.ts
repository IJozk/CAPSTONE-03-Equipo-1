// Tipos para Cursos

export interface Curso {
  curso_id: string
  nombre: string
  nivel: string
  anio_academico: number
  generacion: number
  capacidad_maxima?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CreateCursoDTO {
  nombre: string
  nivel: string
  anio_academico: number
  generacion: number
  capacidad_maxima?: number | null
}

export interface UpdateCursoDTO {
  nombre?: string
  nivel?: string
  anio_academico?: number
  generacion?: number
  capacidad_maxima?: number | null
}

export interface FilterCursoDTO {
  nivel?: string
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
