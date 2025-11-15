/**
 * Validaciones para el sistema educacional
 * Basado en el sistema educativo chileno
 */

export interface AgeRange {
  nivelId: number
  nivelNombre: string
  minAge: number // Edad mínima en años
  maxAge: number // Edad máxima en años
  description: string
}

/**
 * Rangos de edad permitidos por nivel educativo
 *
 * Basado en las edades típicas del sistema educacional chileno:
 * - Pre-Kinder: 4 años (cumplidos al 31 de marzo)
 * - Kinder: 5 años (cumplidos al 31 de marzo)
 * - 1° Básico: 6 años en adelante
 * - Niveles superiores: Se permite flexibilidad de +/- 2 años
 */
export const EDAD_POR_NIVEL: readonly AgeRange[] = [
  {
    nivelId: 1,
    nivelNombre: 'Pre-Kinder',
    minAge: 4,
    maxAge: 5,
    description: 'Pre-Kinder acepta niños de 4 a 5 años'
  },
  {
    nivelId: 2,
    nivelNombre: 'Kinder',
    minAge: 5,
    maxAge: 6,
    description: 'Kinder acepta niños de 5 a 6 años'
  },
  {
    nivelId: 3,
    nivelNombre: '1° Básico',
    minAge: 6,
    maxAge: 8,
    description: '1° Básico acepta niños de 6 a 8 años'
  },
  {
    nivelId: 4,
    nivelNombre: '2° Básico',
    minAge: 7,
    maxAge: 9,
    description: '2° Básico acepta niños de 7 a 9 años'
  },
  {
    nivelId: 5,
    nivelNombre: '3° Básico',
    minAge: 8,
    maxAge: 10,
    description: '3° Básico acepta niños de 8 a 10 años'
  },
  {
    nivelId: 6,
    nivelNombre: '4° Básico',
    minAge: 9,
    maxAge: 11,
    description: '4° Básico acepta niños de 9 a 11 años'
  },
  {
    nivelId: 7,
    nivelNombre: '5° Básico',
    minAge: 10,
    maxAge: 12,
    description: '5° Básico acepta niños de 10 a 12 años'
  },
  {
    nivelId: 8,
    nivelNombre: '6° Básico',
    minAge: 11,
    maxAge: 13,
    description: '6° Básico acepta niños de 11 a 13 años'
  },
  {
    nivelId: 9,
    nivelNombre: '7° Básico',
    minAge: 12,
    maxAge: 14,
    description: '7° Básico acepta estudiantes de 12 a 14 años'
  },
  {
    nivelId: 10,
    nivelNombre: '8° Básico',
    minAge: 13,
    maxAge: 15,
    description: '8° Básico acepta estudiantes de 13 a 15 años'
  },
  {
    nivelId: 11,
    nivelNombre: '1° Medio',
    minAge: 14,
    maxAge: 16,
    description: '1° Medio acepta estudiantes de 14 a 16 años'
  },
  {
    nivelId: 12,
    nivelNombre: '2° Medio',
    minAge: 15,
    maxAge: 17,
    description: '2° Medio acepta estudiantes de 15 a 17 años'
  },
  {
    nivelId: 13,
    nivelNombre: '3° Medio',
    minAge: 16,
    maxAge: 18,
    description: '3° Medio acepta estudiantes de 16 a 18 años'
  },
  {
    nivelId: 14,
    nivelNombre: '4° Medio',
    minAge: 17,
    maxAge: 19,
    description: '4° Medio acepta estudiantes de 17 a 19 años'
  }
] as const

/**
 * Obtener el rango de edad permitido para un nivel
 */
export const getAgeRangeForNivel = (nivelId: number): AgeRange | undefined => {
  return EDAD_POR_NIVEL.find(range => range.nivelId === nivelId)
}

/**
 * Calcular la edad actual de una persona basada en su fecha de nacimiento
 */
export const calculateAge = (fechaNacimiento: string): number => {
  const birthDate = new Date(fechaNacimiento)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Validar si un estudiante cumple con el rango de edad para un nivel
 */
export const validateAgeForNivel = (fechaNacimiento: string, nivelId: number): {
  valid: boolean
  age: number
  message?: string
} => {
  const age = calculateAge(fechaNacimiento)
  const ageRange = getAgeRangeForNivel(nivelId)

  if (!ageRange) {
    return {
      valid: false,
      age,
      message: 'Nivel educativo no encontrado'
    }
  }

  if (age < ageRange.minAge) {
    return {
      valid: false,
      age,
      message: `El estudiante tiene ${age} años, pero ${ageRange.nivelNombre} requiere una edad mínima de ${ageRange.minAge} años`
    }
  }

  if (age > ageRange.maxAge) {
    return {
      valid: false,
      age,
      message: `El estudiante tiene ${age} años, pero ${ageRange.nivelNombre} acepta estudiantes hasta ${ageRange.maxAge} años`
    }
  }

  return {
    valid: true,
    age
  }
}

/**
 * Otras constantes de validación
 */
export const VALIDATION_CONSTANTS = {
  MAX_TUTORES_POR_ESTUDIANTE: 2,
  ESTADO_MATRICULA_ACTIVA: 1,
  ESTADO_MATRICULA_RETIRADA: 2,
  ESTADO_MATRICULA_TRASLADADA: 3
} as const
