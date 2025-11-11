import { Router } from 'express'
import encuestaEstudianteController from '@/controllers/encuestaEstudiante.controller'
import { authenticate } from '@/middlewares/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Obtener encuestas pendientes de un estudiante
router.get('/pendientes/:estudianteId', encuestaEstudianteController.getPendientes)

// Obtener todas las respuestas de un estudiante
router.get('/estudiante/:estudianteId', encuestaEstudianteController.getByEstudiante)

// Obtener respuesta específica de encuesta y estudiante
router.get(
  '/encuesta/:encuestaId/estudiante/:estudianteId',
  encuestaEstudianteController.getByEncuestaYEstudiante
)

// Verificar si estudiante ya respondió
router.get(
  '/has-respondido/:encuestaId/:estudianteId',
  encuestaEstudianteController.hasRespondido
)

// Obtener estadísticas de una encuesta
router.get('/estadisticas/:encuestaId', encuestaEstudianteController.getEstadisticas)

// Crear respuesta de encuesta
router.post('/', encuestaEstudianteController.create)

// Actualizar respuesta de encuesta
router.put(
  '/encuesta/:encuestaId/estudiante/:estudianteId',
  encuestaEstudianteController.update
)

// Eliminar respuesta de encuesta
router.delete(
  '/encuesta/:encuestaId/estudiante/:estudianteId',
  encuestaEstudianteController.delete
)

export default router
