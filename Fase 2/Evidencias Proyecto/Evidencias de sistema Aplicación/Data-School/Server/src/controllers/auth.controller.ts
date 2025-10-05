import { Request, Response } from 'express'
import { supabase } from '@/config/supabase'
import { RegisterDto, LoginDto } from '@/models/auth'

export class AuthController {
  // Registro de usuario
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body as RegisterDto

      // Validar campos requeridos
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email y contraseña son requeridos'
        })
      }

      // Registrar usuario con Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return res.status(400).json({
          error: error.message
        })
      }

      // Verificar si requiere confirmación de email
      const needsConfirmation = !data.session && data.user

      return res.status(201).json({
        message: needsConfirmation
          ? 'Usuario registrado. Por favor, confirma tu email para activar la cuenta.'
          : 'Usuario registrado exitosamente',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at,
          email_confirmed: data.user?.email_confirmed_at ? true : false
        },
        session: data.session,
        needs_email_confirmation: needsConfirmation
      })
    } catch (error) {
      console.error('Error en registro:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Login de usuario
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginDto

      // Validar campos requeridos
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email y contraseña son requeridos'
        })
      }

      // Autenticar con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        })
      }

      return res.status(200).json({
        message: 'Login exitoso',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at
        },
        session: data.session
      })
    } catch (error) {
      console.error('Error en login:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Logout de usuario
  async logout(req: Request, res: Response) {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return res.status(400).json({
          error: error.message
        })
      }

      return res.status(200).json({
        message: 'Logout exitoso'
      })
    } catch (error) {
      console.error('Error en logout:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Obtener usuario actual
  async getCurrentUser(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader) {
        return res.status(401).json({
          error: 'Token no proporcionado'
        })
      }

      const token = authHeader.replace('Bearer ', '')

      const { data, error } = await supabase.auth.getUser(token)

      if (error) {
        return res.status(401).json({
          error: 'Token inválido'
        })
      }

      return res.status(200).json({
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at
        }
      })
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
