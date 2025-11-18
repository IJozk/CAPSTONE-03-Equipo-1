import { Router } from 'express'
import { AsignacionAsientoController } from '@/controllers/asignacionAsiento.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { ROLES } from '@/constants/roles'

const router = Router()
const asignacionAsientoController = new AsignacionAsientoController()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /cursos/:curso_id/asientos
 * Obtener la distribución actual de asientos de un curso
 * Acceso: PROFESOR, ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.get(
  '/cursos/:curso_id/asientos',
  authorize(ROLES.PROFESOR, ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignacionAsientoController.getCursoSeating.bind(asignacionAsientoController)
)

/**
 * GET /cursos/:curso_id/asientos/historial
 * Obtener el historial de distribuciones de asientos de un curso
 * Acceso: PROFESOR, ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.get(
  '/cursos/:curso_id/asientos/historial',
  authorize(ROLES.PROFESOR, ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignacionAsientoController.getCursoSeatingHistory.bind(asignacionAsientoController)
)

/**
 * POST /cursos/:curso_id/asientos
 * Guardar/actualizar la distribución completa de asientos de un curso
 * Body: { asientos: Array<{ position: number, estudiante_id: string | null }>, sala_id?: string }
 * Acceso: PROFESOR, ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.post(
  '/cursos/:curso_id/asientos',
  authorize(ROLES.PROFESOR, ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignacionAsientoController.saveCursoSeating.bind(asignacionAsientoController)
)

/**
 * POST /cursos/:curso_id/asientos/asignar
 * Asignar un estudiante específico a un asiento
 * Body: { estudiante_id: string, num_asiento: number, sala_id?: string }
 * Acceso: PROFESOR, ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.post(
  '/cursos/:curso_id/asientos/asignar',
  authorize(ROLES.PROFESOR, ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignacionAsientoController.assignStudentToSeat.bind(asignacionAsientoController)
)

/**
 * POST /cursos/:curso_id/asientos/remover
 * Remover un estudiante de su asiento
 * Body: { estudiante_id: string }
 * Acceso: PROFESOR, ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.post(
  '/cursos/:curso_id/asientos/remover',
  authorize(ROLES.PROFESOR, ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignacionAsientoController.removeStudentFromSeat.bind(asignacionAsientoController)
)

/**
 * DELETE /cursos/:curso_id/asientos
 * Limpiar toda la distribución de asientos de un curso
 * Acceso: PROFESOR, ADMINISTRADOR, DIRECTOR, ADMINISTRATIVO
 */
router.delete(
  '/cursos/:curso_id/asientos',
  authorize(ROLES.PROFESOR, ROLES.ADMINISTRADOR, ROLES.DIRECTOR, ROLES.ADMINISTRATIVO),
  asignacionAsientoController.clearCursoSeating.bind(asignacionAsientoController)
)

export default router
