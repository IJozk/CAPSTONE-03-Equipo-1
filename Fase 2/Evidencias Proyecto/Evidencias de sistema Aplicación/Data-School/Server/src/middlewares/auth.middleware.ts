import { Request, Response, NextFunction } from 'express'
import { supabase } from '@/config/supabase'
import type { UserRole } from '@/constants/roles'
import { hasAnyRole } from '@/constants/roles'

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: UserRole
        colegio_id?: string
      }
    }
  }
}

// Middleware para verificar que el usuario esté autenticado
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No se proporcionó token de autenticación'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verificar token con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return res.status(401).json({
        error: 'Token inválido o expirado'
      })
    }

    // Obtener información del usuario desde la tabla User
    console.log('🔍 Auth - auth_user_id from token:', authData.user.id)
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('user_id, email_address, role, colegio_id, is_active')
      .eq('auth_user_id', authData.user.id)
      .single()

    console.log('🔍 Auth - User query result:', { userData, userError })

    if (userError || !userData) {
      console.log('❌ Auth - Usuario no encontrado en tabla User')
      return res.status(404).json({
        error: 'Usuario no encontrado en el sistema'
      })
    }

    if (!userData.is_active) {
      console.log('❌ Auth - Usuario inactivo:', userData.user_id)
      return res.status(403).json({
        error: 'Usuario inactivo'
      })
    }

    // Agregar información del usuario al request
    req.user = {
      id: userData.user_id,
      email: userData.email_address,
      role: userData.role as UserRole,
      colegio_id: userData.colegio_id || undefined
    }

    // También agregar userId directamente para facilitar el acceso
    ;(req as any).userId = userData.user_id

    console.log('✅ Auth - Usuario autenticado:', {
      userId: userData.user_id,
      email: userData.email_address,
      role: userData.role,
      colegio_id: userData.colegio_id
    })

    next()
  } catch (error) {
    console.error('Error en autenticación:', error)
    return res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
}

// Middleware para verificar roles específicos
// Este middleware ejecuta primero authenticate y luego verifica roles
export const authorize = (...allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Primero ejecutar autenticación
    await authenticate(req, res, () => {
      // Si la autenticación falla, authenticate ya envió la respuesta
      if (res.headersSent) return

      // Verificar que el usuario esté en el request
      if (!req.user) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        })
      }

      // Verificar roles
      if (!hasAnyRole(req.user.role, allowedRoles)) {
        return res.status(403).json({
          error: 'No tienes permisos para acceder a este recurso',
          required_roles: allowedRoles,
          your_role: req.user.role
        })
      }

      // Todo OK, continuar
      next()
    })
  }
}
