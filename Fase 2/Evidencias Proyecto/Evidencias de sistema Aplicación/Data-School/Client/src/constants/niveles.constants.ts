import { Nivel, TipoNivel } from '../types/utils.types'

/**
 * Constantes de niveles educativos del sistema escolar chileno
 * Niveles van desde Pre-Kinder hasta 4° Medio
 */
export const NIVELES: readonly Nivel[] = [
  { id: 1, numero: 0, nivel: 'Pre-Kinder', display: 'Pre-Kinder' },
  { id: 2, numero: 0, nivel: 'Kinder', display: 'Kinder' },
  { id: 3, numero: 1, nivel: 'Basico', display: '1° Básico' },
  { id: 4, numero: 2, nivel: 'Basico', display: '2° Básico' },
  { id: 5, numero: 3, nivel: 'Basico', display: '3° Básico' },
  { id: 6, numero: 4, nivel: 'Basico', display: '4° Básico' },
  { id: 7, numero: 5, nivel: 'Basico', display: '5° Básico' },
  { id: 8, numero: 6, nivel: 'Basico', display: '6° Básico' },
  { id: 9, numero: 7, nivel: 'Basico', display: '7° Básico' },
  { id: 10, numero: 8, nivel: 'Basico', display: '8° Básico' },
  { id: 11, numero: 1, nivel: 'Medio', display: '1° Medio' },
  { id: 12, numero: 2, nivel: 'Medio', display: '2° Medio' },
  { id: 13, numero: 3, nivel: 'Medio', display: '3° Medio' },
  { id: 14, numero: 4, nivel: 'Medio', display: '4° Medio' },
] as const

/**
 * Obtiene un nivel por su ID
 * @param id - ID del nivel (1-14)
 * @returns Nivel encontrado o undefined
 */
export const getNivelById = (id: number): Nivel | undefined => {
  return NIVELES.find((n) => n.id === id)
}

/**
 * Obtiene el nombre completo para mostrar del nivel
 * @param id - ID del nivel
 * @returns Texto formateado (ej: "3° Básico") o "Nivel desconocido"
 */
export const getNivelDisplay = (id: number): string => {
  const nivel = getNivelById(id)
  return nivel?.display || 'Nivel desconocido'
}

/**
 * Filtra niveles por tipo (Pre-Kinder, Kinder, Básico, Medio)
 * @param tipo - Tipo de nivel a filtrar
 * @returns Array de niveles del tipo especificado
 */
export const getNivelesByTipo = (tipo: TipoNivel): readonly Nivel[] => {
  return NIVELES.filter((n) => n.nivel === tipo)
}

/**
 * Obtiene todos los niveles básicos (1° a 8° Básico)
 */
export const getNivelesBasicos = (): readonly Nivel[] => {
  return getNivelesByTipo('Basico')
}

/**
 * Obtiene todos los niveles medios (1° a 4° Medio)
 */
export const getNivelesMedios = (): readonly Nivel[] => {
  return getNivelesByTipo('Medio')
}

/**
 * Obtiene niveles de educación parvularia (Pre-Kinder y Kinder)
 */
export const getNivelesParvularia = (): readonly Nivel[] => {
  return NIVELES.filter((n) => n.nivel === 'Pre-Kinder' || n.nivel === 'Kinder')
}

/**
 * Valida si un ID de nivel es válido
 * @param id - ID a validar
 * @returns true si el ID existe, false en caso contrario
 */
export const isValidNivelId = (id: number): boolean => {
  return NIVELES.some((n) => n.id === id)
}

/**
 * Obtiene un array con solo los IDs de los niveles
 */
export const NIVEL_IDS = NIVELES.map((n) => n.id) as readonly number[]

/**
 * Tipos de nivel únicos disponibles
 */
export const TIPOS_NIVEL: readonly TipoNivel[] = [
  'Pre-Kinder',
  'Kinder',
  'Basico',
  'Medio',
] as const