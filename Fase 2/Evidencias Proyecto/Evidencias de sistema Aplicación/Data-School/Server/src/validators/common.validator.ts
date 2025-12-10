/**
 * Validadores comunes para toda la aplicación
 * Incluye validaciones de formato y estructura de datos
 */

/**
 * Valida formato de RUT chileno y su dígito verificador
 * Formato aceptado: 12345678-9 o 12.345.678-9
 */
export function validateRUT(rut: string): { valid: boolean; error?: string } {
  if (!rut) {
    return { valid: false, error: 'RUT es requerido' }
  }

  // Limpiar RUT: remover puntos, guiones y espacios
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').trim()

  // Verificar que tenga entre 8 y 9 caracteres (7-8 dígitos + verificador)
  if (cleanRut.length < 8 || cleanRut.length > 9) {
    return { valid: false, error: 'RUT debe tener entre 8 y 9 dígitos' }
  }

  // Separar número y dígito verificador
  const rutNumber = cleanRut.slice(0, -1)
  const verificador = cleanRut.slice(-1).toUpperCase()

  // Verificar que la parte numérica solo contenga dígitos
  if (!/^\d+$/.test(rutNumber)) {
    return { valid: false, error: 'RUT debe contener solo números antes del dígito verificador' }
  }

  // Calcular dígito verificador usando algoritmo módulo 11
  let suma = 0
  let multiplo = 2

  // Sumar desde el último dígito hacia el primero
  for (let i = rutNumber.length - 1; i >= 0; i--) {
    suma += parseInt(rutNumber[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }

  const resto = suma % 11
  const dvCalculado = 11 - resto

  // Convertir resultado a dígito verificador
  let dvEsperado: string
  if (dvCalculado === 11) {
    dvEsperado = '0'
  } else if (dvCalculado === 10) {
    dvEsperado = 'K'
  } else {
    dvEsperado = dvCalculado.toString()
  }

  // Comparar dígito verificador
  if (verificador !== dvEsperado) {
    return { valid: false, error: 'Dígito verificador de RUT inválido' }
  }

  return { valid: true }
}

/**
 * Formatea RUT a formato estándar: 12.345.678-9
 */
export function formatRUT(rut: string): string {
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '').trim()
  const rutNumber = cleanRut.slice(0, -1)
  const verificador = cleanRut.slice(-1)

  // Agregar puntos cada 3 dígitos desde el final
  const formatted = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formatted}-${verificador}`
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: true } // Email es opcional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' }
  }

  // Validaciones adicionales
  if (email.length > 320) { // RFC 5321
    return { valid: false, error: 'Email demasiado largo (máximo 320 caracteres)' }
  }

  return { valid: true }
}

/**
 * Valida formato de teléfono chileno
 * Formatos aceptados: +56912345678, 912345678, 221234567
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone) {
    return { valid: true } // Teléfono es opcional
  }

  // Limpiar espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

  // Validar teléfono móvil chileno: +569XXXXXXXX o 9XXXXXXXX
  const mobileRegex = /^(\+?56)?9\d{8}$/

  // Validar teléfono fijo chileno: +562XXXXXXX o 2XXXXXXX (Santiago y regiones)
  const landlineRegex = /^(\+?56)?[2-9]\d{7,8}$/

  if (!mobileRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) {
    return {
      valid: false,
      error: 'Formato de teléfono inválido. Use formato chileno: +56912345678 o 912345678'
    }
  }

  return { valid: true }
}

/**
 * Valida que una fecha sea válida y esté en formato ISO (YYYY-MM-DD)
 */
export function validateDate(dateStr: string): { valid: boolean; error?: string; date?: Date } {
  if (!dateStr) {
    return { valid: false, error: 'Fecha es requerida' }
  }

  // Validar formato ISO YYYY-MM-DD
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isoRegex.test(dateStr)) {
    return { valid: false, error: 'Formato de fecha inválido. Use YYYY-MM-DD' }
  }

  const date = new Date(dateStr)

  // Verificar que la fecha sea válida
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Fecha inválida' }
  }

  // Verificar que el string corresponda exactamente a la fecha parseada
  // Esto previene fechas como "2024-02-31" que se convierten a "2024-03-03"
  const [year, month, day] = dateStr.split('-').map(Number)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, error: 'Fecha inválida (día no existe en ese mes)' }
  }

  return { valid: true, date }
}

/**
 * Valida que una fecha no sea futura
 */
export function validateNotFutureDate(dateStr: string): { valid: boolean; error?: string } {
  const dateValidation = validateDate(dateStr)

  if (!dateValidation.valid) {
    return dateValidation
  }

  const date = dateValidation.date!
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (date > today) {
    return { valid: false, error: 'La fecha no puede ser futura' }
  }

  return { valid: true }
}

/**
 * Valida que una fecha esté dentro de un rango de años
 */
export function validateDateInRange(
  dateStr: string,
  minYearsAgo: number,
  maxYearsAgo: number
): { valid: boolean; error?: string } {
  const dateValidation = validateDate(dateStr)

  if (!dateValidation.valid) {
    return dateValidation
  }

  const date = dateValidation.date!
  const today = new Date()

  const minDate = new Date(today.getFullYear() - maxYearsAgo, today.getMonth(), today.getDate())
  const maxDate = new Date(today.getFullYear() - minYearsAgo, today.getMonth(), today.getDate())

  if (date < minDate || date > maxDate) {
    return {
      valid: false,
      error: `La fecha debe estar entre ${minYearsAgo} y ${maxYearsAgo} años atrás`
    }
  }

  return { valid: true }
}

/**
 * Calcula la edad en años a partir de una fecha de nacimiento
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Valida que un número esté dentro de un rango
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Valor'
): { valid: boolean; error?: string } {
  if (value < min || value > max) {
    return {
      valid: false,
      error: `${fieldName} debe estar entre ${min} y ${max}`
    }
  }

  return { valid: true }
}

/**
 * Sanitiza un string removiendo HTML y caracteres peligrosos
 */
export function sanitizeString(str: string): string {
  if (!str) return str

  // Remover tags HTML
  let sanitized = str.replace(/<[^>]*>/g, '')

  // Remover caracteres de control
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

  // Trim y normalizar espacios
  sanitized = sanitized.trim().replace(/\s+/g, ' ')

  return sanitized
}

/**
 * Valida formato de hora HH:MM
 */
export function validateTime(timeStr: string): { valid: boolean; error?: string; hours?: number; minutes?: number } {
  if (!timeStr) {
    return { valid: false, error: 'Hora es requerida' }
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  const match = timeStr.match(timeRegex)

  if (!match) {
    return { valid: false, error: 'Formato de hora inválido. Use HH:MM (00:00 - 23:59)' }
  }

  const hours = parseInt(match[1])
  const minutes = parseInt(match[2])

  return { valid: true, hours, minutes }
}

/**
 * Compara dos horas en formato HH:MM
 * Retorna: -1 si time1 < time2, 0 si son iguales, 1 si time1 > time2
 */
export function compareTime(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number)
  const [h2, m2] = time2.split(':').map(Number)

  const minutes1 = h1 * 60 + m1
  const minutes2 = h2 * 60 + m2

  if (minutes1 < minutes2) return -1
  if (minutes1 > minutes2) return 1
  return 0
}

/**
 * Calcula la diferencia en minutos entre dos horas HH:MM
 */
export function getTimeDifferenceInMinutes(startTime: string, endTime: string): number {
  const [h1, m1] = startTime.split(':').map(Number)
  const [h2, m2] = endTime.split(':').map(Number)

  const minutes1 = h1 * 60 + m1
  const minutes2 = h2 * 60 + m2

  return minutes2 - minutes1
}

/**
 * Valida formato de período académico (YYYY-N donde N es 1 o 2)
 */
export function validateAcademicPeriod(period: string): { valid: boolean; error?: string } {
  if (!period) {
    return { valid: false, error: 'Período académico es requerido' }
  }

  const periodRegex = /^\d{4}-[12]$/

  if (!periodRegex.test(period)) {
    return {
      valid: false,
      error: 'Formato de período inválido. Use YYYY-1 o YYYY-2 (ej: 2024-1)'
    }
  }

  const [year] = period.split('-')
  const currentYear = new Date().getFullYear()

  // Validar que el año sea razonable (no muy antiguo ni muy futuro)
  if (parseInt(year) < currentYear - 5 || parseInt(year) > currentYear + 2) {
    return {
      valid: false,
      error: 'Año del período fuera de rango permitido'
    }
  }

  return { valid: true }
}

/**
 * Valida que un valor esté dentro de un conjunto de valores permitidos
 */
export function validateEnum<T>(
  value: T,
  allowedValues: T[],
  fieldName: string = 'Valor'
): { valid: boolean; error?: string } {
  if (!allowedValues.includes(value)) {
    return {
      valid: false,
      error: `${fieldName} debe ser uno de: ${allowedValues.join(', ')}`
    }
  }

  return { valid: true }
}
