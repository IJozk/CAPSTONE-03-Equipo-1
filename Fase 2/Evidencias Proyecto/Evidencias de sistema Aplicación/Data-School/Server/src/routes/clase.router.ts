/**
 * Rutas para consulta de clases virtuales
 * Las clases se generan dinámicamente desde los horarios
 */

import { Router } from 'express'
import claseController from '@/controllers/clase.controller'
import { authenticate } from '@/middlewares/auth.middleware'

const router = Router()

// Rutas que requieren autenticación
router.use(authenticate)

/**
 * GET /teacher/:profesorId
 * Obtiene las clases de un profesor para un rango de fechas
 * Query params: fecha_inicio, fecha_fin (formato YYYY-MM-DD)
 */
router.get('/teacher/:profesorId', claseController.getTeacherWeeklyClasses.bind(claseController))

export default router
