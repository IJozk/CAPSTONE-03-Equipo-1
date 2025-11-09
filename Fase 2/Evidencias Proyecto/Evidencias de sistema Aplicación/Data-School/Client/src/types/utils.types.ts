// Tipos utilitarios generales del sistema

export interface Nivel {
  id: number
  numero: number
  nivel: 'Pre-Kinder' | 'Kinder' | 'Basico' | 'Medio'
  display: string // Ej: "Pre-Kinder", "1° Basico", "3° Medio"
}

export type TipoNivel = 'Pre-Kinder' | 'Kinder' | 'Basico' | 'Medio'

export interface Regiones {
  name: string
  romanNumber: string
  number: string
  id: string
  communes: Comuna[]
}

export interface Comuna {
  name: string
  id: string
}