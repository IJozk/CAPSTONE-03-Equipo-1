import { Request, Response, NextFunction } from 'express'
import { supabase } from '@/config/supabase'

// ============================================
// UTILIDADES PARA RUT
// ============================================

/**
 * Formatea un RUT eliminando puntos y guiones
 */
const formatRUT = (rut: string): string => {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
}

/**
 * Valida el formato y dígito verificador del RUT chileno
 */
const isValidRUT = (rut: string): boolean => {
  const cleanRUT = formatRUT(rut)
  
  // Debe tener entre 8 y 9 caracteres (7-8 dígitos + verificador)
  if (cleanRUT.length < 2 || cleanRUT.length > 9) {
    return false
  }

  const body = cleanRUT.slice(0, -1)
  const verifier = cleanRUT.slice(-1)

  // El cuerpo debe ser solo números
  if (!/^\d+$/.test(body)) {
    return false
  }

  // Calcular dígito verificador
  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const expectedVerifier = 11 - (sum % 11)
  let calculatedVerifier: string

  if (expectedVerifier === 11) {
    calculatedVerifier = '0'
  } else if (expectedVerifier === 10) {
    calculatedVerifier = 'K'
  } else {
    calculatedVerifier = expectedVerifier.toString()
  }

  return verifier === calculatedVerifier
}

// ============================================
// VALIDACIÓN DE EMAIL
// ============================================

/**
 * Middleware para validar formato y unicidad del email
 */
export const validateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body

    // Validar que el email esté presente
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_EMAIL',
        message: 'El email es requerido'
      })
    }

    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL_FORMAT',
        message: 'El formato del email no es válido. Ejemplo: usuario@dominio.com'
      })
    }

    // Verificar si el email ya existe en la tabla User
    const { data: existingUser, error } = await supabase
      .from('User')
      .select('email_address')
      .eq('email_address', email.toLowerCase())
      .maybeSingle()

    if (error) {
      console.error('Error al verificar email:', error)
      return res.status(500).json({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Error al verificar el email en la base de datos'
      })
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: `El email "${email}" ya está registrado en el sistema. Por favor usa otro email.`,
        field: 'email'
      })
    }

    // Normalizar email a minúsculas
    req.body.email = email.toLowerCase()

    next()
  } catch (error) {
    console.error('Error en validateEmail:', error)
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor al validar el email'
    })
  }
}

// ============================================
// VALIDACIÓN DE RUT
// ============================================

/**
 * Middleware para validar formato y unicidad del RUT
 * Solo valida si el campo 'rut' está presente en el body
 */
export const validateRUT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rut } = req.body

    // Si no hay RUT en el body, continuar (algunos usuarios no tienen RUT)
    if (!rut) {
      return next()
    }

    // Validar formato y dígito verificador
    if (!isValidRUT(rut)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_RUT_FORMAT',
        message: `El RUT "${rut}" no es válido. Verifica el formato (ej: 12345678-9) y el dígito verificador.`,
        field: 'rut'
      })
    }

    const cleanRUT = formatRUT(rut)

    // Verificar unicidad en todas las tablas que tienen RUT
    const tables = ['Administrativo', 'Profesor', 'Estudiante', 'Tutor'] as const
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('rut, nombre_completo')
        .eq('rut', cleanRUT)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error(`Error al verificar RUT en ${table}:`, error)
        return res.status(500).json({
          success: false,
          error: 'DATABASE_ERROR',
          message: `Error al verificar el RUT`
        })
      }

      if (data) {
        return res.status(409).json({
          success: false,
          error: 'RUT_ALREADY_EXISTS',
          message: `El RUT "${rut}" ya está registrado en el sistema como ${table}.`,
          field: 'rut',
          details: {
            table,
            existing_name: data.nombre_completo
          }
        })
      }
    }

    // Guardar RUT limpio en el body
    req.body.rut = cleanRUT

    next()
  } catch (error) {
    console.error('Error en validateRUT:', error)
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Error interno del servidor al validar el RUT'
    })
  }
}

/**
 * Middleware específico que REQUIERE el RUT
 * Usar este cuando el RUT sea obligatorio (Administrativo, Profesor, etc.)
 */
export const requireRUT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rut } = req.body

  if (!rut) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_RUT',
      message: 'El RUT es obligatorio para este tipo de usuario',
      field: 'rut'
    })
  }

  // Continuar con la validación normal
  return validateRUT(req, res, next)
}