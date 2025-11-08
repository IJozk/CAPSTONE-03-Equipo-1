// Tipos para Asignaturas

export interface Asignatura {
  asignatura_id: string
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
  estado_activo: boolean
  created_at?: string | null
  updated_at?: string | null

  // Relaciones expandidas (cuando se hace join)
  Curso?: {
    curso_id: string
    nombre: string
    nivel_id: number
    paralelo?: string
  }
  Profesor?: {
    profesor_id: string
    nombre_completo: string
    email?: string
    telefono?: string
  }
  Sala?: {
    sala_id: string
    nombre: string
    capacidad?: number
    edificio?: string
  }
  TipoAsignatura?: {
    tipo_asignatura_id: number
    nombre: string
    descripcion?: string
  }
}

export interface CreateAsignaturaDTO {
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

export interface UpdateAsignaturaDTO {
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

export interface FilterAsignaturaDTO {
  curso_id?: string
  profesor_id?: string
  periodo?: string
  estado_activo?: boolean
  tipo_asignatura_id?: number
}

export interface AsignaturaResponse {
  message: string
  data: Asignatura | Asignatura[]
  count?: number
}

// Estado del store
export interface AsignaturaState {
  asignaturas: Asignatura[]
  currentAsignatura: Asignatura | null
  loading: boolean
  error: string | null
  filters: FilterAsignaturaDTO
}
