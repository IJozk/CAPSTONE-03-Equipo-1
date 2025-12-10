import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ColegiaturaController {
  /**
   * Obtener todas las colegiaturas con filtros opcionales
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { estado, anio, mes, matricula_id } = req.query

      let query = supabaseAdmin!
        .from('Colegiatura')
        .select(`
          *,
          Matricula (
            matricula_id,
            periodo,
            Estudiante (
              estudiante_id,
              nombre_completo,
              rut
            ),
            Curso (
              curso_id,
              nombre
            )
          )
        `)
        .order('fecha_vencimiento', { ascending: false })

      // Aplicar filtros
      if (estado) query = query.eq('estado', estado as "PENDIENTE" | "PAGADO" | "VENCIDO" | "CONDONADO")
      if (anio) query = query.eq('anio', Number(anio))
      if (mes) query = query.eq('mes', Number(mes))
      if (matricula_id) query = query.eq('matricula_id', matricula_id as string)

      const { data, error } = await query

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo colegiaturas:', error)
      return res.status(500).json({ message: 'Error al obtener las colegiaturas' })
    }
  }

  /**
   * Obtener una colegiatura por ID
   */
  public async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .select(`
          *,
          Matricula (
            matricula_id,
            periodo,
            Estudiante (
              estudiante_id,
              nombre_completo,
              rut,
              email
            ),
            Curso (
              curso_id,
              nombre
            ),
            Tutor (
              tutor_id,
              nombre_completo,
              telefono,
              email
            )
          )
        `)
        .eq('colegiatura_id', id)
        .single()

      if (error || !data) {
        return res.status(404).json({ message: 'Colegiatura no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error obteniendo colegiatura:', error)
      return res.status(500).json({ message: 'Error al obtener la colegiatura' })
    }
  }

  /**
   * Obtener colegiaturas por estudiante
   */
  public async getByEstudiante(req: Request, res: Response): Promise<Response> {
    try {
      const { estudiante_id } = req.params

      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .select(`
          *,
          Matricula!inner (
            matricula_id,
            periodo,
            estudiante_id,
            Curso (
              curso_id,
              nombre
            )
          )
        `)
        .eq('Matricula.estudiante_id', estudiante_id)
        .order('anio', { ascending: false })
        .order('mes', { ascending: false })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo colegiaturas del estudiante:', error)
      return res.status(500).json({ message: 'Error al obtener las colegiaturas del estudiante' })
    }
  }

  /**
   * Obtener colegiaturas pendientes
   */
  public async getPendientes(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .select(`
          *,
          Matricula (
            matricula_id,
            periodo,
            Estudiante (
              estudiante_id,
              nombre_completo,
              rut
            ),
            Curso (
              curso_id,
              nombre
            )
          )
        `)
        .eq('estado', 'PENDIENTE')
        .order('fecha_vencimiento', { ascending: true })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo colegiaturas pendientes:', error)
      return res.status(500).json({ message: 'Error al obtener las colegiaturas pendientes' })
    }
  }

  /**
   * Obtener colegiaturas vencidas
   */
  public async getVencidas(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .select(`
          *,
          Matricula (
            matricula_id,
            periodo,
            Estudiante (
              estudiante_id,
              nombre_completo,
              rut
            ),
            Curso (
              curso_id,
              nombre
            ),
            Tutor (
              tutor_id,
              nombre_completo,
              telefono,
              email
            )
          )
        `)
        .eq('estado', 'VENCIDO')
        .order('fecha_vencimiento', { ascending: true })

      if (error) throw error

      return res.json(data || [])
    } catch (error: any) {
      console.error('Error obteniendo colegiaturas vencidas:', error)
      return res.status(500).json({ message: 'Error al obtener las colegiaturas vencidas' })
    }
  }

  /**
   * Crear nueva colegiatura
   */
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        matricula_id,
        mes,
        anio,
        monto,
        fecha_vencimiento,
        estado = 'PENDIENTE'
      } = req.body

      // Validar campos requeridos
      if (!matricula_id || !mes || !anio || !monto || !fecha_vencimiento) {
        return res.status(400).json({
          message: 'matricula_id, mes, anio, monto y fecha_vencimiento son requeridos'
        })
      }

      // Validar que la matrícula existe
      const { data: matricula, error: matriculaError } = await supabaseAdmin!
        .from('Matricula')
        .select('matricula_id, estudiante_id')
        .eq('matricula_id', matricula_id)
        .single()

      if (matriculaError || !matricula) {
        return res.status(404).json({ message: 'Matrícula no encontrada' })
      }

      // Verificar si ya existe una colegiatura para este mes/año/matrícula
      const { data: existente, error: existenteError } = await supabaseAdmin!
        .from('Colegiatura')
        .select('colegiatura_id')
        .eq('matricula_id', matricula_id)
        .eq('mes', mes)
        .eq('anio', anio)
        .maybeSingle()

      if (existente) {
        return res.status(400).json({
          message: `Ya existe una colegiatura para ${mes}/${anio}`
        })
      }

      // Crear colegiatura
      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .insert({
          matricula_id,
          mes,
          anio,
          monto,
          fecha_vencimiento,
          estado
        })
        .select(`
          *,
          Matricula (
            matricula_id,
            periodo,
            Estudiante (
              estudiante_id,
              nombre_completo,
              rut
            ),
            Curso (
              curso_id,
              nombre
            )
          )
        `)
        .single()

      if (error) throw error

      return res.status(201).json(data)
    } catch (error: any) {
      console.error('Error creando colegiatura:', error)
      return res.status(500).json({ message: 'Error al crear la colegiatura' })
    }
  }

  /**
   * Generar colegiaturas masivas para una matrícula
   */
  public async generarColegiaturasMasivas(req: Request, res: Response): Promise<Response> {
    try {
      const {
        matricula_id,
        anio,
        meses, // Array de objetos: [{mes: 1, monto: 50000, fecha_vencimiento: '2024-03-05'}, ...]
      } = req.body

      if (!matricula_id || !anio || !Array.isArray(meses) || meses.length === 0) {
        return res.status(400).json({
          message: 'matricula_id, anio y meses (array) son requeridos'
        })
      }

      // Validar que la matrícula existe
      const { data: matricula, error: matriculaError } = await supabaseAdmin!
        .from('Matricula')
        .select('matricula_id')
        .eq('matricula_id', matricula_id)
        .single()

      if (matriculaError || !matricula) {
        return res.status(404).json({ message: 'Matrícula no encontrada' })
      }

      // Preparar datos para inserción
      const colegiaturas = meses.map((m: any) => ({
        matricula_id,
        mes: m.mes,
        anio,
        monto: m.monto,
        fecha_vencimiento: m.fecha_vencimiento,
        estado: 'PENDIENTE' as 'PENDIENTE'|'PAGADO'|'VENCIDO'|'CONDONADO'
      }))

      // Insertar colegiaturas
      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .insert(colegiaturas)
        .select()

      if (error) throw error

      return res.status(201).json({
        message: `${data?.length || 0} colegiaturas creadas exitosamente`,
        colegiaturas: data
      })
    } catch (error: any) {
      console.error('Error generando colegiaturas masivas:', error)
      return res.status(500).json({ message: 'Error al generar las colegiaturas' })
    }
  }

  /**
   * Actualizar colegiatura
   */
  public async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const updateData = req.body

      // Validar que la colegiatura existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Colegiatura')
        .select('colegiatura_id')
        .eq('colegiatura_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Colegiatura no encontrada' })
      }

      // Actualizar
      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('colegiatura_id', id)
        .select(`
          *,
          Matricula (
            matricula_id,
            periodo,
            Estudiante (
              estudiante_id,
              nombre_completo,
              rut
            ),
            Curso (
              curso_id,
              nombre
            )
          )
        `)
        .single()

      if (error) throw error

      return res.json(data)
    } catch (error: any) {
      console.error('Error actualizando colegiatura:', error)
      return res.status(500).json({ message: 'Error al actualizar la colegiatura' })
    }
  }

  /**
   * Registrar pago de colegiatura
   */
  public async registrarPago(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const {
        fecha_pago,
        metodo_pago,
        numero_comprobante
      } = req.body

      if (!fecha_pago) {
        return res.status(400).json({ message: 'fecha_pago es requerida' })
      }

      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .update({
          estado: 'PAGADO',
          fecha_pago,
          metodo_pago,
          numero_comprobante,
          updated_at: new Date().toISOString()
        })
        .eq('colegiatura_id', id)
        .select(`
          *,
          Matricula (
            matricula_id,
            periodo,
            Estudiante (
              estudiante_id,
              nombre_completo,
              rut
            ),
            Curso (
              curso_id,
              nombre
            )
          )
        `)
        .single()

      if (error) throw error
      if (!data) {
        return res.status(404).json({ message: 'Colegiatura no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error registrando pago:', error)
      return res.status(500).json({ message: 'Error al registrar el pago' })
    }
  }

  /**
   * Cambiar estado de colegiatura
   */
  public async cambiarEstado(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const { estado } = req.body

      if (!estado || !['PENDIENTE', 'PAGADO', 'VENCIDO', 'CONDONADO'].includes(estado)) {
        return res.status(400).json({
          message: 'Estado inválido. Debe ser: PENDIENTE, PAGADO, VENCIDO o CONDONADO'
        })
      }

      const { data, error } = await supabaseAdmin!
        .from('Colegiatura')
        .update({
          estado,
          updated_at: new Date().toISOString()
        })
        .eq('colegiatura_id', id)
        .select()
        .single()

      if (error) throw error
      if (!data) {
        return res.status(404).json({ message: 'Colegiatura no encontrada' })
      }

      return res.json(data)
    } catch (error: any) {
      console.error('Error cambiando estado:', error)
      return res.status(500).json({ message: 'Error al cambiar el estado' })
    }
  }

  /**
   * Obtener estadísticas de colegiaturas
   */
  public async getEstadisticas(req: Request, res: Response): Promise<Response> {
    try {
      const { anio } = req.query

      let query = supabaseAdmin!
        .from('Colegiatura')
        .select('estado, monto')

      if (anio) {
        query = query.eq('anio', Number(anio))
      }

      const { data, error } = await query

      if (error) throw error

      // Calcular estadísticas
      const estadisticas = {
        total_colegiaturas: data?.length || 0,
        pendientes: data?.filter(c => c.estado === 'PENDIENTE').length || 0,
        pagadas: data?.filter(c => c.estado === 'PAGADO').length || 0,
        vencidas: data?.filter(c => c.estado === 'VENCIDO').length || 0,
        condonadas: data?.filter(c => c.estado === 'CONDONADO').length || 0,
        monto_total: data?.reduce((sum, c) => sum + c.monto, 0) || 0,
        monto_pendiente: data?.filter(c => c.estado === 'PENDIENTE').reduce((sum, c) => sum + c.monto, 0) || 0,
        monto_vencido: data?.filter(c => c.estado === 'VENCIDO').reduce((sum, c) => sum + c.monto, 0) || 0,
        monto_recaudado: data?.filter(c => c.estado === 'PAGADO').reduce((sum, c) => sum + c.monto, 0) || 0
      }

      return res.json(estadisticas)
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error)
      return res.status(500).json({ message: 'Error al obtener las estadísticas' })
    }
  }

  /**
   * Eliminar colegiatura
   */
  public async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params

      // Verificar que existe
      const { data: existing, error: existingError } = await supabaseAdmin!
        .from('Colegiatura')
        .select('colegiatura_id, estado')
        .eq('colegiatura_id', id)
        .single()

      if (existingError || !existing) {
        return res.status(404).json({ message: 'Colegiatura no encontrada' })
      }

      // No permitir eliminar colegiaturas pagadas
      if (existing.estado === 'PAGADO') {
        return res.status(400).json({
          message: 'No se puede eliminar una colegiatura que ya está pagada'
        })
      }

      const { error } = await supabaseAdmin!
        .from('Colegiatura')
        .delete()
        .eq('colegiatura_id', id)

      if (error) throw error

      return res.json({ message: 'Colegiatura eliminada exitosamente' })
    } catch (error: any) {
      console.error('Error eliminando colegiatura:', error)
      return res.status(500).json({ message: 'Error al eliminar la colegiatura' })
    }
  }
}
