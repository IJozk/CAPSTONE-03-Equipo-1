import { Router } from 'express'
import { SalaController } from '@/controllers/sala.controller'

const router = Router()
const salaController = new SalaController()

// CRUD Salas
router.post('/', salaController.create.bind(salaController))
router.get('/', salaController.getAll.bind(salaController))
router.get('/disponibles', salaController.getDisponibles.bind(salaController))
router.get('/:id', salaController.getById.bind(salaController))
router.get('/:id/disponibilidad', salaController.verificarDisponibilidad.bind(salaController))
router.get('/:id/horario', salaController.getHorario.bind(salaController))
router.put('/:id', salaController.update.bind(salaController))
router.patch('/:id/estado', salaController.cambiarEstado.bind(salaController))
router.delete('/:id', salaController.delete.bind(salaController))

export default router
