/**
 * Controlador para gestión de clases virtuales
 * Las clases se generan dinámicamente desde los horarios, sin necesidad de almacenarlas
 */

import { Request, Response } from 'express'
import { supabaseAdmin } from '@/config/supabase'

export class ClaseController {
  /**
   * Obtiene las clases de un profesor para una semana específica
   * Genera las clases virtualmente a partir de los horarios
   * GET /api/clases/teacher/:profesorId?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
   */
  public async getTeacherWeeklyClasses(req: Request, res: Response): Promise<Response> {
    try {
      const { profesorId } = req.params
      const { fecha_inicio, fecha_fin } = req.query

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          message: 'Se requieren fecha_inicio y fecha_fin'
        })
      }

      // Obtener todos los horarios activos del profesor
      const { data: horarios, error: horariosError } = await supabaseAdmin!
        .from('Horario')
        .select(`
          horario_id,
          dia_semana,
          hora_inicio,
          hora_termino,
          periodo,
          sala_id,
          Asignatura (
            asignatura_id,
            nombre,
            profesor_id,
            Curso (
              curso_id,
              nombre,
              anio_academico,
              NivelCurso (
                nivel
              )
            )
          ),
          Sala (
            nombre,
            sala_id
          )
        `)
        .eq('Asignatura.profesor_id', profesorId)
        .eq('estado_activo', true)

      if (horariosError) {
        console.error('Error obteniendo horarios:', horariosError)
        return res.status(500).json({
          message: 'Error obteniendo horarios del profesor',
          error: horariosError.message
        })
      }

      if (!horarios || horarios.length === 0) {
        return res.status(200).json([])
      }

      // Obtener los años académicos únicos
      const aniosAcademicosMap = new Map<number, any>()
      const aniosUnicos = [...new Set(
        horarios
          .map(h => h.Asignatura?.Curso?.anio_academico)
          .filter((anio): anio is number => anio !== undefined && anio !== null)
      )]

      // Cargar la información de los años académicos
      for (const anio of aniosUnicos) {
        const { data: aniosAcademicos } = await supabaseAdmin!
          .from('AnioAcademico')
          .select('*')
          .eq('anio', anio)
          .eq('estado_activo', true)
          .limit(1)
          .single()

        if (aniosAcademicos) {
          aniosAcademicosMap.set(anio, aniosAcademicos)
        }
      }

      // Generar clases para cada día en el rango
      const clases: any[] = []
      const fechaInicioDate = new Date(fecha_inicio as string)
      const fechaFinDate = new Date(fecha_fin as string)

      // Iterar por cada día en el rango
      for (let fecha = new Date(fechaInicioDate); fecha <= fechaFinDate; fecha.setDate(fecha.getDate() + 1)) {
        const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay() // Convertir domingo de 0 a 7
        const fechaStr = fecha.toISOString().split('T')[0]

        // Buscar horarios que correspondan a este día
        const horariosDelDia = horarios.filter(h => h.dia_semana === diaSemana)

        for (const horario of horariosDelDia) {
          // Validar que la fecha esté dentro del período académico
          const anioAcademico = aniosAcademicosMap.get(horario.Asignatura?.Curso?.anio_academico)
          if (!this.isDateInAcademicPeriod(fecha, horario, anioAcademico)) {
            continue
          }

          // Verificar si hay asistencia registrada para esta clase
          const { data: asistencias } = await supabaseAdmin!
            .from('Asistencia')
            .select('asistencia_id, estudiante_id, presente')
            .eq('asignatura_id', horario.Asignatura.asignatura_id)
            .eq('fecha', fechaStr)

          const totalEstudiantes = asistencias?.length || 0
          const presentes = asistencias?.filter(a => a.presente).length || 0
          const ausentes = totalEstudiantes - presentes

          clases.push({
            horario_id: horario.horario_id,
            asignatura_id: horario.Asignatura.asignatura_id,
            asignatura_nombre: horario.Asignatura.nombre,
            curso_nombre: horario.Asignatura.Curso?.nombre || '',
            curso_nivel: horario.Asignatura.Curso?.NivelCurso?.nivel || '',
            sala: horario.Sala?.nombre || 'Sin sala',
            fecha: fechaStr,
            dia_semana: diaSemana,
            hora_inicio: horario.hora_inicio,
            hora_termino: horario.hora_termino,
            estado: 'programada',
            asistencia_registrada: totalEstudiantes > 0,
            total_estudiantes: totalEstudiantes > 0 ? totalEstudiantes : undefined,
            presentes: totalEstudiantes > 0 ? presentes : undefined,
            ausentes: totalEstudiantes > 0 ? ausentes : undefined
          })
        }
      }

      // Ordenar por fecha y hora
      clases.sort((a, b) => {
        if (a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha)
        }
        return a.hora_inicio.localeCompare(b.hora_inicio)
      })

      return res.status(200).json(clases)
    } catch (error: any) {
      console.error('Error en getTeacherWeeklyClasses:', error)
      return res.status(500).json({
        message: 'Error obteniendo clases del profesor',
        error: error.message
      })
    }
  }

  /**
   * Valida si una fecha está dentro del período académico del curso
   */
  private isDateInAcademicPeriod(date: Date, horario: any, anioAcademico?: any): boolean {
    try {
      if (!anioAcademico) {
        return true // Si no hay info del año académico, permitir por defecto
      }

      const fechaClase = new Date(date)

      // Validar que la fecha esté dentro del rango del año académico
      const fechaInicio = new Date(anioAcademico.fecha_inicio)
      const fechaTermino = new Date(anioAcademico.fecha_termino)

      if (fechaClase < fechaInicio || fechaClase > fechaTermino) {
        return false
      }

      // Si el horario tiene un período específico, validar adicionalmente
      if (horario.periodo) {
        const periodo = horario.periodo.toUpperCase()

        if (periodo.includes('PRIMER') || periodo === '1ER_SEMESTRE') {
          if (anioAcademico.primer_semestre_inicio && anioAcademico.primer_semestre_fin) {
            const inicioSem1 = new Date(anioAcademico.primer_semestre_inicio)
            const finSem1 = new Date(anioAcademico.primer_semestre_fin)
            return fechaClase >= inicioSem1 && fechaClase <= finSem1
          }
        }

        if (periodo.includes('SEGUNDO') || periodo === '2DO_SEMESTRE') {
          if (anioAcademico.segundo_semestre_inicio && anioAcademico.segundo_semestre_fin) {
            const inicioSem2 = new Date(anioAcademico.segundo_semestre_inicio)
            const finSem2 = new Date(anioAcademico.segundo_semestre_fin)
            return fechaClase >= inicioSem2 && fechaClase <= finSem2
          }
        }
      }

      return true
    } catch (error) {
      console.error('Error validando período académico:', error)
      return true
    }
  }
}

export default new ClaseController()
