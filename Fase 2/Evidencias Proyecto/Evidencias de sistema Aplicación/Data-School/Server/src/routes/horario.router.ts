import { Router } from 'express'
import { HorarioController } from '@/controllers/horario.controller'

const router = Router()
const horarioController = new HorarioController()

// CRUD Horarios
router.post('/', horarioController.create.bind(horarioController))
router.post('/bulk', horarioController.createBulk.bind(horarioController))
router.get('/', horarioController.getAll.bind(horarioController))
router.get('/:id', horarioController.getById.bind(horarioController))
router.get('/curso/:curso_id', horarioController.getByCurso.bind(horarioController))
router.get('/profesor/:profesor_id', horarioController.getByProfesor.bind(horarioController))
router.get('/sala/:sala_id', horarioController.getBySala.bind(horarioController))
router.put('/:id', horarioController.update.bind(horarioController))
router.patch('/:id/disable', horarioController.disable.bind(horarioController))
router.delete('/:id', horarioController.delete.bind(horarioController))

export default router
