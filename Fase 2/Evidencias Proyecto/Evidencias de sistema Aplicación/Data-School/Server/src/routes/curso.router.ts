import { Router } from 'express'
import { CursoController } from '@/controllers/curso.controller'
import { authenticate, authorize } from '@/middlewares/auth.middleware'
import { ROLES } from '@/constants/roles'

const router = Router()
const cursoController = new CursoController()

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * GET /cursos
 * Obtener todos los cursos con filtros opcionales
 * Query params: nivel, anio_academico, generacion
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/',
  cursoController.getAll.bind(cursoController)
)

/**
 * GET /cursos/:id
 * Obtener un curso por ID
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/:id',
  cursoController.getById.bind(cursoController)
)

/**
 * GET /cursos/anio/:anio
 * Obtener cursos por año académico
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/anio/:anio',
  cursoController.getByAnio.bind(cursoController)
)

/**
 * GET /cursos/:id/stats
 * Obtener estadísticas de un curso
 * Acceso: Todos los roles autenticados
 */
router.get(
  '/:id/stats',
  cursoController.getStats.bind(cursoController)
)

/**
 * POST /cursos
 * Crear un nuevo curso
 * Acceso: ADMINISTRADOR, DIRECTOR
 */
router.post(
  '/',
  authorize(ROLES.ADMINISTRADOR, ROLES.DIRECTOR),
  cursoController.create.bind(cursoController)
)

/**
 * PUT /cursos/:id
 * Actualizar un curso existente
 * Acceso: ADMINISTRADOR, DIRECTOR
 */
router.put(
  '/:id',
  authorize(ROLES.ADMINISTRADOR, ROLES.DIRECTOR),
  cursoController.update.bind(cursoController)
)

/**
 * DELETE /cursos/:id
 * Eliminar un curso
 * Acceso: ADMINISTRADOR
 */
router.delete(
  '/:id',
  authorize(ROLES.ADMINISTRADOR),
  cursoController.delete.bind(cursoController)
)

export default router
