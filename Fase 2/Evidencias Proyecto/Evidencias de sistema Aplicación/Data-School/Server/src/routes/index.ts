import { Router } from 'express'
import authRoutes from './auth.routes'
import protectedRoutes from './protected.routes'
import schoolRoutes from './school.routes'
import userRoutes from './user.router'
import devRoutes from './dev.routes'
import profesorRoutes from './profesor.router'
import estudianteRoutes from './estudiante.router'
import administrativoRoutes from './administrativo.router'
import tutorRoutes from './tutor.router'
import asignaturaRoutes from './asignatura.router'
import cursoRoutes from './curso.router'
import matriculaRoutes from './matricula.router'
import asistenciaRoutes from './asistencia.router'
import evaluacionRoutes from './evaluacion.router'
import resultadoEvaluacionRoutes from './resultadoEvaluacion.router'
import horarioRoutes from './horario.router'
import anioAcademicoRoutes from './anioAcademico.router'
import alertaRoutes from './alerta.router'
import salaRoutes from './sala.router'
import tallerRoutes from './taller.router'
import grupoTallerRoutes from './grupoTaller.router'
import areaRoutes from './area.router'
import eventoRoutes from './evento.router'

const router = Router()

// Rutas de autenticación
router.use('/auth', authRoutes)

// Rutas de colegio
router.use('/school', schoolRoutes)

// Rutas data usuarios
router.use('/users', userRoutes)

// Rutas CRUD por tipo de usuario
router.use('/profesores', profesorRoutes)
router.use('/estudiantes', estudianteRoutes)
router.use('/administrativos', administrativoRoutes)
router.use('/tutores', tutorRoutes)

// Rutas CRUD de entidades académicas
router.use('/asignaturas', asignaturaRoutes)
router.use('/cursos', cursoRoutes)
router.use('/matriculas', matriculaRoutes)
router.use('/asistencias', asistenciaRoutes)
router.use('/evaluaciones', evaluacionRoutes)
router.use('/resultados-evaluacion', resultadoEvaluacionRoutes)
router.use('/horarios', horarioRoutes)
router.use('/anios-academicos', anioAcademicoRoutes)

// Rutas CRUD de entidades administrativas y de gestión
router.use('/alertas', alertaRoutes)
router.use('/salas', salaRoutes)
router.use('/talleres', tallerRoutes)
router.use('/inscripciones-taller', grupoTallerRoutes)
router.use('/areas', areaRoutes)
router.use('/eventos', eventoRoutes)

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
