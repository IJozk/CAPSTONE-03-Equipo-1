// src/types/taller.types.ts

// Horario que usa el formulario en el front
export interface TallerHorarioForm {
  dia_semana: string
  hora_inicio: string   // "HH:MM"
  hora_termino: string  // "HH:MM"
}

// Coincide con la tabla Taller de Supabase + relaciones que trae tu backend
export interface Taller {
  taller_id: string
  nombre: string
  descripcion: string | null
  profesor_encargado_id: string | null
  sala_id: string | null
  horario: string | null
  capacidad_maxima: number | null
  costo_adicional: number | null
  estado_activo: boolean | null
  created_at: string | null
  fecha_inicio: string | null     // "YYYY-MM-DD" o null
  fecha_termino: string | null    // "YYYY-MM-DD" o null

  // Relaciones que tu backend ya trae en getAll / getById
  Profesor?: {
    profesor_id: string
    nombre_completo: string
    telefono?: string | null
    email?: string | null
  } | null

  Sala?: {
    sala_id: string
    nombre: string
    capacidad?: number | null
    Zona?: {
      nombre_zona: string
    } | null
  } | null

  // Campos calculados solo en frontend
  inscritos?: number
  horarios_parsed?: TallerHorarioForm[]
}

// Lo que usará el formulario en la vista
export interface TallerFormData {
  nombre: string
  descripcion: string | null
  sala_id: string | null
  capacidad_maxima: number
  costo_adicional: number | null
  estado_activo: boolean
  horarios: TallerHorarioForm[]
  fecha_inicio: string | null   // bound a <input type="date">
  fecha_termino: string | null
}
