import { Router } from 'express'
import authRoutes from './auth.routes'
import protectedRoutes from './protected.routes'
import schoolRoutes from './school.routes'
import userRoutes from './user.router'
import devRoutes from './dev.routes'
import adminRoutes from './admin.router'
import profesorRoutes from './profesor.router'
import estudianteRoutes from './estudiante.router'
import administrativoRoutes from './administrativo.router'
import tutorRoutes from './tutor.router'
import parentescoRoutes from './parentesco.router'
import asignaturaRoutes from './asignatura.router'
import materiaRoutes from './materia.router'
import cursoRoutes from './curso.router'
import matriculaRoutes from './matricula.router'
import asistenciaRoutes from './asistencia.router'
import evaluacionRoutes from './evaluacion.router'
import resultadoEvaluacionRoutes from './resultadoEvaluacion.router'
import horarioRoutes from './horario.router'
import anioAcademicoRoutes from './anioAcademico.router'
import alertaRoutes from './alerta.router'
import especialidadRoutes from './especialidad.router'
import contratoRoutes from './contrato.router'
import colegiaturaRoutes from './colegiatura.router'
import profesionRoutes from './profesion.router'
import tipoParentescoRoutes from './tipoParentesco.router'
import tipoAlertaRoutes from './tipoAlerta.router'
import tipoAsignaturaRoutes from './tipoAsignatura.router'
import tipoEncuestaRoutes from './tipoEncuesta.router'
import estadoMatriculaRoutes from './estadoMatricula.router'
import nivelCursoRoutes from './nivelCurso.router'
import salaRoutes from './sala.router'
import tallerRoutes from './taller.router'
import grupoTallerRoutes from './grupoTaller.router'
import areaRoutes from './area.router'
import eventoRoutes from './evento.router'
import encuestaRoutes from './encuesta.router'
import encuestaEstudianteRoutes from './encuestaEstudiante.router'
import configuracionColegioRoutes from './configuracionColegio.router'
import datosEstudianteRoutes from './datosEstudiante.router'
import anotacionesRoutes from './anotaciones.router'
import zonaRoutes from './zona.router'
import asignacionAsientoRoutes from './asignacionAsiento.router'
import claseRoutes from './clase.router'

const router = Router()

// Rutas de autenticación
router.use('/auth', authRoutes)

// Rutas de administrador
router.use('/admin', adminRoutes)

// Rutas de colegio
router.use('/school', schoolRoutes)

// Rutas data usuarios
router.use('/users', userRoutes)

// Rutas CRUD por tipo de usuario
router.use('/profesores', profesorRoutes)
router.use('/teachers', profesorRoutes) // Alias para compatibilidad con frontend
router.use('/estudiantes', estudianteRoutes)
router.use('/administrativos', administrativoRoutes)
router.use('/tutores', tutorRoutes)
router.use('/parentescos', parentescoRoutes)

// Rutas CRUD de entidades académicas
router.use('/asignaturas', asignaturaRoutes)
router.use('/materias', materiaRoutes)
router.use('/cursos', cursoRoutes)
router.use('/matriculas', matriculaRoutes)
router.use('/asistencias', asistenciaRoutes)
router.use('/evaluaciones', evaluacionRoutes)
router.use('/resultados-evaluacion', resultadoEvaluacionRoutes)
router.use('/horarios', horarioRoutes)
router.use('/anios-academicos', anioAcademicoRoutes)

// Rutas CRUD de entidades administrativas y de gestión
router.use('/alertas', alertaRoutes)
router.use('/especialidades', especialidadRoutes)
router.use('/contratos', contratoRoutes)
router.use('/colegiaturas', colegiaturaRoutes)
router.use('/profesiones', profesionRoutes)
router.use('/tipos-parentesco', tipoParentescoRoutes)
router.use('/tipos-alerta', tipoAlertaRoutes)
router.use('/tipos-asignatura', tipoAsignaturaRoutes)
router.use('/tipos-encuesta', tipoEncuestaRoutes)
router.use('/estados-matricula', estadoMatriculaRoutes)
router.use('/niveles-curso', nivelCursoRoutes)
router.use('/salas', salaRoutes)
router.use('/talleres', tallerRoutes)
router.use('/grupo-taller', grupoTallerRoutes)
router.use('/areas', areaRoutes)
router.use('/eventos', eventoRoutes)
router.use('/encuestas', encuestaRoutes)
router.use('/encuesta-estudiante', encuestaEstudianteRoutes)
router.use('/configuracion-colegio', configuracionColegioRoutes)
router.use('/datos-estudiante', datosEstudianteRoutes)
router.use('/anotaciones', anotacionesRoutes)
router.use('/zonas', zonaRoutes)

// Rutas de asignación de asientos
router.use('/', asignacionAsientoRoutes)

// Rutas de gestión automática de clases
router.use('/clases', claseRoutes)

// Rutas protegidas
router.use('/protected', protectedRoutes)

// Rutas de desarrollo (solo en dev)
if (process.env.NODE_ENV !== 'production') {
  router.use('/dev', devRoutes)
}

// Ruta de estado
router.get('/status', (_req, res) => {
  res.json({ status: 'ok' })
})

export default router
