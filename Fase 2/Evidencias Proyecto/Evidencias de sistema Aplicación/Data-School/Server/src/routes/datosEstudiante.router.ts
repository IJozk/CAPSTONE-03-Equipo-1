import { Router } from 'express'
import { DatosEstudianteController } from '@/controllers/datosEstudiante.controller'

const router = Router()
const datosEstudianteController = new DatosEstudianteController()

router.get('/', datosEstudianteController.getAll)
router.get('/estudiante/:estudiante_id', datosEstudianteController.getByEstudiante)
router.get('/encuesta/:encuesta_id/resumen', datosEstudianteController.getResumen)
router.get('/:encuesta_id/:estudiante_id', datosEstudianteController.getById)
router.post('/', datosEstudianteController.upsert)
router.delete('/:encuesta_id/:estudiante_id', datosEstudianteController.delete)

export default router
