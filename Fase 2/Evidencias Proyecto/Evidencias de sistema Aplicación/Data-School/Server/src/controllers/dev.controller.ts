import { Request, Response } from 'express'
import { supabase } from '@/config/supabase'

/**
 * Controlador con utilidades para desarrollo
 * ⚠️ NUNCA usar en producción
 */
export class DevController {
  // Eliminar todos los usuarios de prueba
  async cleanupTestUsers(req: Request, res: Response) {
    try {
      // Solo permitir en desarrollo
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          error: 'Esta operación no está permitida en producción'
        })
      }

      // Eliminar de tabla User primero
      const { error: userError, count: userCount } = await supabase
        .from('User')
        .delete({ count: 'exact' })
        .or('email_address.like.%test%,email_address.like.%ejemplo%')

      if (userError) {
        console.error('Error eliminando de tabla User:', userError)
      }

      return res.status(200).json({
        message: 'Usuarios de prueba eliminados',
        deleted_from_user_table: userCount || 0,
        note: 'Los usuarios también deben eliminarse de auth.users desde el dashboard o SQL Editor'
      })
    } catch (error) {
      console.error('Error en cleanup:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Listar todos los usuarios
  async listUsers(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('user_id, email_address, role, is_active, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        return res.status(400).json({
          error: error.message
        })
      }

      return res.status(200).json({
        users: data,
        count: data?.length || 0
      })
    } catch (error) {
      console.error('Error listando usuarios:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
