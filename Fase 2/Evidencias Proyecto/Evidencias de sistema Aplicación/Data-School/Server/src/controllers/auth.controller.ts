import { Request, Response } from 'express'
import { supabase } from '@/config/supabase'
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '@/models/auth'

export class AuthController {
  // Registro de usuario
  async register(req: Request, res: Response) {
    try {
      const { email, password, role, colegio_id } = req.body as RegisterDto

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

      // Crear registro en tabla User
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('User')
          .insert({
            auth_user_id: data.user.id,
            email_address: data.user.email!,
            role: role || 'ESTUDIANTE_APODERADO',
            colegio_id: colegio_id || null,
            is_active: true,
            profile_completed: false
          })
          .select()
          .single()

        if (userError) {
          console.error('Error creando usuario en tabla User:', {
            code: userError.code,
            message: userError.message,
            details: userError.details,
            hint: userError.hint
          })

          // Si falla la creación del usuario en la tabla User (y no es duplicado)
          if (userError.code !== '23505') {
            return res.status(500).json({
              error: 'Error al crear usuario en el sistema',
              details: userError.message,
              debug: {
                code: userError.code,
                hint: userError.hint
              }
            })
          }
        } else {
          console.log('Usuario creado exitosamente en tabla User:', userData)
        }
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

  // Solicitar recuperación de contraseña
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body as ForgotPasswordDto

      if (!email) {
        return res.status(400).json({
          error: 'Email es requerido'
        })
      }

      // Enviar email de recuperación
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`
      })

      if (error) {
        return res.status(400).json({
          error: error.message
        })
      }

      return res.status(200).json({
        message: 'Se ha enviado un email con instrucciones para recuperar tu contraseña'
      })
    } catch (error) {
      console.error('Error en forgot password:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Resetear contraseña (requiere token del email)
  async resetPassword(req: Request, res: Response) {
    try {
      const { password } = req.body as ResetPasswordDto
      const authHeader = req.headers.authorization

      if (!authHeader) {
        return res.status(401).json({
          error: 'Token no proporcionado'
        })
      }

      if (!password) {
        return res.status(400).json({
          error: 'Contraseña es requerida'
        })
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 6 caracteres'
        })
      }

      const token = authHeader.replace('Bearer ', '')

      // Actualizar contraseña usando el token del email
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        return res.status(400).json({
          error: error.message
        })
      }

      return res.status(200).json({
        message: 'Contraseña actualizada exitosamente'
      })
    } catch (error) {
      console.error('Error en reset password:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
