// src/types/sala.types.ts

export type SalaEstado = 'DISPONIBLE' | 'MANTENIMIENTO' | 'FUERA_DE_SERVICIO'

export interface Sala {
  sala_id: string
  nombre: string
  zona_id: string
  capacidad: number | null
  tiene_proyector: boolean
  tiene_pizarra_digital: boolean
  distribucion_asientos_template: string | null
  estado: SalaEstado
  created_at: string | null

  Zona?: {
    zona_id: string
    nombre_zona: string
    descripcion?: string | null
    Colegio?: {
      colegio_id: string
      nombre: string
    } | null
  } | null
}
