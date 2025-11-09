import { Router } from 'express'
import { EspecialidadController } from '@/controllers/especialidad.controller'

const router = Router()
const especialidadController = new EspecialidadController()

// Rutas para especialidades
router.get('/', especialidadController.getAll)
router.get('/profesor/:profesor_id', especialidadController.getByProfesor)
router.post('/assign', especialidadController.assignToProfesor)
router.put('/:profesor_id/:especialidad_id', especialidadController.update)
router.delete('/:profesor_id/:especialidad_id', especialidadController.removeFromProfesor)

export default router
