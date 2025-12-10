import { Router } from 'express'
import { AsignaturaController } from '@/controllers/asignatura.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { ROLES } from '@/constants/roles'

const router = Router()
const asignaturaController = new AsignaturaController()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /asignaturas
 * Obtener todas las asignaturas con filtros opcionales
 * Query params: curso_id, profesor_id, periodo, estado_activo, tipo_asignatura_id
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/',
  asignaturaController.getAll.bind(asignaturaController)
)

/**
 * GET /asignaturas/:id/attendance-report
 * Obtener reporte de asistencia de una asignatura
 * Query params: start_date, end_date
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/:id/attendance-report',
  asignaturaController.getAttendanceReport.bind(asignaturaController)
)

/**
 * GET /asignaturas/:id
 * Obtener una asignatura por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/:id',
  asignaturaController.getById.bind(asignaturaController)
)

/**
 * GET /asignaturas/curso/:curso_id
 * Obtener asignaturas por curso
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/curso/:curso_id',
  asignaturaController.getByCurso.bind(asignaturaController)
)

/**
 * GET /asignaturas/profesor/:profesor_id
 * Obtener asignaturas por profesor
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/profesor/:profesor_id',
  asignaturaController.getByProfesor.bind(asignaturaController)
)

/**
 * POST /asignaturas
 * Crear una nueva asignatura
 * Acceso: ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.post(
  '/',
  authorize(ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignaturaController.create.bind(asignaturaController)
)

/**
 * PUT /asignaturas/:id
 * Actualizar una asignatura existente
 * Acceso: ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.put(
  '/:id',
  authorize(ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignaturaController.update.bind(asignaturaController)
)

/**
 * DELETE /asignaturas/:id
 * Eliminar (desactivar) una asignatura
 * Acceso: ADMINISTRADOR, DIRECTOR
 */
router.delete(
  '/:id',
  authorize(ROLES.ADMINISTRADOR, ROLES.DIRECTOR),
  asignaturaController.delete.bind(asignaturaController)
)

/**
 * PATCH /asignaturas/:id/activate
 * Activar una asignatura desactivada
 * Acceso: ADMINISTRADOR, DIRECTOR
 */
router.patch(
  '/:id/activate',
  authorize(ROLES.ADMINISTRADOR, ROLES.DIRECTOR),
  asignaturaController.activate.bind(asignaturaController)
)

export default router
