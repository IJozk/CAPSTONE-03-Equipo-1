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
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('user_id, email_address, role, colegio_id, is_active')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (userError || !userData) {
      return res.status(404).json({
        error: 'Usuario no encontrado en el sistema'
      })
    }

    if (!userData.is_active) {
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

    next()
  } catch (error) {
    console.error('Error en autenticación:', error)
    return res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
}

// Middleware para verificar roles específicos
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      })
    }

    if (!hasAnyRole(req.user.role, allowedRoles)) {
      return res.status(403).json({
        error: 'No tienes permisos para acceder a este recurso',
        required_roles: allowedRoles,
        your_role: req.user.role
      })
    }

    next()
  }
}
