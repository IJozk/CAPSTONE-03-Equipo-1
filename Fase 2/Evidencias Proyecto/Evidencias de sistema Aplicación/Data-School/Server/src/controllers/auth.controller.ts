import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '@/config/supabase'
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterProfesorDto,
  RegisterEstudianteDto,
  RegisterTutorDto,
  RegisterAdministrativoDto
} from '@/models/auth'

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
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            email_confirm: false
          }
        }
      })

      if (error) {
        return res.status(400).json({
          error: error.message
        })
      }

      // Crear registro en tabla User usando cliente admin (bypasea RLS)
      if (data.user) {
        // Usar supabaseAdmin si está disponible, sino usar supabase normal
        const client = supabaseAdmin || supabase

        const { data: userData, error: userError } = await client
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

      if (!data.user) {
        return res.status(401).json({
          error: 'Usuario no encontrado'
        })
      }

      // Obtener información adicional del usuario desde la tabla User
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('user_id, email_address, role, colegio_id, is_active, profile_completed')
        .eq('auth_user_id', data.user.id)
        .single()

      if (userError || !userData) {
        console.error('Error obteniendo datos de usuario:', userError)
        return res.status(404).json({
          error: 'Usuario no encontrado en el sistema'
        })
      }

      // Obtener información adicional del usuario desde la tabla User
      let adminData = null;
      let adminError = null;

      if (userData.role === 'ADMINISTRADOR' || userData.role === 'ADMINISTRATIVO' || userData.role === 'DIRECTOR') {
        // Obtener información adicional del usuario desde la tabla User
        const client = supabaseAdmin || supabase;
        const result = await client
          .from('Administrativo')
          .select('nombre_completo, cargo, rut, telefono, area_id, fecha_contratacion')
          .eq('user_id', userData.user_id)
          .single();
        
        adminData = result.data;
        adminError = result.error;

        if (adminError || !adminData) {
          console.log(result)
          console.log(userData.user_id)
          console.error('Error obteniendo datos de administrativo:', adminError)
          return res.status(404).json({
            error: 'Perfil de administrativo no encontrado en el sistema'
          })
        }
      }

      // Obtener información adicional del usuario de rol profesor
      let teacherData = null;
      let teacherError = null;

      if (userData.role === 'PROFESOR') {
        // Obtener información adicional del usuario desde la tabla User
        const client = supabaseAdmin || supabase;
        const result = await client
          .from('Profesor')
          .select('nombre_completo, titulo_profesional, especialidad, rut, telefono, fecha_contratacion')
          .eq('user_id', userData.user_id)
          .single();
        
        teacherData = result.data;
        teacherError = result.error;

        if (teacherError || !teacherData) {
          console.log(result)
          console.log(userData.user_id)
          console.error('Error obteniendo datos de administrativo:', teacherError)
          return res.status(404).json({
            error: 'Perfil de administrativo no encontrado en el sistema'
          })
        }
      }

      // Obtener información adicional del usuario de rol estudiante
      let studentData = null;
      let studentError = null;

      if (userData.role === 'ESTUDIANTE_APODERADO') {
          // Obtener información adicional del usuario desde la tabla User
        const client = supabaseAdmin || supabase;
        const result = await client
          .from('Profesor')
          .select('nombre_completo, rut, telefono, fecha_nacimiento, genero, direccion')
          .eq('user_id', userData.user_id)
          .single();
        
        studentData = result.data;
        studentError = result.error;

        if (studentError || !studentData) {
          console.log(result)
          console.log(userData.user_id)
          console.error('Error obteniendo datos de administrativo:', studentError)
          return res.status(404).json({
            error: 'Perfil de administrativo no encontrado en el sistema'
          })
        }
      }


      // Verificar si el usuario está activo
      if (!userData.is_active) {
        return res.status(403).json({
          error: 'Usuario inactivo. Contacta al administrador.'
        })
      }

      return res.status(200).json({
        message: 'Login exitoso',
        user: {
          id: userData.user_id,
          auth_id: data.user.id,
          email: userData.email_address,
          role: userData.role,
          colegio_id: userData.colegio_id,
          profile_completed: userData.profile_completed,
          created_at: data.user.created_at,
          // Información adicional para administrativos
          ...(userData.role === 'ADMINISTRADOR' && !adminError && adminData
            ? { admin_profile: adminData }
            : {})
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

  // Registro de Profesor
  async registerProfesor(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        colegio_id,
        nombre_completo,
        rut,
        telefono,
        titulo_profesional,
        especialidad,
        fecha_contratacion
      } = req.body as RegisterProfesorDto

      // Validar campos requeridos
      if (!email || !password || !nombre_completo || !colegio_id) {
        return res.status(400).json({
          error: 'Email, contraseña, nombre completo y colegio_id son requeridos'
        })
      }

      // Registrar usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        return res.status(400).json({
          error: authError.message
        })
      }

      if (!authData.user) {
        return res.status(400).json({
          error: 'Error al crear usuario de autenticación'
        })
      }

      const client = supabaseAdmin || supabase

      // Crear registro en tabla User
      const { data: userData, error: userError } = await client
        .from('User')
        .insert({
          auth_user_id: authData.user.id,
          email_address: email,
          role: 'PROFESOR',
          colegio_id: colegio_id,
          is_active: true,
          profile_completed: true
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creando usuario en tabla User:', userError)
        return res.status(500).json({
          error: 'Error al crear usuario en el sistema',
          details: userError.message
        })
      }

      // Crear registro en tabla Profesor
      const { data: profesorData, error: profesorError } = await client
        .from('Profesor')
        .insert({
          user_id: userData.user_id,
          nombre_completo,
          rut,
          telefono,
          titulo_profesional,
          especialidad,
          fecha_contratacion,
          estado_activo: true
        })
        .select()
        .single()

      if (profesorError) {
        console.error('Error creando profesor:', profesorError)
        return res.status(500).json({
          error: 'Error al crear perfil de profesor',
          details: profesorError.message
        })
      }

      return res.status(201).json({
        message: 'Profesor registrado exitosamente',
        user: {
          id: userData.user_id,
          auth_id: authData.user.id,
          email: email,
          role: 'PROFESOR',
          colegio_id: colegio_id
        },
        profesor: profesorData,
        session: authData.session
      })
    } catch (error) {
      console.error('Error en registro de profesor:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Registro de Estudiante
  async registerEstudiante(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        colegio_id,
        nombre_completo,
        fecha_nacimiento,
        rut,
        telefono,
        direccion,
        genero
      } = req.body as RegisterEstudianteDto

      // Validar campos requeridos
      if (!nombre_completo || !fecha_nacimiento || !colegio_id) {
        return res.status(400).json({
          error: 'Nombre completo, fecha de nacimiento y colegio_id son requeridos'
        })
      }

      const client = supabaseAdmin || supabase
      let userId: string | null = null

      // Si se proporciona email y password, crear cuenta de autenticación
      if (email && password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        })

        if (authError) {
          return res.status(400).json({
            error: authError.message
          })
        }

        if (!authData.user) {
          return res.status(400).json({
            error: 'Error al crear usuario de autenticación'
          })
        }

        // Crear registro en tabla User
        const { data: userData, error: userError } = await client
          .from('User')
          .insert({
            auth_user_id: authData.user.id,
            email_address: email,
            role: 'ESTUDIANTE_APODERADO',
            colegio_id: colegio_id,
            is_active: true,
            profile_completed: true
          })
          .select()
          .single()

        if (userError) {
          console.error('Error creando usuario en tabla User:', userError)
          return res.status(500).json({
            error: 'Error al crear usuario en el sistema',
            details: userError.message
          })
        }

        userId = userData.user_id
      }

      // Crear registro en tabla Estudiante
      const { data: estudianteData, error: estudianteError } = await client
        .from('Estudiante')
        .insert({
          user_id: userId,
          nombre_completo,
          fecha_nacimiento,
          rut,
          telefono,
          email,
          direccion,
          genero,
          estado_activo: true
        })
        .select()
        .single()

      if (estudianteError) {
        console.error('Error creando estudiante:', estudianteError)
        return res.status(500).json({
          error: 'Error al crear perfil de estudiante',
          details: estudianteError.message
        })
      }

      return res.status(201).json({
        message: 'Estudiante registrado exitosamente',
        estudiante: estudianteData,
        has_account: !!userId
      })
    } catch (error) {
      console.error('Error en registro de estudiante:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Registro de Tutor (sin cuenta de usuario)
  async registerTutor(req: Request, res: Response) {
    try {
      const {
        nombre_completo,
        rut,
        telefono,
        email,
        direccion,
        ocupacion,
        telefono_emergencia,
        estudiante_id,
        tipo_parentesco_id,
        es_tutor_titular,
        es_contacto_emergencia,
        puede_retirar
      } = req.body as RegisterTutorDto

      // Validar campos requeridos
      if (!nombre_completo || !estudiante_id || !tipo_parentesco_id) {
        return res.status(400).json({
          error: 'Nombre completo, estudiante_id y tipo_parentesco_id son requeridos'
        })
      }

      const client = supabaseAdmin || supabase

      // Verificar que el estudiante existe
      const { data: estudiante, error: estudianteError } = await client
        .from('Estudiante')
        .select('estudiante_id')
        .eq('estudiante_id', estudiante_id)
        .single()

      if (estudianteError || !estudiante) {
        return res.status(404).json({
          error: 'Estudiante no encontrado'
        })
      }

      // Crear registro en tabla Tutor (sin user_id)
      const { data: tutorData, error: tutorError } = await client
        .from('Tutor')
        .insert({
          user_id: null, // Tutor no tiene cuenta de usuario
          nombre_completo,
          rut,
          telefono,
          email,
          direccion,
          ocupacion,
          telefono_emergencia,
          estado_activo: true
        })
        .select()
        .single()

      if (tutorError) {
        console.error('Error creando tutor:', tutorError)
        return res.status(500).json({
          error: 'Error al crear perfil de tutor',
          details: tutorError.message
        })
      }

      // Crear relación en tabla Parentesco
      const { data: parentescoData, error: parentescoError } = await client
        .from('Parentesco')
        .insert({
          estudiante_id: estudiante_id,
          tutor_id: tutorData.tutor_id,
          tipo_parentesco_id: tipo_parentesco_id,
          es_tutor_titular: es_tutor_titular ?? false,
          es_contacto_emergencia: es_contacto_emergencia ?? false,
          puede_retirar: puede_retirar ?? false
        })
        .select()
        .single()

      if (parentescoError) {
        console.error('Error creando relación de parentesco:', parentescoError)
        return res.status(500).json({
          error: 'Error al crear relación de parentesco',
          details: parentescoError.message
        })
      }

      return res.status(201).json({
        message: 'Tutor registrado exitosamente',
        tutor: tutorData,
        parentesco: parentescoData
      })
    } catch (error) {
      console.error('Error en registro de tutor:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }

  // Registro de Administrativo (incluye ADMINISTRATIVO, DIRECTOR, ADMINISTRADOR)
  async registerAdministrativo(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        role,
        colegio_id,
        nombre_completo,
        cargo,
        rut,
        telefono,
        area_id,
        fecha_contratacion
      } = req.body as RegisterAdministrativoDto

      // Validar campos requeridos
      if (!email || !password || !nombre_completo || !colegio_id || !role || !area_id) {
        return res.status(400).json({
          error: 'Email, contraseña, nombre completo, colegio_id, role y area_id son requeridos'
        })
      }

      // Validar que el rol sea administrativo
      if (!['ADMINISTRATIVO', 'DIRECTOR', 'ADMINISTRADOR'].includes(role)) {
        return res.status(400).json({
          error: 'El rol debe ser ADMINISTRATIVO, DIRECTOR o ADMINISTRADOR'
        })
      }

      // Registrar usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        return res.status(400).json({
          error: authError.message
        })
      }

      if (!authData.user) {
        return res.status(400).json({
          error: 'Error al crear usuario de autenticación'
        })
      }

      const client = supabaseAdmin || supabase

      // Crear registro en tabla User
      const { data: userData, error: userError } = await client
        .from('User')
        .insert({
          auth_user_id: authData.user.id,
          email_address: email,
          role: role,
          colegio_id: colegio_id,
          is_active: true,
          profile_completed: true
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creando usuario en tabla User:', userError)
        return res.status(500).json({
          error: 'Error al crear usuario en el sistema',
          details: userError.message
        })
      }

      // Crear registro en tabla Administrativo
      const { data: adminData, error: adminError } = await client
        .from('Administrativo')
        .insert({
          user_id: userData.user_id,
          nombre_completo,
          cargo,
          rut,
          telefono,
          area_id,
          fecha_contratacion,
          estado_activo: true
        })
        .select()
        .single()

      if (adminError) {
        console.error('Error creando administrativo:', adminError)
        return res.status(500).json({
          error: 'Error al crear perfil de administrativo',
          details: adminError.message
        })
      }

      return res.status(201).json({
        message: 'Administrativo registrado exitosamente',
        user: {
          id: userData.user_id,
          auth_id: authData.user.id,
          email: email,
          role: role,
          colegio_id: colegio_id
        },
        administrativo: adminData,
        session: authData.session
      })
    } catch (error) {
      console.error('Error en registro de administrativo:', error)
      return res.status(500).json({
        error: 'Error interno del servidor'
      })
    }
  }
}
